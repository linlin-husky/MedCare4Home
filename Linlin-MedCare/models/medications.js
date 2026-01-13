"use strict";

import mongoose from 'mongoose';
import crypto from 'crypto';

const medicationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    dosage: { type: String }, // e.g. "500mg"
    frequency: { type: String }, // e.g. "1 pill"
    timesPerDay: { type: Number, default: 1 },
    instructions: { type: String }, // e.g. "Take with food"
    icon: { type: String, default: 'pill' }, // sun, cloud, moon identifiers for frontend
    createdAt: { type: Date, default: Date.now }
});

const Medication = mongoose.model('Medication', medicationSchema);

function generateId() {
    return crypto.randomUUID();
}

async function addMedication(username, data) {
    const id = generateId();
    const medication = new Medication({
        id,
        username: username.toLowerCase(),
        ...data
    });
    await medication.save();
    return medication.toObject();
}

async function getMedications(username) {
    const meds = await Medication.find({ username: username.toLowerCase() });
    return meds.map(m => m.toObject());
}

async function removeMedication(id, username) {
    await Medication.deleteOne({ id, username: username.toLowerCase() });
}

export default {
    addMedication,
    getMedications,
    removeMedication
};
