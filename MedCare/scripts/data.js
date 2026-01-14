const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const Appointment = require('../models/Appointment');
const MedicalTest = require('../models/MedicalTest');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const Symptom = require('../models/symptoms');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medcare';

async function importData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Appointment.deleteMany({});
        await MedicalTest.deleteMany({});
        await Prescription.deleteMany({});
        await Symptom.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Get a user (or create one for testing)
        let user = await User.findOne({ username: 'testuser' });
        if (!user) {
            user = await User.create({
                username: 'testuser',
                displayName: 'Nico',
                email: 'nico@example.com',
                phone: '555-1234',
                weight: 110,
                height: "5'4",
                bmi: 20
            });
            console.log('👤 Created test user');
        }

        // ...existing appointments code...

        const createdAppointments = await Appointment.insertMany(appointments);
        console.log(`📅 Created ${createdAppointments.length} appointments`);

        // ...existing medical tests code...

        const createdTests = await MedicalTest.insertMany(medicalTests);
        console.log(`🧪 Created ${createdTests.length} medical tests`);

        // ...existing prescriptions code...

        const createdPrescriptions = await Prescription.insertMany(prescriptions);
        console.log(`💊 Created ${createdPrescriptions.length} prescriptions`);

        // Seed symptoms
        const symptoms = [
            {
                userId: user._id,
                symptomName: 'Headache',
                severity: 'moderate',
                description: 'Mild headache around temples',
                onsetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                duration: '2 days',
                relatedMedications: ['Acetaminophen'],
                status: 'ongoing'
            },
            {
                userId: user._id,
                symptomName: 'Fatigue',
                severity: 'mild',
                description: 'General tiredness and lack of energy',
                onsetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                duration: '5 days',
                relatedMedications: [],
                status: 'ongoing'
            },
            {
                userId: user._id,
                symptomName: 'Dry Cough',
                severity: 'mild',
                description: 'Occasional dry cough, worse at night',
                onsetDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                duration: '1 day',
                relatedMedications: ['Lisinopril'],
                status: 'ongoing'
            },
            {
                userId: user._id,
                symptomName: 'Muscle Pain',
                severity: 'mild',
                description: 'Upper back and shoulder pain',
                onsetDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                duration: '1 week',
                relatedMedications: ['Atorvastatin'],
                status: 'resolved'
            },
            {
                userId: user._id,
                symptomName: 'Nausea',
                severity: 'mild',
                description: 'Occasional mild nausea',
                onsetDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                duration: '3 days',
                relatedMedications: [],
                status: 'improving'
            }
        ];

        const createdSymptoms = await Symptom.insertMany(symptoms);
        console.log(`🤒 Created ${createdSymptoms.length} symptoms`);

        console.log('✅ All data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

importData();