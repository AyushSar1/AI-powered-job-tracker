import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoutes from './pages/ProtectedRoutes'
import UpdateJob from './pages/UpdateJob'
import Resume from "./pages/Resume"
import NotFound from './pages/NotFound'
import JobMatches from './pages/JobMatches'
import Chat from './pages/Chat'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoutes>
        <Dashboard />
      </ProtectedRoutes>
    ),
  },
  {
  path: '/chat',
  element: (
    <ProtectedRoutes>
      <Chat />
    </ProtectedRoutes>
    ),
  },
  {
    path: "/resume",
    element: (
      <ProtectedRoutes>
        <Resume />
      </ProtectedRoutes>
    ),
  },
  {
  path: '/job-matches',
  element: (
    <ProtectedRoutes>
      <JobMatches />
    </ProtectedRoutes>
    ),
  },
  {
    path: '/jobs/:id/edit',
    element: (
      <ProtectedRoutes>
        <UpdateJob />
      </ProtectedRoutes>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router