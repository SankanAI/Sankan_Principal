'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Cookies from 'js-cookie';

export default function PrincipalLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    title: '',
    description: '',
    type: 'default'
  })
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (Cookies.get('userId')) {
      // router.push('/')
    }
  }, [email, password, name, router])

  const showToast = (title: string, description: string, type: 'default' | 'destructive' = 'default') => {
    setToast({ show: true, title, description, type })
    setTimeout(() => {
      setToast({ show: false, title: '', description: '', type: 'default' })
    }, 3000)
  }

  const handlePrincipalLogin = async () => {
    try {
      setLoading(true)

      // Validation
      if (!email || !password) {
        showToast('Error', 'Email and password are required', 'destructive')
        return
      }

      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        showToast('Login Error', authError.message, 'destructive')
        return
      }

      if (!authData.user) {
        showToast('Login Error', 'No user found', 'destructive')
        return
      }

      // 2. Check if user exists in principals table and verify status
      const { data: principalData, error: principalError } = await supabase
        .from('principles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (principalError) {
        showToast('Error', 'Principal account not found', 'destructive')
        // Sign out the user since they're not a valid principal
        await supabase.auth.signOut()
        return
      }

      // 3. Check verification status
      if (!principalData.verified) {
        showToast('Account Not Verified', 'Your account is pending verification. Please check your email or contact support.', 'destructive')
        // Sign out since they're not verified
        await supabase.auth.signOut()
        return
      }

      const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('principle_id', principalData.id)
      .single()

    if (schoolError) {
      showToast('Error', 'Could not fetch school data', 'destructive')
      return
    }

    if (!schoolData) {
      showToast('Error', 'No school associated with this principal', 'destructive')
      return
    }

      // 4. If everything is good, set cookies and redirect
      Cookies.set('userId', authData.user.id, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      Cookies.set('userEmail', authData.user.email || '', {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      

      showToast('Success', 'Login successful', 'default')
      console.log(principalData.id)
      console.log(schoolData.id)
      router.push(`/SchoolComponent/TeacherRegistrationForm?principalId=${principalData.id}&schoolId=${schoolData.id}`)

    } catch (err) {
      console.log('Login error:', err)
      showToast('Unexpected Error', 'An unexpected error occurred', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-[#0A0A0B] rounded-lg p-4 w-[95%] lg:w-[30%] ml-[2.5%] lg:ml-[35%] lg:w-[30%] lg:ml-[35%] lg:rounded-[3vh] rounded-0 mt-[7vh] py-13">
        <div className="space-y-6 bg-[#111113] rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-semibold">Principal Login</h2>
          <p className="text-gray-400">Enter your email below to login into your account</p>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1C1C1E] border-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="m@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1C1C1E] border-none placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1C1C1E] border-none"
              />
            </div>
          </div>

          <Button
            onClick={handlePrincipalLogin}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login into Account'}
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg 
            ${toast.type === 'destructive' 
              ? 'bg-red-500' 
              : 'bg-green-500'}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">{toast.title}</div>
              <div className="text-sm">{toast.description}</div>
            </div>
            <button 
              onClick={() => setToast({ show: false, title: '', description: '', type: 'default' })}
              className="ml-4 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}