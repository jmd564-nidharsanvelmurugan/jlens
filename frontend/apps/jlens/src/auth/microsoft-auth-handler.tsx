// src/auth/microsoft-auth-handler.tsx
import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { useNavigate } from 'react-router-dom'
import { loginWithMicrosoft, signupWithMicrosoft, checkUserExists } from '@/actions/server-actions'
import { toast } from 'sonner'
import Loading from '@/components/loader'

const MicrosoftAuthHandler = () => {
  const { instance } = useMsal()
  

  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise()
        if (response) {
          
          const idTokenClaims = response.idTokenClaims as any

          const name = idTokenClaims.name
          const email = idTokenClaims.email || idTokenClaims.preferred_username
          const id = idTokenClaims.oid

          

          const userExistsResponse = await checkUserExists(email)
          // 

          const exists = userExistsResponse?.exists
          // 

          let serverResponse
          if (exists) {
            const accounts = instance.getAllAccounts();
            if (accounts.length > 0) {
              
            }
            serverResponse = await loginWithMicrosoft({ name, email, id });
          } else {
            await signupWithMicrosoft({ name, email, id });
            serverResponse = await loginWithMicrosoft({ name, email, id });
          }
          // Token is now in HTTP-only cookie (set by backend)
          // Only store non-sensitive user info
          sessionStorage.setItem('email', email)
          sessionStorage.setItem('name', name)

          toast.success('Logged in with Microsoft!')
          navigate('/app')
        }
      } catch (err) {
        toast.error('Microsoft login failed.')
        navigate('/login')
      } finally {
        setLoading(false) 
      }
    }

    handleRedirect()
  }, [])
  
  if (loading) {
    return <Loading />
  }

  return null
}

export default MicrosoftAuthHandler