import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const isProcessing = useRef(false)

  useEffect(() => {
    if (isProcessing.current) {
      return
    }
    isProcessing.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const role = params.get('role')

    if (accessToken && refreshToken) {
      try {
        // Clear old tokens
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // Set new tokens
        login(accessToken, refreshToken, role)

        setTimeout(() => {
          // Remove tokens from URL
          window.history.replaceState({}, '', '/auth/callback')

          // Redirect based on role
          if (role === 'admin') {
            navigate('/admin', { replace: true })
          } else if (role === 'staff') {
            navigate('/staff', { replace: true })
          } else {
            navigate('/?auth=success', { replace: true })
          }
        }, 100)
      } catch (error) {
        navigate('/auth?error=login_failed', { replace: true })
      }
    } else {
      navigate('/auth?error=invalid_callback', { replace: true })
    }
  }, [login, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-lg text-gray-600">正在登入...</p>
      </div>
    </div>
  )
}

export default AuthCallback
