import { Link } from 'react-router-dom'
import board from '../assets/Whiteboard.png'

const LandingPage = () => {
  return (
    <div className="container d-flex min-vh-100 align-items-center justify-content-center">
      <div className="row">
        <div className="col-12 col-md-6 me-md-5">
          <img className="w-100" src={board} />
        </div>
        <div className="col-md-5">
          <h1 className="display-2 fw-semibold text-center mt-4">
            Your Career.
            <br />
            <span className="text-primary">Organized.</span>
          </h1>

          <p className="mt-4 fs-5 text-secondary">
            Take control of your job search with a smarter way
            to track applications, manage opportunities, and
            stay on top of every stage of your career journey.
          </p>

          <p className="text-secondary">
            Keep your applications organized in one place,
            monitor your progress from application to interview,
            and use AI-powered resume insights to better
            understand your skills and opportunities.
          </p>

          <Link
            to="/signup"
            className="btn btn-lg btn-primary d-block mt-4"
          >
            Get Started — It's Free
          </Link>

          <p className="text-muted text-center mt-3 small">
            One dashboard. Every opportunity. A clearer path forward.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage