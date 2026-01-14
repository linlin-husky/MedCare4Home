"use strict";

import mongoose from 'mongoose';
import crypto from 'crypto';

const symptomSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, lowercase: true },
    symptomName: { type: String, required: true },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        required: true
    },
    description: { type: String },
    onsetDate: { type: Date, required: true },
    duration: { type: String },
    relatedMedications: [{ type: String }],
    status: {
        type: String,
        enum: ['ongoing', 'improving', 'resolved'],
        default: 'ongoing'
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Symptom = mongoose.model('Symptom', symptomSchema);

function generateId() {
    return crypto.randomUUID();
}

async function addSymptom(username, data) {
    const id = generateId();
    const symptom = new Symptom({
        id,
        username: username.toLowerCase(),
        ...data
    });
    await symptom.save();
    return symptom.toObject();
}

async function getSymptoms(username) {
    const symptoms = await Symptom.find({ username: username.toLowerCase() }).sort({ onsetDate: -1 });
    return symptoms.map(s => s.toObject());
}

async function removeSymptom(id, username) {
    await Symptom.deleteOne({ id, username: username.toLowerCase() });
}

export default {
    addSymptom,
    getSymptoms,
    removeSymptom
};