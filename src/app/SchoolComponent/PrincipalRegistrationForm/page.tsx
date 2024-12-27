"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation'

interface PrincipleFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  schoolName: string;
  schoolAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  schoolType: string;
  board: string;
  registrationNumber: string;
  contactEmail: string;
  contactPhone: string;
}

export default function PrincipleRegistrationForm() {
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [authUser, setauthuser]=useState<string>('');
  const router = useRouter()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PrincipleFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      schoolName: "",
      schoolAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      schoolType: "",
      board: "",
      registrationNumber: "",
      contactEmail: "",
      contactPhone: "",
    }
  })

  const onSubmit = async (data: PrincipleFormData) => {
    try {
      setLoading(true)
      
      // 1. Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'principle'
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        setauthuser(authData.user.id);
      } else {
          throw new Error("User data is not available.");
      }

      // 2. Store principle details in principles table with verification status
      const { data: principleData, error: principleError } = await supabase
        .from('principles')
        .insert({
          user_id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          verified: false  // Set initial verification status to false
        })
        .select('id')
        .single()

      if (principleError) throw principleError

      // 3. Store school details in schools table using the principle's ID
      const { error: schoolError } = await supabase
        .from('schools')
        .insert({
          principle_id: principleData.id,
          name: data.schoolName,
          school_type: data.schoolType,
          board: data.board,
          registration_number: data.registrationNumber
        })

      if (schoolError) throw schoolError

      setOutput('Registration successful! Please wait for admin verification before accessing all features.')
      router.push('/SchoolComponent/login')
      
    } catch (error: any) {
      console.log('Registration error:', error)
      setOutput(error.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[40%] ml-[30%] container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="lg:p-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Principle Registration</CardTitle>
            {output && (
              <p className={output.includes('error') ? 'text-red-600' : 'text-green-600'}>
                {output}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="Principle" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Principle">Principle</TabsTrigger>
                <TabsTrigger value="school">School</TabsTrigger>
              </TabsList>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <TabsContent value="Principle">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name">Full Name</label>
                      <Input
                        className="mt-0"
                        placeholder="Enter your name"
                        {...register("name", {
                          required: "Name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters"
                          }
                        })}
                      />
                      {errors.name && (
                        <h6 className="text-red-600">{errors.name.message}</h6>
                      )}
                    </div>

                    <div>
                      <label>Email</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                      />
                      {errors.email && (
                        <h6 className="text-red-600">{errors.email.message}</h6>
                      )}
                    </div>

                    <div>
                      <label>Phone</label>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\d{10}$/,
                            message: "Invalid phone number"
                          }
                        })}
                      />
                      {errors.phone && (
                        <h6 className="text-red-600">{errors.phone.message}</h6>
                      )}
                    </div>

                    <div>
                      <label>Password</label>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                          }
                        })}
                      />
                      {errors.password && (
                        <h6 className="text-red-600">{errors.password.message}</h6>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="school">
                  <div className="space-y-4">
                    <div>
                      <label>School Name</label>
                      <Input
                        placeholder="Enter school name"
                        {...register("schoolName", {
                          required: "School name is required"
                        })}
                      />
                      {errors.schoolName && (
                        <h6 className="text-red-600">{errors.schoolName.message}</h6>
                      )}
                    </div>

                    <div>
                      <label>School Type</label>
                      <Select
                        onValueChange={(value) => setValue("schoolType", value)}
                        defaultValue={watch("schoolType")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select school type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="charter">Charter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label>Board</label>
                      <Select
                        onValueChange={(value) => setValue("board", value)}
                        defaultValue={watch("board")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cbse">CBSE</SelectItem>
                          <SelectItem value="icse">ICSE</SelectItem>
                          <SelectItem value="state">State Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label>Registration Number</label>
                      <Input
                        placeholder="Enter registration number"
                        {...register("registrationNumber", {
                          required: "Registration number is required"
                        })}
                      />
                      {errors.registrationNumber && (
                        <p className="text-red-600">{errors.registrationNumber.message}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Complete Registration'}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}