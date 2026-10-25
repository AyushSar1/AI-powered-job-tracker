const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const {processResume, analyzeResumeWithMistral} = require("../services/aiService");
const { BadRequestError, NotFoundError } = require('../errors');
const fs = require('fs/promises');
const axios = require('axios');

const uploadResume = async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Please upload a PDF file');
  }

  const existingResume = await Resume.findOne({
    createdBy: req.user.userId,
  });

  let aiResult;

  try {
    aiResult = await processResume(req.file.path);
  } catch (err) {
    console.error('Resume processing error:', err);

    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn(
        `Failed to remove uploaded file: ${req.file.path}`
      );
    }

    throw new BadRequestError(
      'Unable to process uploaded resume'
    );
  }

  let resume;

  try {
    resume = await Resume.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      createdBy: req.user.userId,

      extractedText: aiResult.extractedText,
      embedding: aiResult.embedding,
      embeddingModel: aiResult.embeddingModel,
      embeddingDimension: aiResult.embeddingDimension,
      processedAt: new Date(),
    });
  } catch (err) {
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn(
        `Failed to remove uploaded file: ${req.file.path}`
      );
    }

    throw err;
  }

  try {
    await axios.post(
      `${process.env.PYTHON_SERVICE_URL}/index-resume`,
      {
        resumeId: resume._id.toString(),
        text: aiResult.extractedText,
      }
    );
  } catch (err) {
    console.error('Resume indexing error:', err);

    await Resume.findByIdAndDelete(resume._id);

    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn(
        `Failed to remove uploaded file: ${req.file.path}`
      );
    }

    throw new BadRequestError(
      'Unable to index uploaded resume'
    );
  }

  if (existingResume) {

    try {
      await axios.delete(
        `${process.env.PYTHON_SERVICE_URL}/delete-resume-index`,
        {
          data: {
            resumeId: existingResume._id.toString(),
          },
        }
      );
    } catch (err) {
      console.warn(
        'Failed to delete old FAISS index:',
        err.message
      );
    }

    try {
      await fs.unlink(existingResume.filePath);
    } catch (err) {
      console.warn(
        `Old resume file missing: ${existingResume.filePath}`
      );
    }

    await ResumeAnalysis.findOneAndDelete({
      resume: existingResume._id,
    });

    await Resume.findByIdAndDelete(
      existingResume._id
    );
  }

  res.status(201).json({
    success: true,
    resume,
  });
};

const getResume = async (req, res) => {
  const resume = await Resume.findOne({
    createdBy: req.user.userId,
  });

  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  res.status(200).json({
    success: true,
    resume,
  });
};

const deleteResume = async (req, res) => {

  const resume = await Resume.findOne({
    createdBy: req.user.userId,
  });

  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  try {
    await axios.delete(
      `${AI_SERVICE_URL}/delete-resume-index`,
      {
        data: {
          resumeId: resume._id.toString(),
        },
      }
    );
  } catch (err) {
    console.warn(
      'Failed to delete FAISS index:',
      err.message
    );
  }

  try {
    await fs.unlink(resume.filePath);
  } catch (err) {
    console.log('Resume file already deleted');
  }

  await ResumeAnalysis.findOneAndDelete({
    resume: resume._id,
  });

  await Resume.findByIdAndDelete(
    resume._id
  );

  res.status(200).json({
    success: true,
    msg: 'Resume deleted successfully',
  });
};

const analyzeResume = async (req, res) => {
  const resume = await Resume.findOne({
    createdBy: req.user.userId,
  });

  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  if (!resume.extractedText) {
    throw new BadRequestError(
      'Resume has not been processed yet'
    );
  }

  try {
    const result = await analyzeResumeWithMistral(
      resume.extractedText
    );

    const analysis = await ResumeAnalysis.findOneAndUpdate(
      {resume: resume._id,},
      {
        resume: resume._id,
        score: result.score,
        summary: result.summary,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        missingSkills: result.missingSkills,
        suggestions: result.suggestions,
        model: 'mistral',
        analyzedAt: new Date(),
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      analysis,
    });

  } catch (err) {
    console.error(
      'Resume analysis error:',
      err.message
    );

    throw new BadRequestError(
      'Failed to analyze resume'
    );
  }
};

const getResumeAnalysis = async (req, res) => {
  const resume = await Resume.findOne({
    createdBy: req.user.userId,
  });

  if (!resume) {
    throw new NotFoundError("Resume not found");
  }

  const analysis = await ResumeAnalysis.findOne({
    resume: resume._id,
  });

  if (!analysis) {
    throw new NotFoundError(
      "Resume analysis not found"
    );
  }

  res.status(200).json({
    success: true,
    analysis,
  });
};

module.exports = {uploadResume, getResume, deleteResume, analyzeResume, getResumeAnalysis};