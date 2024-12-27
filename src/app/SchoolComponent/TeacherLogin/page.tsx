'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams } from 'next/navigation'

interface TeacherManagementProps {
  principalId: string;
  schoolId: string;
}

export default function TeacherLogin() {

  const searchParams = useSearchParams()
  
  const principalId = searchParams.get('principalId')
  const schoolId = searchParams.get('schoolId')

  if (!principalId || !schoolId) {
    return (
      <div className="container mt-[4vh] w-[95%] ml-[2.5%]">
        <p className="text-center">Missing required parameters</p>
      </div>
    )
  }

  return (
    <TeacherLoginUI
      principalId={principalId}
      schoolId={schoolId}
    />
  )
}

function TeacherLoginUI({ principalId, schoolId }: TeacherManagementProps) {
  const [teacherId, setTeacherId] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState({
    show: false,
    title: '',
    description: '',
    type: 'default'
  })
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const showToast = (title: string, description: string, type: 'default' | 'destructive' = 'default') => {
    setToast({ show: true, title, description, type })
    setTimeout(() => {
      setToast({ show: false, title: '', description: '', type: 'default' })
    }, 3000)
  }

  const handleTeacherLogin = async () => {
    if (!teacherId || !password) {
      showToast('Error', 'Teacher ID and password are required', 'destructive')
      return
    }

    try {
      // First, query the teachers table to verify the teacher exists with the correct credentials
      console.log(teacherId,principalId )
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('principle_id', principalId)
        .eq('school_id', schoolId)
        .single()

      if (teacherError || !teacherData) {
        showToast('Login Error', 'Invalid teacher credentials', 'destructive')
        return
      }

      // If teacher exists, attempt to sign in using Supabase auth
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: teacherData.email, // Assuming email is stored in teachers table
      //   password: password
      // })

      // if (error) {
      //   showToast('Login Error', error.message, 'destructive')
      //   return
      // }

      // if (data.user) {
      //   // Store teacher info in session if needed
      //   await supabase.auth.updateUser({
      //     data: {
      //       teacher_id: teacherId,
      //       school_id: schoolId,
      //       principal_id: principalId
      //     }
      //   })

        showToast('Success', 'Login successful')
        router.push('/dashboard') // Redirect to teacher dashboard
      // }
    } catch (err) {
      console.error('Unexpected error during login:', err)
      showToast('Unexpected Error', 'An unexpected error occurred', 'destructive')
    }
  }

  return (
    <>
      <div className="bg-[#0A0A0B] rounded-lg p-4 w-[95%] lg:w-[30%] ml-[2.5%] lg:ml-[35%] lg:rounded-[3vh] mt-[7vh] py-13">
        <div className="space-y-6 bg-[#111113] rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-semibold">Teacher Login</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="teacherId" className="text-sm font-medium">
                Teacher User ID
              </label>
              <Input
                id="teacherId"
                placeholder="Enter your Teacher ID"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
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
            onClick={handleTeacherLogin}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Login
          </Button>
        </div>
      </div>

      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg 
            ${toast.type === 'destructive' ? 'bg-red-500' : 'bg-green-500'}`}
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