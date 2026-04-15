import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login, loading, isAuthenticated, user } = useAuth()
  const [form, setForm] = useState({ username: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const loggedInUser = await login({
        usernameOrEmail: form.username,
        password: form.password,
      })
      navigate(loggedInUser.role === 'resident' ? '/portal' : '/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'resident' ? '/portal' : '/admin'} replace />
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 50%, #1b5e20 100%)' }}
    >
      {/* Top branding */}
      <div className="flex flex-col items-center pt-10 pb-6 mt-20">
        <img
          src="/logo.png"
          alt="Barangay Iba"
          className="h-24 w-24 rounded-full border-4 border-white shadow-lg mb-3"
        />
        <h1 className="text-white font-extrabold text-2xl tracking-widest uppercase">
          Barangay Iba
        </h1>
        <p className="text-white/80 text-sm font-semibold tracking-widest uppercase">
          Silang, Cavite
        </p>
      </div>

      {/* Card */}
      <div className="mx-auto w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* LOGIN header bar */}
        <div className="bg-green-900 py-3 text-center">
          <h2 className="text-white font-extrabold text-lg tracking-widest uppercase">Login</h2>
        </div>

        {/* Form area */}
        <div className="flex flex-col items-center px-8 py-6">
          {/* Avatar */}


          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Resident accounts must be approved by an admin before login will work.
            </div>
            {/* Username */}
            <div>
              <label className="flex items-center gap-1.5 text-gray-700 text-sm font-semibold mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Username
              </label>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <span className="bg-gray-100 px-2.5 py-2 border-r border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Juan dela cruz"
                  className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-1.5 text-gray-700 text-sm font-semibold mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <span className="bg-gray-100 px-2.5 py-2 border-r border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••"
                  className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="px-3 py-2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 accent-green-600 rounded"
              />
              <span className="text-sm text-gray-700 font-medium">Remember Me</span>
            </label>

            {/* Login button */}
            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-extrabold py-2.5 rounded tracking-widest uppercase text-sm transition shadow"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-3 text-center">
            <Link to="/register" className="text-green-700 text-xs hover:underline">
              Don't have an account click here!
            </Link>
          </div>

          {/* Help links */}
          <div className="mt-2 flex items-center gap-2 text-xs text-green-700 font-semibold">
            <a href="#" className="hover:underline">Help Center</a>
            <span className="text-gray-400">•</span>
            <a href="#" className="hover:underline">Terms of Use</a>
            <span className="text-gray-400">•</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>

        {/* Footer bar */}
        <div className="bg-green-900 text-white text-xs px-6 py-4 flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <span>Barangay Iba Silang, Cavite</span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              fb.com/BarangayIBAOfficialPage
            </span>
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +63 1234567890
            </span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              barangayIba@gmail.com
            </span>
          </div>
        </div>
      </div>

      <div className="pb-10" />
    </div>
  )
}

export default Login
