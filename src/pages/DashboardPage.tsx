import { Bell, Calendar, Phone, Pill, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import BottomNav from "@/components/BottomNav"
import { useState } from "react"
import ActionMenu from "@/components/ActionMenu"
import { useNavigate } from "react-router-dom"

const DashboardPage = () => {
  const [showActionMenu, setShowActionMenu] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome, John</h1>
            <p className="text-sm text-gray-500">Monday, March 25</p>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </header>

      {/* Health Status Overview */}
      <section className="p-4">
        <Card className="bg-[#407CE2] text-white p-4 rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Health Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-90">Blood Pressure</p>
              <p className="text-xl font-bold">120/80</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Heart Rate</p>
              <p className="text-xl font-bold">72 bpm</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Today's Reminders */}
      <section className="p-4">
        <h2 className="text-lg font-semibold mb-3">Today's Reminders</h2>
        <div className="space-y-3">
          <Card className="p-3 bg-white">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Take Medication</h3>
                <p className="text-sm text-gray-500">Amoxicillin - 2 pills</p>
              </div>
              <p className="ml-auto text-sm text-gray-500">9:00 AM</p>
            </div>
          </Card>
          <Card className="p-3 bg-white">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Doctor Appointment</h3>
                <p className="text-sm text-gray-500">Dr. Smith - Checkup</p>
              </div>
              <p className="ml-auto text-sm text-gray-500">2:30 PM</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="p-4">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-primary/5 border-primary/20"
            onClick={() => navigate("/add-medication")}
          >
            <Pill className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Add Medication</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-primary/5 border-primary/20"
            onClick={() => navigate("/add-appointment")}
          >
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Book Appointment</span>
          </Button>
          <Button 
            variant="outline"
            className="h-24 flex flex-col items-center justify-center space-y-2 bg-white"
            onClick={() => console.log("Contact Doctor")}
          >
            <Phone className="h-6 w-6 text-[#407CE2]" />
            <span>Contact Doctor</span>
          </Button>
          <Button 
            variant="destructive"
            className="h-24 flex flex-col items-center justify-center space-y-2"
            onClick={() => console.log("SOS")}
          >
            <AlertCircle className="h-6 w-6" />
            <span>SOS</span>
          </Button>
        </div>
      </section>

      {/* Action Button */}
      <Button 
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
        onClick={() => setShowActionMenu(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ActionMenu 
        isOpen={showActionMenu}
        onClose={() => setShowActionMenu(false)}
      />

      <BottomNav />
    </div>
  )
}

export default DashboardPage 