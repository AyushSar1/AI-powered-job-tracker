const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Types.ObjectId,
      ref: 'Resume',
      required: [true, 'Please provide resume'],
    },

    score: {
      type: Number,
      required: [true, 'Please provide resume score'],
      min: 0,
      max: 100,
    },

    summary: {
      type: String,
      required: [true, 'Please provide resume summary'],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    model: {
      type: String,
      required: [true, 'Please provide AI model'],
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ResumeAnalysisSchema.index(
  { resume: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'ResumeAnalysis',
  ResumeAnalysisSchema
);