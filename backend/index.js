import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Event from './models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5000;
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/mveu";

const JWT_SECRET = process.env.JWT_SECRET || 'viktoria';

app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'));
    }
  }
});

const generateAccessToken = (id, role, login, name, surname, lastname, email, eventId) => {
  const payload = {
    id: id ? id.toString() : null,
    role,
    login,
    name,
    surname,
    lastname,
    email,
    eventId: Array.isArray(eventId)
      ? eventId.map(e => (e ? e.toString() : null)).filter(Boolean)
      : []
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.id && typeof decoded.id !== 'string') {
      decoded.id = String(decoded.id);
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Неверный или просроченный токен' });
  }
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/getevents", async (req, res) => {
  try {
    const events = await Event.find().select('title description imageUrls date location passed').sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error("GET /getevents error:", error);
    res.status(500).json({ message: "Ошибка получения мероприятий" });
  }
});

app.get("/getevent/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }
    res.json(event);
  } catch (error) {
    console.error("GET /getevent error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/addevents", upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "title и description обязательны" });
    }

    const imageUrls = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date: date ? new Date(date) : null,
      location: location?.trim(),
      imageUrls
    });
    const saved = await newEvent.save();

    res.status(201).json({
      message: "Мероприятие добавлено",
      event: saved
    });

  } catch (e) {
    console.error("POST /addevents error:", e);
    if (e.message.includes('Разрешены только изображения')) {
      return res.status(400).json({ message: e.message });
    }
    if (e.name === 'ValidationError') {
      const messages = Object.values(e.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join('; ') });
    }
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/reg", async (req, res) => {
  const { login, name, surname, lastname, password, email } = req.body;
  if (!password?.trim()) return res.status(400).json({ message: "Введите пароль" });
  if (!email?.trim()) return res.status(400).json({ message: "Введите email" });
  if (!login?.trim()) return res.status(400).json({ message: "Введите логин" });

  try {
    const exist = await User.findOne({ login: login.trim() });
    if (exist) {
      return res.status(400).json({ message: "Логин занят" });
    }

    const newUser = new User({
      login: login.trim(),
      name: name?.trim() || '',
      surname: surname?.trim() || '',
      lastname: lastname?.trim() || '',
      password: password.trim(),
      email: email.trim(),
      role: ["user"]
    });
    await newUser.save();
    res.status(201).json({ message: "Пользователь создан" });
  } catch (err) {
    console.error("POST /reg error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email или логин уже используются" });
    }
    res.status(500).json({ message: "Ошибка регистрации" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: "Логин и пароль обязательны" });
    }

    const user = await User.findOne({ login });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const token = generateAccessToken(
      user._id,
      user.role,
      user.login,
      user.name,
      user.surname,
      user.lastname,
      user.email,
      user.eventId
    );

    res.json({ 
      token, 
      role: user.role,
      id: user._id.toString()
    });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/registerevent", authenticate, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
      return res.status(400).json({ message: "eventId обязателен и должен быть строкой" });
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Некорректный ID мероприятия" });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    const event = await Event.findById(eventObjectId);
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Некорректный ID пользователя" });
    }

    const result = await User.updateOne(
      { _id: userId },
      { $addToSet: { eventId: eventObjectId } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Вы уже записаны на это мероприятие" });
    }

    const updatedUser = await User.findById(userId).select('eventId');
    res.status(200).json({
      message: "Вы успешно записались",
      eventIdList: Array.isArray(updatedUser.eventId)
        ? updatedUser.eventId.map(id => id.toString())
        : []
    });

  } catch (e) {
    console.error("CRITICAL ERROR /registerevent:");
    console.error("Error name:", e.name);
    console.error("Message:", e.message);
    res.status(500).json({ 
      message: "Ошибка сервера",
      error: e.name || 'Unknown',
      details: e.message
    });
  }
});

app.post("/unregisterevent", authenticate, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
      return res.status(400).json({ message: "eventId обязателен и должен быть строкой" });
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Некорректный ID мероприятия" });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Некорректный ID пользователя" });
    }

    const result = await User.updateOne(
      { _id: userId },
      { $pull: { eventId: eventObjectId } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Вы не были записаны на это мероприятие" });
    }

    const updatedUser = await User.findById(userId).select('eventId');
    res.status(200).json({
      message: "Вы отписались от мероприятия",
      eventIdList: Array.isArray(updatedUser.eventId)
        ? updatedUser.eventId.map(id => id.toString())
        : []
    });

  } catch (e) {
    console.error("POST /unregisterevent error:", e);
    res.status(500).json({ message: "Ошибка сервера при отписке" });
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Неверный ID пользователя" });
  }

  try {
    const user = await User.findById(id).select('eventId').lean();
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json({ 
      eventId: Array.isArray(user.eventId) 
        ? user.eventId.map(id => id.toString()).filter(Boolean) 
        : [] 
    });
  } catch (e) {
    console.error("GET /user/:id error:", e);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/geteventsbyids", async (req, res) => {
  try {
    const { eventIds } = req.body;
    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(200).json([]);
    }

    const validIds = eventIds
      .filter(id => id && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(200).json([]);
    }

    const events = await Event.find({ _id: { $in: validIds } });
    res.json(events);
  } catch (e) {
    console.error("POST /geteventsbyids error:", e);
    res.status(500).json({ message: "Ошибка получения мероприятий" });
  }
});

app.put("/event/:id/pass", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRole = Array.isArray(req.user.role) ? req.user.role[0] : req.user.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Некорректный ID мероприятия" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { passed: true },
      { new: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    res.json({ message: "Мероприятие отмечено как прошедшее", event: updatedEvent });
  } catch (error) {
    console.error("PUT /event/:id/pass error:", error);
    res.status(500).json({ message: "Ошибка сервера при обновлении мероприятия" });
  }
});

app.delete("/event/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    const userRole = Array.isArray(req.user.role) ? req.user.role[0] : req.user.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Некорректный ID мероприятия" });
    }

    // Find and delete the event
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    res.json({ message: "Мероприятие успешно удалено", event: deletedEvent });
  } catch (error) {
    console.error("DELETE /event/:id error:", error);
    res.status(500).json({ message: "Ошибка сервера при удалении мероприятия" });
  }
});


app.get("/admin/users", authenticate, async (req, res) => {
  try {
    const userRole = Array.isArray(req.user.role) ? req.user.role[0] : req.user.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Доступ запрещён" });
    }

    const users = await User.find().select('name surname lastname email eventId');

    const usersWithInfo = users.map(user => ({
      id: user._id.toString(), 
      fullName: [user.surname, user.name, user.lastname].filter(Boolean).join(' '),
      email: user.email,
      eventCount: Array.isArray(user.eventId) ? user.eventId.length : 0,
      eventIds: Array.isArray(user.eventId)
        ? user.eventId.map(id => id.toString())
        : []
    }));

    res.json(usersWithInfo);
  } catch (error) {
    console.error("GET /admin/users error:", error);
    res.status(500).json({ message: "Ошибка загрузки пользователей" });
  }
});

async function startApp() {
  try {
    await mongoose.connect(DB_URL);
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Ошибка подключения:", error);
    process.exit(1);
  }
}


startApp();