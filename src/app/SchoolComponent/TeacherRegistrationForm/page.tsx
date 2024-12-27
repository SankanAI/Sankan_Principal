"use client";
import { TeacherManagement } from "@/app/SchoolComponent/TeacherRegistrationForm/teacher-upload"
import { useSearchParams } from 'next/navigation'


export default function TeachersPage() {
  const searchParams = useSearchParams()
  
  const principalId = searchParams.get('principalId')
  const schoolId = searchParams.get('schoolId')

  if (!principalId || !schoolId) {
    return (
      <div className="container mt-[4vh] w-[95%] ml-[2.5%]">
        <p>Missing required parameters</p>
      </div>
    )
  }

  return (
    <div className="container mt-[4vh] w-[95%] ml-[2.5%]">
      <TeacherManagement principalId={principalId} schoolId={schoolId} />
    </div>
  )
}