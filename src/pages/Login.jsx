import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, user } = useAuth()
  const error = searchParams.get('error')

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'staff') {
        navigate('/staff', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleLineLogin = () => {
    window.location.href = '/api/auth/line'
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Hero Image (desktop only) */}
      <div className="hidden lg:block relative">
        <img
          src="/images/reviderm_body.jpg"
          alt="ManFei SPA"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Centered slogan */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-serif text-white text-4xl xl:text-5xl tracking-[0.15em] leading-relaxed">
              歡迎回來
            </h2>
            <p className="mt-4 text-white/70 text-sm tracking-[0.3em] uppercase">
              Welcome Back
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="relative flex items-center justify-center bg-[#F9F9F9] px-6 py-16 lg:py-0">
        {/* Back to Home icon */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-[#A89070] transition-colors duration-300"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-sans">返回首頁</span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl text-[#2C3E50] tracking-wider mb-2">
              會員登入
            </h1>
            <p className="font-sans text-gray-400 text-sm tracking-wide">
              專業美容護理服務
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-sans">
                {error === 'invalid_callback' && '登入失敗，請重試'}
                {error === 'unauthorized' && '您需要登入才能訪問此頁面'}
                {!['invalid_callback', 'unauthorized'].includes(error) && '發生錯誤，請重試'}
              </p>
            </div>
          )}

          {/* LINE Login Button */}
          <button
            onClick={handleLineLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#06C755] text-white rounded-lg hover:opacity-90 transition-opacity duration-300 font-sans font-medium shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <span>使用 LINE 登入</span>
          </button>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-sans tracking-wide">或</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-400 font-sans">
            還沒有帳號？{' '}
            <Link
              to="/register"
              className="text-gray-500 hover:text-[#A89070] hover:underline decoration-[#A89070] underline-offset-4 transition-colors duration-300"
            >
              立即註冊
            </Link>
          </p>

          {/* Terms */}
          <p className="mt-8 text-center text-xs text-gray-300 font-sans leading-relaxed">
            登入即表示您同意我們的服務條款和隱私政策
          </p>

          {/* Additional Info */}
          <p className="mt-4 text-center text-xs text-gray-300 font-sans">
            員工和管理員請使用 LINE 帳號登入
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
