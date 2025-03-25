"use client"

import { useState } from 'react'
import Header from '@/components/dashboard/Header'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle, 
  Bell, 
  Settings, 
  Shield, 
  Trash2, 
  Lock, 
  Mail, 
  Save, 
  Loader2 
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth } from '@/lib/firebase/config'
import { updateUserProfile } from '@/lib/firebase/firestore'
import { useRouter } from 'next/navigation'
import LogoutConfirmation from '@/components/auth/LogoutConfirmation'
import AccountDeletionDialog from '@/components/auth/AccountDeletionDialog'

export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [newCandidateNotifications, setNewCandidateNotifications] = useState(true)
  const [resultNotifications, setResultNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  
  // Privacy settings
  const [dataCollection, setDataCollection] = useState(true)
  const [shareResults, setShareResults] = useState(false)
  
  const handleSaveNotifications = async () => {
    if (!auth.currentUser) return
    
    setSaving(true)
    setSuccess(false)
    setError(null)
    
    try {
      await updateUserProfile(auth.currentUser.uid, {
        notifications: {
          email: emailNotifications,
          newCandidates: newCandidateNotifications,
          results: resultNotifications,
          marketing: marketingEmails
        }
      })
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("Error saving notifications settings:", err)
      setError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }
  
  const handleSavePrivacy = async () => {
    if (!auth.currentUser) return
    
    setSaving(true)
    setSuccess(false)
    setError(null)
    
    try {
      await updateUserProfile(auth.currentUser.uid, {
        privacy: {
          dataCollection,
          shareResults
        }
      })
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("Error saving privacy settings:", err)
      setError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center mb-6">
          <Settings className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>Settings saved successfully!</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails for important updates
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">New Candidate Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new candidates start interviews
                      </p>
                    </div>
                    <Switch
                      checked={newCandidateNotifications}
                      onCheckedChange={setNewCandidateNotifications}
                      disabled={!emailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Result Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when interview results are ready
                      </p>
                    </div>
                    <Switch
                      checked={resultNotifications}
                      onCheckedChange={setResultNotifications}
                      disabled={!emailNotifications}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and services
                      </p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Manage your privacy preferences and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>Settings saved successfully!</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect anonymous usage data to improve our services
                      </p>
                    </div>
                    <Switch
                      checked={dataCollection}
                      onCheckedChange={setDataCollection}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Share Results Anonymously</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve our AI by sharing anonymized interview results
                      </p>
                    </div>
                    <Switch
                      checked={shareResults}
                      onCheckedChange={setShareResults}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePrivacy} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  Account Management
                </CardTitle>
                <CardDescription>
                  Manage your account settings and access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Email & Password</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email Address</p>
                          <p className="text-sm text-muted-foreground">
                            {auth.currentUser?.email || 'Not available'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => router.push('/auth/forgot-password')}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
                  <div className="border border-destructive/30 rounded-md p-4 bg-destructive/5">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <AccountDeletionDialog />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium">Sign Out</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sign out from your account on this device
                        </p>
                        <LogoutConfirmation 
                          trigger={
                            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                              Sign Out
                            </Button>
                          } 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}