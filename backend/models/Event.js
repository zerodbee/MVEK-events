import { Schema, model } from 'mongoose';

const EventSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  date: { type: Date },
  location: { type: String, trim: true },
  imageUrls: {
    type: [String],
    validate: [
      {
        validator: arr => arr.length <= 10,
        message: 'Максимум 10 изображений разрешено.',
      },
      {
        validator: arr => arr.every(url => url?.trim()),
        message: 'Каждый URL изображения должен быть непустым.',
      },
    ],
    default: [],
  },
});

export default model('Event', EventSchema);