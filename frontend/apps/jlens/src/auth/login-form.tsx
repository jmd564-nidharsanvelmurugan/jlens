import { useState } from 'react'
import { Button } from '@ui/components/ui/button'
import { Input } from '@ui/components/ui/input'
import { Label } from '@ui/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { MicrosoftSSOButton } from '@/auth/microsoft-sso-button'
import { Loading } from '@/components/common/loading'
import { useRandomBackground } from '../hooks/useRandomBackground'

interface LoginFormProps {
  onEmailLogin: (email: string, password: string) => void
  isLoading: boolean
}

const LoginForm = ({ onEmailLogin, isLoading }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading) {
      onEmailLogin(email, password)
    }
  }
  const backgroundImage = useRandomBackground();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      {isLoading && <Loading size="full" />}
      <div className="w-full max-w-5xl h-[600px] flex flex-col lg:flex-row rounded-xl overflow-hidden shadow-lg relative bg-white">
        {/* Left Side with slash, centered title, light bg motion */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center text-white clip-slash bg-gradient-to-br from-[#4C1D95] to-[#E0E7FF] overflow-hidden min-h-[200px] lg:min-h-full">
          {/* Light abstract motion-style background */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="w-full h-full opacity-5 animate-pulse"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
            >
              <path
                fill="#ffffff"
                fillOpacity="0.2"
                d="M0,128L30,128C60,128,120,128,180,138.7C240,149,300,171,360,160C420,149,480,107,540,90.7C600,75,660,85,720,112C780,139,840,181,900,176C960,171,1020,117,1080,96C1140,75,1200,85,1260,101.3C1320,117,1380,139,1410,149.3L1440,160L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
              />
            </svg>
          </div>

          {/* Centered content */}
          <div className="relative z-10 text-center px-6 py-8">
            <img src="/white-jlens.svg" alt="JLENS" className="h-16 lg:h-24 w-auto mx-auto mb-4 lg:mb-6" />
            <p className="text-base lg:text-lg font-light">AI-Powered Private Document Intelligence</p>
          </div>
          
          {/* Logo - bottom left corner */}
          <div className="absolute bottom-4 left-4 z-10">
            <img 
              src="/logo_light.png" 
              alt="Logo" 
              className="h-5 lg:h-6 w-auto opacity-80"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-cover bg-center z-10 bg-white px-6 lg:px-0"
              style={{ backgroundImage: `url('${backgroundImage}')` }}>
          <div className="space-y-6 max-w-sm w-full mx-auto py-8 lg:py-0">
            <MicrosoftSSOButton />

            <div className="text-center">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                {showForm ? 'Hide Email Sign-In' : 'Sign in with Email/Password'}
              </Button>
            </div>

            {/* Email/Password Form */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                showForm ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password*
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#4C1D95] hover:bg-[#4C1D95cc] text-white font-medium transition-colors"
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm