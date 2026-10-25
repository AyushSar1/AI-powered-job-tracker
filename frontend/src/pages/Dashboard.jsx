import { useEffect, useState } from 'react'
import axiosInstance from '../utils/axios'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../assets/letter-j.png'
import JobCard from '../components/JobCard'

const Dashboard = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])

  const addJob = async (e) => {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)
    const dataObj = Object.fromEntries(data)

    dataObj.skills = dataObj.skills
      ? dataObj.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)
      : []

    try {
      const res = await axiosInstance.post('/jobs', dataObj)
      setJobs([...jobs, res.data.job])
      form.reset()
      alert('New job posted successfully!')
      
    } catch (err) {
      console.log(err)
      alert('Job creation failed!')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    const getJobs = async () => {
      try {
        const res = await axiosInstance.get('/jobs')
        setJobs(res.data.jobs)
      } catch (err) {
        console.log(err)
      }
    }

    getJobs()
  }, [])

  return (
    <>
      <nav className="navbar bg-dark fixed-top">
        <div className="container">
          <Link to="/dashboard" className="navbar-brand">
            <img src={logo} width="40px" alt="Logo" />
          </Link>

          <div className="d-flex gap-2">
            <Link
              to="/resume"
              className="btn btn-outline-light"
            >
              Resume
            </Link>

            <Link
              to="/chat"
              className="btn btn-primary"
            >
              AI Career Assistant
            </Link>

            <Link
              to="/job-matches"
              className="btn btn-outline-light"
            >
              AI Job Matches
            </Link>

            <button
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div
        style={{ marginTop: '7rem', marginBottom: '4rem' }}
        className="container"
      >
        <form
          style={{ maxWidth: '700px', margin: 'auto' }}
          onSubmit={addJob}
          className="border rounded p-4 shadow-sm bg-light"
        >
          <h3 className="mb-4 text-center">Add New Job</h3>

          <input
            className="form-control mb-3"
            type="text"
            name="company"
            placeholder="Company"
            required
          />

          <input
            className="form-control mb-3"
            type="text"
            name="position"
            placeholder="Position"
            required
          />

          <input
            className="form-control mb-3"
            type="text"
            name="location"
            placeholder="Location (Optional)"
          />

          <select
            name="status"
            className="form-control mb-3"
            defaultValue="pending"
          >
            <option value="pending">Pending</option>
            <option value="interview">Interview</option>
            <option value="declined">Declined</option>
          </select>

          <textarea
            className="form-control mb-3"
            name="jobDescription"
            rows="6"
            placeholder="Paste the complete Job Description..."
            required
          />

          <input
            className="form-control mb-3"
            type="text"
            name="skills"
            placeholder="React, Node.js, MongoDB, Express..."
          />

          <textarea
            className="form-control mb-3"
            name="notes"
            rows="4"
            placeholder="Notes (Optional)"
          />

          <input
            className="form-control mb-4"
            type="url"
            name="applicationLink"
            placeholder="Application Link (Optional)"
          />

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
          >
            Add Job
          </button>
        </form>
      </div>

      <div className="container d-flex gap-4 flex-wrap justify-content-center pb-5">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </>
  )
}

export default Dashboard

