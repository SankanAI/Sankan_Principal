"use client";
import { StudentManagement } from "@/app/SchoolComponent/StudentRegistrationForm/student-upload"
import { useSearchParams } from 'next/navigation'

export default function StudentsPage() {
  const searchParams = useSearchParams()
 
  const principalId = searchParams.get('principalId')
  const schoolId = searchParams.get('schoolId')
  const teacherId = searchParams.get('teacherId')

  if (!principalId || !schoolId || !teacherId) {
    return (
      <div className="container mt-[4vh] w-[95%] ml-[2.5%]">
        <p>Missing required parameters</p>
      </div>
    )
  }

  return (
    <div className="container mt-[4vh] w-[95%] ml-[2.5%]">
      <StudentManagement 
        principalId={principalId} 
        schoolId={schoolId} 
        teacherId={teacherId}
      />
    </div>
  )
}