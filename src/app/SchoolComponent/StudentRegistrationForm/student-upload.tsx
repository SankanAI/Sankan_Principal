"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

interface StudentManagementProps {
  principalId: string;
  schoolId: string;
  teacherId: string;
}

interface Student {
  id: string;
  student_id: string;
  name: string;
  roll_no: string;
  class: string;
  section: string;
  parent_email: string;
  parent_phone: string;
  status: string;
  principle_id: string;
  school_id: string;
  teacher_id: string;
  is_final_submitted: boolean;
}

export function StudentManagement({ principalId, schoolId, teacherId }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const supabase = createClientComponentClient();

  const generateStudentId = () => {
    return `STU${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
      .eq('principle_id', principalId)
      .eq('teacher_id', teacherId);

    if (error) {
      alert("Error fetching students");
      return;
    }

    setStudents(data || []);
    setIsFinalSubmitted(data?.[0]?.is_final_submitted || false);
  };

  const recordEditHistory = async (studentId: string, beforeData: Partial<Student>, afterData: Partial<Student>) => {
    const { error } = await supabase
      .from('student_edit_history')
      .insert({
        student_id: studentId,
        edited_by: principalId,
        changes: {
          before: beforeData,
          after: afterData
        }
      });

    if (error) {
      console.error('Failed to record edit history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentData = {
      id: editingStudent?.id || uuidv4(),
      student_id: editingStudent?.student_id || generateStudentId(),
      name: formData.get('name') as string,
      roll_no: formData.get('roll_no') as string,
      class: formData.get('class') as string,
      section: formData.get('section') as string,
      parent_email: formData.get('parent_email') as string,
      parent_phone: formData.get('parent_phone') as string,
      status: 'active',
      principle_id: principalId,
      school_id: schoolId,
      teacher_id: teacherId,
      is_final_submitted: false,
    };

    if (editingStudent) {
      await recordEditHistory(
        editingStudent.id,
        editingStudent,
        studentData
      );
    }

    const { error } = editingStudent
      ? await supabase.from('students').update(studentData).eq('id', studentData.id)
      : await supabase.from('students').insert(studentData);

    if (error) {
      alert("Failed to save student");
      return;
    }

    setIsOpen(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const studentsToUpload = jsonData.map((row: any) => ({
        id: uuidv4(),
        student_id: generateStudentId(),
        name: row['Name'],
        roll_no: row['Roll No'],
        class: row['Class'],
        section: row['Section'],
        parent_email: row['Parent Email'],
        parent_phone: row['Parent Phone'],
        status: 'active',
        principle_id: principalId,
        school_id: schoolId,
        teacher_id: teacherId,
        is_final_submitted: false,
      }));

      const { error } = await supabase.from('students').insert(studentsToUpload);

      if (error) {
        alert("Failed to upload students");
        return;
      }

      fetchStudents();
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFinalSubmit = async () => {
    const { error } = await supabase
      .from('students')
      .update({ is_final_submitted: true })
      .eq('school_id', schoolId)
      .eq('principle_id', principalId)
      .eq('teacher_id', teacherId);

    if (error) {
      alert("Failed to submit finally");
      return;
    }

    setIsFinalSubmitted(true);
    alert("Students list submitted successfully");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Management</CardTitle>
        <div className="flex gap-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button disabled={isFinalSubmitted}>Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingStudent ? 'Edit' : 'Add'} Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>Name</label>
                    <Input name="name" defaultValue={editingStudent?.name} required />
                  </div>
                  <div>
                    <label>Roll No</label>
                    <Input name="roll_no" defaultValue={editingStudent?.roll_no} />
                  </div>
                  <div>
                    <label>Class</label>
                    <Input name="class" defaultValue={editingStudent?.class} required />
                  </div>
                  <div>
                    <label>Section</label>
                    <Input name="section" defaultValue={editingStudent?.section} />
                  </div>
                  <div>
                    <label>Parent Email</label>
                    <Input name="parent_email" type="email" defaultValue={editingStudent?.parent_email} required />
                  </div>
                  <div>
                    <label>Parent Phone</label>
                    <Input name="parent_phone" defaultValue={editingStudent?.parent_phone} />
                  </div>
                </div>
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleBulkUpload}
            disabled={isFinalSubmitted}
          />
          <Button 
            onClick={handleFinalSubmit}
            disabled={isFinalSubmitted || students.length === 0}
          >
            Final Submit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Parent Email</TableHead>
              <TableHead>Parent Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.section}</TableCell>
                <TableCell>{student.roll_no}</TableCell>
                <TableCell>{student.parent_email}</TableCell>
                <TableCell>{student.parent_phone}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingStudent(student);
                        setIsOpen(true);
                      }}
                      disabled={isFinalSubmitted}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const { error } = await supabase
                          .from('students')
                          .delete()
                          .eq('id', student.id);
                        if (error) {
                          alert("Failed to remove student");
                          return;
                        }
                        fetchStudents();
                      }}
                      disabled={isFinalSubmitted}
                    >
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}