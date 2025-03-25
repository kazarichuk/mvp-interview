"use client"

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase/config'
import { getUserProfile, updateUserProfile } from '@/lib/firebase/firestore'
import { updateUserProfile as updateAuthProfile } from '@/lib/firebase/auth'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  User, 
  Building, 
  Users, 
  Briefcase, 
  Save, 
  Loader2 
} from 'lucide-react'
import Header from '@/components/dashboard/Header'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  role: z.string().min(2, "Job title must be at least 2 characters"),
  teamSize: z.string(),
  bio: z.string().optional(),
})

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      company: "",
      role: "",
      teamSize: "",
      bio: "",
    },
  })

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser
      if (!user) {
        router.replace('/auth/login')
        return
      }

      // Fetch user profile data
      const fetchUserProfile = async () => {
        try {
          const result = await getUserProfile(user.uid)
          if (result.profile) {
            form.reset({
              displayName: user.displayName || result.profile.displayName || "",
              company: result.profile.company || "",
              role: result.profile.role || "",
              teamSize: result.profile.teamSize || "1-10",
              bio: result.profile.bio || "",
            })
          }
        } catch (err) {
          console.error("Error fetching user profile:", err)
          setError("Failed to load profile data")
        } finally {
          setLoading(false)
        }
      }

      fetchUserProfile()
    }

    checkAuth()
  }, [form, router])

  async function onSubmit(data: z.infer<typeof profileFormSchema>) {
    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Update Firebase Auth displayName
      await updateAuthProfile(user, {
        displayName: data.displayName
      })

      // Update Firestore profile
      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        company: data.company,
        role: data.role,
        teamSize: data.teamSize,
        bio: data.bio || "",
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-6 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center mb-6">
          <User className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="company">Company Details</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how it appears on your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>Profile updated successfully!</AlertDescription>
                      </Alert>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the name that will be displayed on your profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. HR Manager" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your position within the company
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="A brief description about yourself" 
                              className="min-h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Tell us a little bit about yourself
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={saving} className="w-32">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="company">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Information about your company and recruitment team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>Company information updated successfully!</AlertDescription>
                      </Alert>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="Your company name" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="501-1000">501-1000 employees</option>
                                <option value="1000+">1000+ employees</option>
                              </select>
                            </div>
                          </FormControl>
                          <FormDescription>
                            How large is your organization
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={saving} className="w-32">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </main>
    </div>
  )
}