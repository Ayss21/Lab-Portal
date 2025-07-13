// models/Timetable.js
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    hour: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        default: '',
        trim: true
    },
    faculty: { // New field
        type: String,
        default: '',
        trim: true
    },
    class: {
        type: String,
        default: '',
        trim: true
    },
    isAvailable: { // New field
        type: Boolean,
        default: true
    }
});

const dayScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    timeSlots: [timeSlotSchema]
});

const timetableSchema = new mongoose.Schema({
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true,
        unique: true // Added for consistency - ensures only one timetable per lab
    },
    labName: {
        type: String,
        required: true,
        trim: true
    },
    schedule: [dayScheduleSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {

    collection: "Timetabledb"
});

// Update the updatedAt field before saving
timetableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// This is correct for avoiding 'OverwriteModelError' in development/hot-reloading
module.exports = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);