import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import ResumeCard from '../components/ResumeCard'
import logo from '../assets/letter-j.png'
import ResumeAnalysis from '../components/ResumeAnalysis'

const Resume = () => {
  const navigate = useNavigate()

  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  const getResume = async () => {
    try {
        const res = await axiosInstance.get('/resume')
        setResume(res.data.resume)
    } catch ( err ) {
        console.log(err)
        setResume(null)

    } finally {
        setLoading(false)
    }
  }
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getResume()
  }, [])

  const uploadResume = async (e) => {
    e.preventDefault()

    const form = e.currentTarget

    const data = new FormData(form)

    try {
      const res = await axiosInstance.post('/resume/upload', data)

      setResume(res.data.resume)

      form.reset()

      alert('Resume uploaded successfully!')
    } catch (err) {
      console.log(err)
      alert('Failed to upload resume')
    }
  }

  const deleteResume = async () => {
    const confirmDelete = window.confirm(
      'Delete your current resume?'
    )

    if (!confirmDelete) return

    try {
      await axiosInstance.delete('/resume')

      setResume(null)

      alert('Resume deleted successfully!')
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  if (loading) {
    return (
      <h2 className="text-center mt-5">
        Loading...
      </h2>
    )
  }

  return (
    <>
      <nav className="navbar bg-dark fixed-top">
        <div className="container">
          <Link
            to="/dashboard"
            className="navbar-brand"
          >
            <img
              src={logo}
              width="40px"
              alt="Logo"
            />
          </Link>

          <div className="d-flex gap-2">
            <Link
              to="/dashboard"
              className="btn btn-outline-light"
            >
              Dashboard
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
        className="container"
        style={{
          marginTop: '7rem',
          maxWidth: '700px',
        }}
      >
        <div className="border rounded shadow-sm p-4 bg-light">

          <h2 className="text-center mb-4">
            Resume Management
          </h2>

          <form onSubmit={uploadResume}>

            <input
              className="form-control mb-4"
              type="file"
              name="resume"
              accept=".pdf"
              required
            />

            <button
              className="btn btn-primary w-100"
              type="submit"
            >
              {resume ? 'Replace Resume' : 'Upload Resume'}
            </button>

          </form>

        </div>

        <div className="mt-5">

          {resume ? (
            <ResumeCard
              resume={resume}
              deleteResume={deleteResume}
            />
          ) : (
            <div className="alert alert-info text-center">

              No Resume Uploaded Yet

            </div>
          )}

        </div>

        <div className='mt-5'>
          
          {resume && (
            <ResumeAnalysis key={resume._id} />            
          )}

        </div>

      </div>
    </>
  )
}

export default Resume