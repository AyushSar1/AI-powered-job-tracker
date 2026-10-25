const axios = require('axios');
const Resume = require('../models/Resume');
const Conversation = require('../models/Conversation');
const {generateChatResponse} = require('../services/aiService');
const {getRecentMessages,formatConversationHistory} = require('../utils/conversation');
const {BadRequestError} = require('../errors');
const {routeQuestion, parseToolDecision} = require('../services/agentRouter')
const {executeTool} = require('../services/toolExecutor')


  // const isResumeRelated = (message) => {
  //   const question = message.toLowerCase().trim();

  //   const resumeKeywords = [
  //     'my resume',
  //     'my cv',
  //     'my skills',
  //     'my experience',
  //     'my education',
  //     'my projects',
  //     'my achievements',
  //     'my certifications',
  //     'my qualification',
  //     'my background',
  //     'my work',
  //     'my profile',
  //     'my internship',
  //     'my degree',
  //     'my college',
  //     'my university',
  //     'my technical skills',
  //     'my programming skills',
  //     'my strengths',
  //     'my weaknesses',
  //     'do i have',
  //     'have i worked',
  //     'have i used',
  //     'what skills do i have',
  //     'what projects do i have',
  //     'what experience do i have',
  //   ];

  //   return resumeKeywords.some(
  //     (keyword) =>
  //       question.includes(keyword)
  //   );
  // };

const chat = async (req, res) => {
  const { message } = req.body

  if (!message || !message.trim()) {
    throw new BadRequestError(
      'Please provide a message'
    )
  }

  const question = message.trim()

  const resume = await Resume.findOne({
    createdBy: req.user.userId,
  })

  let conversation

  if (resume) {
    conversation =
      await Conversation.findOne({
        user: req.user.userId,
        resume: resume._id,
      }).sort({
        updatedAt: -1,
      })
  } else {
    conversation =
      await Conversation.findOne({
        user: req.user.userId,
        resume: null,
      }).sort({
        updatedAt: -1,
      })
  }

  const recentMessages =
    getRecentMessages(
      conversation,
      10
    )

  const conversationHistory =
    formatConversationHistory(
      recentMessages
    )

  res.setHeader(
    'Content-Type',
    'text/plain; charset=utf-8'
  )

  let assistantResponse = ''

  try {
    // 1. AI decides which tool to use
    const rawDecision =
      await routeQuestion(question)

    console.log(
      'Router:',
      rawDecision
    )

    // 2. Validate router decision
    const decision =
      parseToolDecision(rawDecision)

    console.log(
      'Tool:',
      decision.tool
    )

    // 3. Execute selected tool
    const toolResult =
      await executeTool({
        tool: decision.tool,
        question,
        resume,
        recentMessages,
        conversationHistory,
      })

    // 4. Stream final answer
    await toolResult.execute(
      (chunk) => {
        assistantResponse += chunk
        res.write(chunk)
      }
    )

    // 5. Save conversation
    try {
      await Conversation.findOneAndUpdate(
        {
          user: req.user.userId,
          resume: resume?._id || null,
        },
        {
          $push: {
            messages: {
              $each: [
                {
                  role: 'user',
                  content: question,
                },
                {
                  role: 'assistant',
                  content:
                    assistantResponse,
                },
              ],
            },
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      )

      console.log(
        'Conversation saved'
      )
    } catch (error) {
      console.error(
        'Failed to save conversation:',
        error.message
      )
    }

    res.end()
  } catch (error) {
    console.error(
      'CHAT ERROR:',
      error.message
    )

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    } else {
      res.end()
    }
  }
}

module.exports = {
  chat,
};