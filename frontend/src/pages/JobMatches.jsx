import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import JobMatchCard from '../components/JobMatchCard'
import logo from '../assets/letter-j.png'

const JobMatches = () => {
  const navigate = useNavigate()

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    const getJobMatches = async () => {
      try {
        const res = await axiosInstance.get('/jobs/matches')

        setMatches(res.data.matches)
      } catch (err) {
        console.log(err)

        setError(
          err.response?.data?.msg ||
            'Failed to load job matches'
        )
      } finally {
        setLoading(false)
      }
    }

    getJobMatches()
  }, [])

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

      {loading && (
        <div
          className="text-center"
          style={{ marginTop: '7rem' }}
        >
          <h3>
            Finding your best job matches...
          </h3>
        </div>
      )}

      {!loading && error && (
        <div
          className="text-center"
          style={{ marginTop: '7rem' }}
        >
          <h3>{error}</h3>

          <Link
            to="/resume"
            className="btn btn-primary mt-3"
          >
            Go to Resume
          </Link>
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            className="container text-center"
            style={{
              marginTop: '7rem',
              marginBottom: '4rem',
            }}
          >
            <h2 className="mb-2">
              AI Job Matches
            </h2>

            <p className="text-muted">
              Jobs ranked by how closely they match
              your current resume
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="text-center">
              <p>
                No matching jobs available.
              </p>

              <Link
                to="/dashboard"
                className="btn btn-primary"
              >
                Add Jobs
              </Link>
            </div>
          ) : (
            <div className="container d-flex gap-4 flex-wrap justify-content-center pb-5">
              {matches.map((match) => (
                <JobMatchCard
                  key={match.job._id}
                  match={match}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default JobMatches