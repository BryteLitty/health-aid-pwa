import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, LogOut, User, Mail, Calendar, Bell, Shield, Moon, Sun, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BottomNav from "@/components/BottomNav"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import ConfirmationDialog from "@/components/ConfirmationDialog"
import { Separator } from "@/components/ui/separator"

export default function AccountPage() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out")
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = user?.user_metadata?.name || "User"
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container max-w-xl mx-auto px-4 pb-20">
      <div className="flex items-center justify-between py-4 sticky top-0 bg-gray-50 z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">My Account</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowLogoutDialog(true)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary/90 to-primary text-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xl bg-primary-foreground text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user?.user_metadata?.name || "User"}</h2>
                <p className="text-primary-foreground/80">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm bg-white/10 p-4 rounded-lg">
            <div>
              <p className="text-primary-foreground/70">Member since</p>
              <p className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-primary-foreground/70">Last login</p>
              <p className="font-medium">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email updates</p>
              </div>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch app appearance</p>
              </div>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={setDarkMode} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">Medication and appointment reminders</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access important pages quickly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate("/medications")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span>My Medications</span>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate("/appointments")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <span>My Appointments</span>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate("/health")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <span>Health Records</span>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowLogoutDialog(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <LogOut className="h-4 w-4 text-red-600" />
              </div>
              <span>Log Out</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Version info */}
      <div className="mt-8 text-center text-gray-500 text-xs">
        <p>Health Aid v1.0.0</p>
        <p className="mt-1">© 2023 Health Aid. All rights reserved.</p>
      </div>

      <BottomNav />

      <ConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Log Out"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        confirmVariant="destructive"
      />
    </div>
  )
} 