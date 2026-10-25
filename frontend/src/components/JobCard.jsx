import { useNavigate } from 'react-router-dom'

const JobCard = ({ job }) => {
  const navigate = useNavigate()

  return (
    <div
      className="bg-light p-3 rounded-3 shadow-sm"
      style={{ width: '340px' }}
    >
      <h5 className="fw-bold mb-2">{job.position}</h5>

      <p className="mb-1">
        <strong>Company:</strong> {job.company}
      </p>

      {job.location && (
        <p className="mb-1">
          <strong>Location:</strong> {job.location}
        </p>
      )}

      <p className="mb-2">
        <strong>Status:</strong> {job.status}
      </p>

      {job.skills?.length > 0 && (
        <div className="mb-3">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="badge bg-secondary me-1 mb-1"
            >
              {skill}
            </span>
          ))}

          {job.skills.length > 4 && (
            <span className="badge bg-dark">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <button
        onClick={() => navigate(`/jobs/${job._id}/edit`)}
        className="btn btn-dark w-100"
      >
        Edit
      </button>
    </div>
  )
}

export default JobCard