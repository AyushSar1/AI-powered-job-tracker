import { Link, useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { useEffect, useState } from 'react'
import logo from '../assets/letter-j.png'

const UpdateTask = () => {
  const { id } = useParams()
  const [job, setJob] = useState({})
  const navigate = useNavigate()

  const editJob = async (e) => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const dataObj = Object.fromEntries(data)

    dataObj.skills = dataObj.skills
      ? dataObj.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)
      : []

    try {
      await axiosInstance.patch(`/jobs/${id}`, dataObj)
      navigate('/dashboard')
      alert('Job updated successfully!')
    } catch (err) {
      console.log(err)
      alert('Job updation failed!')
    }
  }

  const deleteJob = async () => {
    try {
      await axiosInstance.delete(`/jobs/${id}`)
      navigate('/dashboard')
      alert('Job deleted successfully!')
    } catch (err) {
      console.log(err)
      alert('Job deletion failed!')
    }
  }

  useEffect(() => {
    const getJob = async () => {
      try {
        const res = await axiosInstance.get(`/jobs/${id}`)
        setJob(res.data.job)
      } catch (err) {
        console.log(err)
      }
    }

    getJob()
  }, [id])

  return (
    <>
      <div className="container mt-5 mb-5">
        <form
          style={{ maxWidth: '700px', margin: 'auto' }}
          onSubmit={editJob}
          className="border rounded p-4 shadow-sm bg-light"
        >
          <Link to="/dashboard" className="d-flex justify-content-center">
            <img className="mb-4" src={logo} height="72px" alt="Logo" />
          </Link>

          <h3 className="text-center mb-4">Edit Job</h3>

          <input
            className="form-control mb-3"
            type="text"
            name="company"
            placeholder="Company"
            defaultValue={job.company}
            required
          />

          <input
            className="form-control mb-3"
            type="text"
            name="position"
            placeholder="Position"
            defaultValue={job.position}
            required
          />

          <input
            className="form-control mb-3"
            type="text"
            name="location"
            placeholder="Location"
            defaultValue={job.location}
          />

          <select
            name="status"
            className="form-control mb-3"
            defaultValue={job.status || 'pending'}
            key={job.status || 'loading'}
          >
            <option value="pending">Pending</option>
            <option value="interview">Interview</option>
            <option value="declined">Declined</option>
          </select>

          <textarea
            className="form-control mb-3"
            name="jobDescription"
            rows="6"
            placeholder="Paste the complete Job Description"
            defaultValue={job.jobDescription}
            required
          />

          <input
            className="form-control mb-3"
            type="text"
            name="skills"
            placeholder="React, Node.js, MongoDB"
            defaultValue={job.skills?.join(', ')}
          />

          <textarea
            className="form-control mb-3"
            name="notes"
            rows="4"
            placeholder="Notes"
            defaultValue={job.notes}
          />

          <input
            className="form-control mb-4"
            type="url"
            name="applicationLink"
            placeholder="Application Link"
            defaultValue={job.applicationLink}
          />

          <button
            type="submit"
            className="btn btn-dark w-100 btn-lg mb-2"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={deleteJob}
            className="btn btn-danger w-100 btn-lg"
          >
            Delete Job
          </button>
        </form>
      </div>
    </>
  )
}

export default UpdateTask

