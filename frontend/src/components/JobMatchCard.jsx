import { useState } from 'react'
import axiosInstance from '../utils/axios'

const JobMatchCard = ({ match }) => {
  const { job, fitScore } = match

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getAnalysis = async () => {
    if (analysis) {
    return
  }
    setLoading(true)
    setError('')

    try {
      const res = await axiosInstance.post(
        `/jobs/${job._id}/match-analysis`
      )

      setAnalysis(res.data.analysis)
    } catch (err) {
      console.log(err)

      setError(
        err.response?.data?.msg ||
          'Failed to generate AI analysis'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="bg-light p-4 rounded-2 shadow-sm"
      style={{ width: '320px' }}
    >
      <h5 className="mb-2">{job.position}</h5>

      <p className="mb-1">
        <strong>Company:</strong> {job.company}
      </p>

      {job.location && (
        <p className="mb-1">
          <strong>Location:</strong> {job.location}
        </p>
      )}

      <p className="mb-3">
        <strong>Status:</strong> {job.status}
      </p>

      <div className="mb-3">
        <strong>Resume Match</strong>

        <div className="progress mt-2">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${fitScore}%` }}
            aria-valuenow={fitScore}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {fitScore}%
          </div>
        </div>
      </div>

      {job.skills?.length > 0 && (
        <p className="mb-3">
          <strong>Skills:</strong>{' '}
          {job.skills.join(', ')}
        </p>
      )}

      <button
        type="button"
        onClick={getAnalysis}
        disabled={loading}
        className="btn btn-dark w-100"
      >
        {loading
          ? 'Analyzing...'
          : 'Get AI Analysis'}
      </button>

      {error && (
        <div className="alert alert-danger mt-3 mb-0">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-4">
          <h6>Why this is a match</h6>

          {analysis.strengths?.length > 0 && (
            <div className="mb-3">
              <strong>Strengths</strong>

              <ul className="mt-2">
                {analysis.strengths.map(
                  (strength, index) => (
                    <li key={index}>
                      {strength}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {analysis.gaps?.length > 0 && (
            <div className="mb-3">
              <strong>Potential Gaps</strong>

              <ul className="mt-2">
                {analysis.gaps.map(
                  (gap, index) => (
                    <li key={index}>
                      {gap}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {analysis.summary && (
            <div>
              <strong>Summary</strong>

              <p className="mt-2 mb-0">
                {analysis.summary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JobMatchCard