const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        maxlength: 50,
        trim: true,
    },

    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: 100,
        trim: true,
    },

    status: {
        type: String,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending',
    },

    jobDescription: {
        type: String,
        required: [true, 'Please provide the job description'],
        maxlength: 5000,
        trim: true,
    },

    skills: {
        type: [String],
        default: [],
    },

    notes: {
        type: String,
        default: '',
        maxlength: 2000,
        trim: true,
    },

    applicationLink: {
        type: String,
        default: '',
        trim: true,
    },

    location: {
        type: String,
        default: '',
        maxlength: 100,
        trim: true,
    },

    embedding: {
      type: [Number],
      default: [],
    },

    embeddingDimension: {
      type: Number,
    },

    embeddingModel: {
      type: String,
    },

    embeddingUpdatedAt: {
      type: Date,
    },

    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },

}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);