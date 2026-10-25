import { useState, useEffect } from 'react'
import axiosInstance from '../utils/axios'

const ResumeAnalysis = () => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeResume = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await axiosInstance.post('/resume/analyze')

      setAnalysis(res.data.analysis)
    } catch (err) {
      console.log(err)

      setError(
        err.response?.data?.msg ||
        'Failed to analyze resume'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  const getAnalysis = async () => {
    try {
      const res = await axiosInstance.get(
        '/resume/analysis'
      )

      setAnalysis(res.data.analysis)
    } catch (err) {
      if (err.response?.status !== 404) {
        console.log(err)
      }
    }
  }

  getAnalysis()
  }, [])

  return (
    <div className="mt-4">

      <div className="card shadow-sm">
        <div className="card-body">

          <h4 className="mb-3">
            AI Resume Analysis
          </h4>

          <p className="text-muted">
            Get AI-powered feedback on your resume
            using Mistral.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={analyzeResume}
            disabled={loading}
          >
            {loading
              ? 'Analyzing Resume...'
              : 'Analyze Resume'}
          </button>

          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}

          {analysis && (
            <div className="mt-4">

              <div className="text-center mb-4">
                <h5>Resume Score</h5>

                <h1 className="display-4 fw-bold">
                  {analysis.score}/100
                </h1>
              </div>

              <div className="mb-4">
                <h5>Summary</h5>

                <p>
                  {analysis.summary}
                </p>
              </div>

              <div className="mb-4">
                <h5>Strengths</h5>

                <ul>
                  {analysis.strengths.map(
                    (strength, index) => (
                      <li key={index}>
                        {strength}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h5>Areas to Improve</h5>

                <ul>
                  {analysis.weaknesses.map(
                    (weakness, index) => (
                      <li key={index}>
                        {weakness}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h5>Recommended Skills</h5>

                <ul>
                  {analysis.missingSkills.map(
                    (skill, index) => (
                      <li key={index}>
                        {skill}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <h5>Suggestions</h5>

                <ul>
                  {analysis.suggestions.map(
                    (suggestion, index) => (
                      <li key={index}>
                        {suggestion}
                      </li>
                    )
                  )}
                </ul>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  )
}

export default ResumeAnalysis