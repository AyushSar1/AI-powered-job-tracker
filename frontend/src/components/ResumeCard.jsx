const ResumeCard = ({
  resume,
  deleteResume,
}) => {
  const formatFileSize = (bytes) => {
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="card shadow">

      <div className="card-body">

        <h4 className="card-title mb-4">
          Current Resume
        </h4>

        <p>
          <strong>Filename :</strong>{' '}
          {resume.originalName}
        </p>

        <p>
          <strong>Uploaded :</strong>{' '}
          {formatDate(resume.createdAt)}
        </p>

        <p>
          <strong>Size :</strong>{' '}
          {formatFileSize(resume.fileSize)}
        </p>

        <button
          className="btn btn-danger"
          onClick={deleteResume}
        >
          Delete Resume
        </button>

      </div>
    </div>
  )
}

export default ResumeCard