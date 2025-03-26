import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const App = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to dashboard if user is logged in, otherwise to login
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">Loading...</div>
    </div>
  )
}

export default App
