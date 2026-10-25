const axios = require('axios');
const path = require('path');

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL ||
  'http://127.0.0.1:8000';

const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  'http://127.0.0.1:11434';


const processResume = async (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);

    const response = await axios.post(
      `${PYTHON_SERVICE_URL}/process-resume`,
      {
        filePath: absolutePath,
      }
    );

    return {
      extractedText: response.data.text,
      embedding: response.data.embedding,
      embeddingDimension: response.data.dimension,
      embeddingModel: response.data.model,
    };

  } catch (error) {
    console.error(
      'AI Service Error:',
      error.message
    );

    throw new Error(
      'Unable to process resume.'
    );
  }
};

const getEmbedding = async (text) => {
  try {
    const response = await axios.post(
      `${PYTHON_SERVICE_URL}/embed`,
      {
        text,
      },
      {
        timeout: 30000,
      }
    );

    return {
      embedding: response.data.embedding,
      embeddingDimension: response.data.dimension,
      embeddingModel: response.data.model,
    };
  } catch (error) {
    console.error(
      "Embedding Service Error:",
      error.message
    );

    throw new Error(
      "Unable to generate embedding."
    );
  }
};

const generateWithMistral = async (prompt) => {
  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: 'mistral',
        prompt,
        stream: false,
      }
    );

    return response.data.response;

  } catch (error) {
    console.error(
      'Ollama Service Error:',
      error.message
    );

    throw new Error(
      'Unable to generate AI response.'
    );
  }
};

const buildResumeAnalysisPrompt = (resumeText) => {
  return `
You are an expert technical recruiter and resume reviewer.

Analyze the following resume for a software engineering candidate.

Evaluate it based on:

1. Technical skills
2. Project and work experience
3. Clarity and structure
4. Evidence of impact
5. Relevance to software engineering roles
6. Overall quality

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not include explanations outside the JSON.

The JSON must follow exactly this structure:

{
  "score": number,
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSkills": ["string"],
  "suggestions": ["string"]
}

Rules:

- score must be an integer between 0 and 100.
- summary should be concise and professional.
- strengths should contain 3 to 5 items.
- weaknesses should contain 2 to 5 items.
- missingSkills should contain relevant skills that would strengthen the candidate for software engineering roles.
- suggestions should contain 3 to 5 concrete and actionable improvements.
- Do not invent experience, projects, education, certifications, or skills that are not present in the resume.
- Base your analysis only on the provided resume.
- If information is missing, say so rather than making it up.

RESUME:

${resumeText}
`;
};

const validateResumeAnalysis = (analysis) => {
  if (
    typeof analysis.score !== 'number' ||
    analysis.score < 0 ||
    analysis.score > 100
  ) {
    throw new Error(
      'Invalid resume score returned by AI.'
    );
  }

  if (
    typeof analysis.summary !== 'string'
  ) {
    throw new Error(
      'Invalid resume summary returned by AI.'
    );
  }

  if (!Array.isArray(analysis.strengths)) {
    throw new Error(
      'Invalid resume strengths returned by AI.'
    );
  }

  if (!Array.isArray(analysis.weaknesses)) {
    throw new Error(
      'Invalid resume weaknesses returned by AI.'
    );
  }

  if (!Array.isArray(analysis.missingSkills)) {
    throw new Error(
      'Invalid missing skills returned by AI.'
    );
  }

  if (!Array.isArray(analysis.suggestions)) {
    throw new Error(
      'Invalid resume suggestions returned by AI.'
    );
  }

  return analysis;
};

const analyzeResumeWithMistral = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error('Resume text is empty.');
  }

  const prompt = buildResumeAnalysisPrompt(
    resumeText
  );

  const response = await generateWithMistral(prompt);

  try {
    const analysis = JSON.parse(response);

    return validateResumeAnalysis(analysis);

  } catch (error) {
    console.error(
      'Invalid AI analysis:',
      response
    );

    throw new Error(
      'AI returned an invalid analysis format.'
    );
  }
};

const cosineSimilarity = (vectorA, vectorB) => {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB)
  ) {
    throw new Error('Invalid embedding vectors');
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error(
      'Embedding dimensions do not match'
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA += vectorA[i] * vectorA[i];

    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error(
      'Cannot calculate similarity for zero vector'
    );
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) *
      Math.sqrt(magnitudeB))
  );
};

const calculateJobFitScore = (resumeEmbedding, jobEmbedding) => {
  const similarity = cosineSimilarity(
    resumeEmbedding,
    jobEmbedding
  );

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(similarity * 100)
    )
  );

  return {
    similarity,
    score,
  };
};

const generateJobMatchExplanation = async ({
  resumeText,
  position,
  skills,
  jobDescription,
}) => {
  const prompt = `
    You are an AI career assistant.

    Analyze how well the candidate's resume matches the job
    description.

    Do not calculate or modify the match score.
    The match score has already been calculated separately.

    Identify:

    1. Strong matches between the candidate's experience/skills
      and the job requirements.

    2. Important skill or experience gaps.

    3. A concise explanation of the overall fit.

    Be factual and only use information present in the
    resume and job description.

    Do not invent experience, skills, education, certifications,
    or achievements.

    Provide at most 5 important strengths and at most 5
    important gaps. Prioritize the most relevant ones.

    Only state that a skill is missing if it is not demonstrated
    in the resume. Do not assume the candidate has a skill
    simply because they have a related skill.

    Return ONLY valid JSON in exactly this format:

    {
      "strengths": [
        "string"
      ],
      "gaps": [
        "string"
      ],
      "summary": "string"
    }

    CANDIDATE RESUME:
    ---
    ${resumeText}
    ---

    JOB POSITION:
    ---
    ${position}
    ---

    JOB SKILLS:
    ---
    ${skills?.join(', ') || ''}
    ---

    JOB DESCRIPTION:
    ---
    ${jobDescription || ''}
    ---
    `;

  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: 'mistral',
        prompt,
        stream: false,
        format: 'json',
      }
    );

    const result = JSON.parse(
      response.data.response
    );

    return validateMatchExplanation(result);
  } catch (error) {
    console.error(
      'Match Explanation AI Error:',
      error.message
    );

    throw new Error(
      'Unable to generate job match explanation.'
    );
  }
};

const validateMatchExplanation = (result) => {
  if (
    !result ||
    !Array.isArray(result.strengths) ||
    !Array.isArray(result.gaps) ||
    typeof result.summary !== 'string'
  ) {
    throw new Error(
      'Invalid match explanation format'
    );
  }

  return {
    strengths: result.strengths
      .filter(
        (item) => typeof item === 'string'
      )
      .slice(0, 5),

    gaps: result.gaps
      .filter(
        (item) => typeof item === 'string'
      )
      .slice(0, 5),

    summary: result.summary.trim(),
  };
};

const generateChatResponse = async (message, onChunk) => {
  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: 'mistral',
        prompt: message,
        stream: true,
      },
      {
        responseType: 'stream',
      }
    )

    let buffer = ''

    response.data.on('data', (chunk) => {
      buffer += chunk.toString()

      const lines = buffer.split('\n')

      buffer = lines.pop()

      for (const line of lines) {
        if (!line.trim()) {
          continue
        }

        const data = JSON.parse(line)

        if (data.response) {
          onChunk(data.response)
        }
      }
    })

    await new Promise((resolve, reject) => {
      response.data.on('end', resolve)
      response.data.on('error', reject)
    })
  } catch (error) {
    console.error(
      'AI Chat Error:',
      error.message
    )

    throw new Error(
      'Unable to generate AI response.'
    )
  }
}

module.exports = {
  processResume,
  getEmbedding,
  analyzeResumeWithMistral,
  calculateJobFitScore,
  generateJobMatchExplanation,
  generateChatResponse
};