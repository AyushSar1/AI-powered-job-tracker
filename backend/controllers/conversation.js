const Conversation = require('../models/Conversation');
const Resume = require('../models/Resume');

const getCurrentConversation = async (
  req,
  res
) => {
  const resume = await Resume.findOne({
    createdBy: req.user.userId,
  }).select(
    '_id originalName fileSize processedAt'
  );

  const conversation =
    await Conversation.findOne({
      user: req.user.userId,
      resume: resume?._id || null,
    }).sort({
      updatedAt: -1,
    });

  res.status(200).json({
    success: true,

    resume: resume
      ? {
          _id: resume._id,
          originalName: resume.originalName,
          fileSize: resume.fileSize,
          processedAt: resume.processedAt,
        }
      : null,

    conversation: conversation || null,
  });
};

module.exports = {
  getCurrentConversation,
};