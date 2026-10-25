const axios = require('axios')

const OLLAMA_URL =
  process.env.OLLAMA_URL

const routeQuestion = async (
  question
) => {
  const prompt = `
    You are an AI tool router.

    Your job is to decide which tool should handle the user's CURRENT question.

    Available tools:

    1. general_chat
    Use this for general questions, programming questions, career advice, technical concepts, or casual conversation that does not require the user's personal resume.

    2. resume_search
    Use this when the user asks about information contained in their own resume, such as:
    - skills
    - experience
    - education
    - projects
    - certifications
    - achievements
    - internships
    - qualifications
    - background

    3. job_match
    Use this when the user wants to compare their resume against a job or determine whether their experience matches a job.

    Return ONLY valid JSON.

    The JSON must have this exact structure:

    {
      "tool": "general_chat | resume_search | job_match"
    }

    CURRENT USER QUESTION:
    ${question}

    JSON:
    `

  const response = await axios.post(
    `${OLLAMA_URL}/api/generate`,
    {
      model: 'mistral',
      prompt,
      stream: false,
    }
  )

  return response.data.response
}
 
const allowedTools = [
  'general_chat',
  'resume_search',
  'job_match',
]

const parseToolDecision = (
  response
) => {
  try {
    const cleaned = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const decision =
      JSON.parse(cleaned)

    if (
      !allowedTools.includes(
        decision.tool
      )
    ) {
      throw new Error(
        'Invalid tool selected'
      )
    }

    return decision
  } catch (error) {
    console.error(
      'Tool routing error:',
      error.message
    )

    return {
      tool: 'general_chat'
    }
  }
}

module.exports = {
  routeQuestion,
  parseToolDecision,
}