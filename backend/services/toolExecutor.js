const axios = require('axios')

const {
  generateChatResponse,
} = require('./aiService')

const executeTool = async ({
  tool,
  question,
  resume,
  recentMessages,
  conversationHistory,
}) => {
  switch (tool) {
    case 'general_chat':
      return executeGeneralChat({
        question,
        conversationHistory,
      })

    case 'resume_search':
      return executeResumeSearch({
        question,
        resume,
        recentMessages,
        conversationHistory,
      })

    case 'job_match':
      return executeJobMatch({
        question,
        resume,
        conversationHistory,
      })

    default:
      throw new Error(
        `Unknown tool: ${tool}`
      )
  }
}

const executeGeneralChat = async ({
  question,
  conversationHistory,
}) => {
  const prompt = `
    You are an AI assistant helping a user with their job search and career development.

    Answer the CURRENT user question.

    Response style:
    - Be concise and precise.
    - For simple questions, answer in 1-4 sentences.
    - Only provide a detailed answer when explicitly requested.
    - For greetings, respond naturally in 1 sentence.
    - Do not discuss the user's resume unless asked.

    Conversation History:
    ${conversationHistory}

    CURRENT USER QUESTION:
    ${question}

    FINAL ANSWER:
    `

  return {
    type: 'stream',
    execute: (onChunk) =>
      generateChatResponse(
        prompt,
        onChunk
      ),
  }
}

const executeResumeSearch = async ({
  question,
  resume,
  recentMessages,
  conversationHistory,
}) => {
  if (!resume) {
    const prompt = `
      You are an AI assistant helping a user with their job search and career development.

      The user asked a question that normally requires their personal resume, but they have not uploaded a resume.

      Answer as helpfully as possible without pretending to know their personal information.

      Keep the answer concise.

      Tell the user that uploading a resume would allow you to provide a personalized answer.

      Conversation History:
      ${conversationHistory}

      CURRENT USER QUESTION:
      ${question}

      FINAL ANSWER:
      `

    return {
      type: 'stream',
      execute: (onChunk) =>
        generateChatResponse(
          prompt,
          onChunk
        ),
    }
  }

  const response = await axios.post(
    `${process.env.PYTHON_SERVICE_URL}/rag`,
    {
      resumeId:
        resume._id.toString(),

      question,

      topK: 5,

      conversationHistory: recentMessages,
    }
  )

  const ragPrompt =
    response.data.prompt

  return {
    type: 'stream',
    execute: (onChunk) =>
      generateChatResponse(
        ragPrompt,
        onChunk
      ),
  }
}

const executeJobMatch = async ({
  question,
  resume,
  conversationHistory,
}) => {
  if (!resume) {
    const prompt = `
      You are an AI assistant helping a user with their career.

      The user wants to know how their resume matches a job, but they have not uploaded a resume.

      Tell them that they need to upload a resume before personalized job matching can be performed.

      Keep the response concise.

      CURRENT USER QUESTION:
      ${question}

      FINAL ANSWER:
      `

    return {
      type: 'stream',
      execute: (onChunk) =>
        generateChatResponse(
          prompt,
          onChunk
        ),
    }
  }

    const prompt = `
      You are an AI assistant helping a user with their career.

      The job matching feature is currently under development and is not available yet.

      Thank the user for using the AI Career Assistant and politely let them know that this feature is still being developed and will be improved and available soon.

      Keep the response concise, friendly, and natural.

      Do not attempt to perform job matching or provide a match score.

      CURRENT USER QUESTION:
      ${question}

      FINAL ANSWER:
      `

    return {
      type: 'stream',
      execute: (onChunk) =>
        generateChatResponse(
          prompt,
          onChunk
        ),
    }
  }

module.exports = {
  executeTool,
}