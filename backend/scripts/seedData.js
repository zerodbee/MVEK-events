import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/mveu";

import User from '../models/User.js';
import Event from '../models/Event.js';

const sampleUsers = [
  {
    login: "admin",
    name: "Виктория",
    surname: "Оборотова",
    lastname: "Сергеевна",
    password: "admin",
    role: ["admin"],
    email: "admin@example.com"
  },
  {
    login: "user",
    name: "Пользователь",
    surname: "Пользователев",
    lastname: "Пользователевич",
    password: "user123",
    role: ["user"],
    email: "user@example.com"
  }
];

const sampleEvents = [
  {
    title: "Итоговая конференция 2025",
    description: "Завершающее мероприятие года с подведением результатов и награждением участников.",
    date: new Date("2025-12-15T14:00:00"),
    location: "Большой зал, Главное здание",
    passed: true,
    imageUrls: [
      "/uploads/1767103132757-840854273.webp",
      "/uploads/1767103132760-445945675.jpg"
    ]
  },
  {
    title: "Конференция по веб-разработке",
    description: "Ежегодная конференция для разработчиков веб-приложений, включая мастер-классы и доклады.",
    date: new Date("2026-03-22T10:00:00"),
    location: "Технопарк «Инновация», Зал 3",
    passed: false,
    imageUrls: [
      "/uploads/1767103552413-885978759.jpg",
      "/uploads/1767103552416-815278953.png",
      "/uploads/1767103552419-35700349.webp"
    ]
  },
  {
    title: "Семинар по мобильной разработке",
    description: "Практические занятия по созданию мобильных приложений для iOS и Android.",
    date: new Date("2026-05-18T13:00:00"),
    location: "Лаборатория 205, Корпус Б",
    passed: false,
    imageUrls: [
      "/uploads/1767103585773-789985785.webp",
      "/uploads/1767103585775-984795957.jpg"
    ]
  },
  {
    title: "Воркшоп по искусственному интеллекту",
    description: "Интерактивный воркшоп по применению ИИ в бизнесе и разработке.",
    date: new Date("2025-11-30T11:00:00"),
    location: "Цифровой центр, Аудитория 7",
    passed: false,
    imageUrls: [
      "/uploads/1767103601808-479025706.jpg"
    ]
  },
  {
    title: "Хакатон MVEK 2026",
    description: "48-часовой марафон по созданию IT-решений для реальных задач университета.",
    date: new Date("2026-09-12T09:00:00"),
    location: "Инженерный корпус, Все этажи",
    passed: false,
    imageUrls: [
      "/uploads/1767104549545-927006300.png",
      "/uploads/1767104656708-277504408.jpg",
      "/uploads/1767104764174-888123136.webp"
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Подключение к MongoDB установлено");

    const existingUsers = await User.countDocuments();
    const existingEvents = await Event.countDocuments();
    
    if (existingUsers > 0 || existingEvents > 0) {
      console.log("Данные уже существуют. Пропускаем заполнение.");
      await mongoose.connection.close();
      return;
    }

    await User.deleteMany({});
    await Event.deleteMany({});
    console.log("Существующие данные очищены");

    await User.insertMany(sampleUsers);
    console.log("Пользователи созданы");

    await Event.insertMany(sampleEvents);
    console.log("Мероприятия созданы");

    console.log("База данных успешно заполнена");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Ошибка при заполнении базы данных:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();