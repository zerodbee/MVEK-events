import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = process.env.DB_URL || "mongodb://mongodb:27017/mveu";

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
  },
  {
    login: "testuser",
    name: "Тест",
    surname: "Тестов",
    lastname: "Тестович",
    password: "test123",
    role: ["user"],
    email: "test@example.com"
  }
];

const sampleEvents = [
  {
    title: "Встреча с экспертами",
    description: "Обсуждение актуальных вопросов в области IT и технологий с ведущими специалистами.",
    imageUrls: [
      "/uploads/1767103132757-840854273.webp",
      "/uploads/1767103132760-445945675.jpg"
    ]
  },
  {
    title: "Конференция по веб-разработке",
    description: "Ежегодная конференция для разработчиков веб-приложений, включая мастер-классы и доклады.",
    imageUrls: [
      "/uploads/1767103552413-885978759.jpg",
      "/uploads/1767103552416-815278953.png"
    ]
  },
  {
    title: "Семинар по мобильной разработке",
    description: "Практические занятия по созданию мобильных приложений для iOS и Android.",
    imageUrls: [
      "/uploads/1767103585773-789985785.webp",
      "/uploads/1767103585775-984795957.jpg"
    ]
  },
  {
    title: "Воркшоп по искусственному интеллекту",
    description: "Интерактивный воркшоп по применению ИИ в бизнесе и разработке.",
    imageUrls: [
      "/uploads/1767103601808-479025706.jpg",
      "/uploads/1767104549545-927006300.png"
    ]
  }
];

async function seedDatabase() {
  let connection;
  
  try {
    connection = await mongoose.connect(DB_URL);
    console.log("Подключение к MongoDB установлено");

    const existingUsers = await User.countDocuments();
    const existingEvents = await Event.countDocuments();
    
    if (existingUsers > 0 || existingEvents > 0) {
      console.log("Данные уже существуют в базе данных. Пропускаем заполнение.");
      await mongoose.connection.close();
      return;
    }

    console.log("Очистка существующих данных...");
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log("Существующие данные очищены");

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Создано ${createdUsers.length} пользователей`);

    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Создано ${createdEvents.length} мероприятий`);

    console.log("База данных успешно заполнена образцами данных");
    
    await mongoose.connection.close();
    console.log("Соединение с MongoDB закрыто");
    
  } catch (error) {
    console.error("Ошибка при заполнении базы данных:", error);
    if (connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedDatabase();