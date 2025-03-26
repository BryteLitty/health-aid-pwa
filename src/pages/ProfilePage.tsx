import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LogOut, Settings, Bell, Shield, HelpCircle } from 'lucide-react'
import supabase from '@/supabase/supabase'
import { toast } from 'sonner'
import BottomNav from '@/components/BottomNav'

const menuItems = [
  {
    icon: Settings,
    label: 'Settings',
    path: '/settings',
  },
  {
    icon: Bell,
    label: 'Notifications',
    path: '/notifications',
  },
  {
    icon: Shield,
    label: 'Privacy & Security',
    path: '/privacy',
  },
  {
    icon: HelpCircle,
    label: 'Help & Support', 
    path: '/help',
  },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Signed out successfully')
      navigate('/login')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error signing out")
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 shadow-sm z-10">
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      {/* Profile Info */}
      <section className="p-4">
        <Card className="p-6 bg-white">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-[#407CE2] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user?.user_metadata?.username || 'User'}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Menu Items */}
      <section className="p-4">
        <Card className="divide-y divide-gray-100">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center space-x-4 p-4 w-full text-left hover:bg-gray-50"
            >
              <item.icon className="h-5 w-5 text-gray-500" />
              <span>{item.label}</span>
            </button>
          ))}
        </Card>
      </section>

      {/* Sign Out Button */}
      <section className="p-4">
        <Button
          variant="destructive"
          className="w-full h-12"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </section>

      <BottomNav />
    </div>
  )
} 