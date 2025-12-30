import { Schema, model } from 'mongoose';

const User = new Schema({
    login: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    lastname: { type: String, required: false },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: [{ type: String, required: true }],
    eventId: [{
        type: Schema.Types.ObjectId,
        ref: 'Event',
        default: []
    }]
}, {
    timestamps: true
});

export default model('User', User);