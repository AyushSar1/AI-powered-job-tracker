const mongoose = require('mongoose')

const ResumeSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    filename: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },

    extractedText: {
      type: String,
      default: "",
    },

    embedding: {
      type: [Number],
      default: [],
    },

    embeddingModel: {
      type: String,
      default: "",
    },

    embeddingDimension: {
      type: Number,
      default: 0,
    },

    processedAt: {
      type: Date,
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Resume', ResumeSchema)