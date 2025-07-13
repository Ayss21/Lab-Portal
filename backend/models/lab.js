// models/Lab.js
const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
  {
    labName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    equipments: {
      type: String,
      required: true,
      trim: true,
    },
    availableSystem: {
      type: Number,
      required: true,
      min: 0,
    },
    workingSystem: {
      type: Number,
      required: true,
      min: 0,
    },
    incharge: {
      type: String,
      required: true,
      trim: true,
    },
    technician: {
      type: String,
      required: true,
      trim: true,
    },
    software: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      type: String,
      required: true,
      trim: true,
    },
    labType: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Add this option to explicitly define the collection name
    collection: "Labsdb", // <--- CRITICAL CHANGE HERE
  }
);

// Update the updatedAt field before saving
labSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
module.exports = mongoose.models.Lab || mongoose.model("Lab", labSchema);
