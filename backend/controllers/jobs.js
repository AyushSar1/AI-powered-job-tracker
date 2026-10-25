const { BadRequestError } = require("../errors");
const Job = require("../models/Job");
const Resume = require('../models/Resume');
const {NotFoundError} = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { getEmbedding, calculateJobFitScore, generateJobMatchExplanation } = require("../services/aiService");

const getAllJobs = async (req, res) => {
    const {userId} = req.user;
    const jobs = await Job.find({ createdBy: userId}).sort("createdAt");
    res.status(StatusCodes.OK).json({count: jobs.length, jobs});
};

const getJob = async (req, res) => {
    const {userId} = req.user;
    const {id: jobId} = req.params;

    const job = await Job.findOne({ createdBy: userId, _id: jobId});

    if(!job){
        throw new NotFoundError("Job not Found");
    }

    res.status(StatusCodes.OK).json({ job });
};

const createJobEmbeddingText = ({position, skills, jobDescription}) => {
  return `
Position: ${position}

Skills: ${skills?.join(', ') || ''}

Job Description:
${jobDescription || ''}
  `.trim();
};

const createJob = async (req, res) => {
  const { userId } = req.user;

  const jobData = {
    ...req.body,
    createdBy: userId,
  };

  const embeddingText = createJobEmbeddingText(jobData);

  try {
    const {
      embedding,
      embeddingDimension,
      embeddingModel,
    } = await getEmbedding(embeddingText);

    jobData.embedding = embedding;
    jobData.embeddingDimension = embeddingDimension;
    jobData.embeddingModel = embeddingModel;
    jobData.embeddingUpdatedAt = new Date();
  } catch (error) {
    console.error(
      'Job embedding generation failed:',
      error.message
    );

    throw new BadRequestError(
      'Unable to process job embedding'
    );
  }

  const job = await Job.create(jobData);

  res.status(StatusCodes.CREATED).json({
    job,
  });
};

const updateJob = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const existingJob = await Job.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!existingJob) {
    throw new NotFoundError('Job not found');
  }

  const embeddingFieldsChanged =
    req.body.position !== undefined ||
    req.body.skills !== undefined ||
    req.body.jobDescription !== undefined;

  const updateData = {
    ...req.body,
  };

  if (embeddingFieldsChanged) {
    const embeddingText = createJobEmbeddingText({
      position:
        req.body.position !== undefined
          ? req.body.position
          : existingJob.position,

      skills:
        req.body.skills !== undefined
          ? req.body.skills
          : existingJob.skills,

      jobDescription:
        req.body.jobDescription !== undefined
          ? req.body.jobDescription
          : existingJob.jobDescription,
    });

    try {
      const {
        embedding,
        embeddingDimension,
        embeddingModel,
      } = await getEmbedding(embeddingText);

      updateData.embedding = embedding;
      updateData.embeddingDimension = embeddingDimension;
      updateData.embeddingModel = embeddingModel;
      updateData.embeddingUpdatedAt = new Date();

    } catch (error) {
      console.error(
        'Job embedding generation failed:',
        error.message
      );

      throw new BadRequestError(
        'Unable to process job embedding'
      );
    }
  }

  const updatedJob = await Job.findOneAndUpdate(
    {
      _id: id,
      createdBy: userId,
    },
    updateData,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  res.status(StatusCodes.OK).json({
    job: updatedJob,
  });
};

const deleteJob = async (req, res) => {
    const {userId} = req.user;
    const {id: jobId} = req.params;

    const job = await Job.findOneAndDelete({ createdBy: userId, _id: jobId});

    if(!job){
        throw new NotFoundError("Job not Found");
    }

    res.status(StatusCodes.OK).send();
};

const getJobMatches = async (req, res) => {
  const { userId } = req.user;

  const resume = await Resume.findOne({
    createdBy: userId,
  });

  if (!resume) {
    throw new NotFoundError(
      'Please upload a resume first'
    );
  }

  if (
    !resume.embedding ||
    resume.embedding.length === 0
  ) {
    throw new BadRequestError(
      'Resume embedding not available'
    );
  }

  const jobs = await Job.find({
    createdBy: userId,
    status: {
      $ne: 'declined',
    },
  });

  const matches = [];

  for (const job of jobs) {
    if (
      !job.embedding ||
      job.embedding.length === 0
    ) {
      continue;
    }

    const { similarity, score } =
      calculateJobFitScore(
        resume.embedding,
        job.embedding
      );

      matches.push({
        job,
      similarity,
      fitScore: score,
      });
  }

  matches.sort(
    (a, b) => b.fitScore - a.fitScore
  );

  res.status(StatusCodes.OK).json({
    matches,
  });
};

const getJobMatchAnalysis = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const resume = await Resume.findOne({
    createdBy: userId,
  });

  if (!resume) {
    throw new NotFoundError(
      'Please upload a resume first'
    );
  }

  if (!resume.extractedText) {
    throw new BadRequestError(
      'Resume text is not available'
    );
  }

  const job = await Job.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!job) {
    throw new NotFoundError(
      'Job not found'
    );
  }

  try {
    const analysis =
      await generateJobMatchExplanation({
        resumeText: resume.extractedText,
        position: job.position,
        skills: job.skills,
        jobDescription: job.jobDescription,
      });

    res.status(StatusCodes.OK).json({
      jobId: job._id,
      analysis,
    });
  } catch (error) {
    console.error(
      'Job match analysis error:',
      error.message
    );

    throw new BadRequestError(
      'Unable to generate job match analysis'
    );
  }
};

module.exports = { getAllJobs, getJob, createJob, updateJob, deleteJob, getJobMatches, getJobMatchAnalysis};