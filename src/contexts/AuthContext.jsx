import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../api/axios'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      // If we're on the OAuth callback page, skip auto-init.
      // AuthCallback will call login() directly after extracting tokens from URL.
      if (window.location.pathname === '/auth/callback') {
        setLoading(false)
        return
      }

      const token = localStorage.getItem('access_token')
      
      if (token) {
        try {
          // Decode JWT to get user info
          const decoded = jwtDecode(token)
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired, try refresh
            await refreshToken()
          } else {
            // Fetch full user data from backend
            const response = await api.get('/api/auth/me')
            setUser(response.data)
          }
        } catch (error) {
          logout()
        }
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = (accessToken, refreshToken, userRole) => {
    // Store tokens (axios interceptor will automatically use them)
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    
    // Decode token to get user info
    const decoded = jwtDecode(accessToken)

    const finalUser = {
      id: decoded.sub,
      role: decoded.role || userRole,
    }
    
    setUser(finalUser)
  }

  const logout = () => {

    // Clear tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    
    // Clear user state
    setUser(null)
  }

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        throw new Error('No refresh token')
      }

      const response = await api.post('/api/auth/refresh', {
        refresh_token: refresh,
      })

      const { access_token, refresh_token } = response.data
      login(access_token, refresh_token)
      
      return access_token
    } catch (error) {
      logout()
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
