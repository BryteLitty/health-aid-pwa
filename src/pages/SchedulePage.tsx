import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, ArrowLeft, Plus, CalendarDays, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import BottomNav from "@/components/BottomNav"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { format, compareAsc, parseISO } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Define type for appointment
interface Appointment {
  id: string
  doctor_name: string
  type: string
  purpose: string
  date: string
  time: string
  notes?: string
  status: string
  user_id: string
  created_at: string
}

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true })

        if (error) throw error
        
        // Get appointments that are today or in the future
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        
        const filteredAppointments = data?.filter(appt => {
          const apptDate = parseISO(appt.date)
          return compareAsc(apptDate, now) >= 0
        }) || []
        
        setAppointments(filteredAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to load appointments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Group appointments by date
  const groupAppointmentsByDate = (appointments: Appointment[]) => {
    const grouped: Record<string, Appointment[]> = {}
    
    appointments.forEach(appointment => {
      const dateKey = appointment.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(appointment)
    })
    
    return grouped
  }

  const groupedAppointments = groupAppointmentsByDate(appointments)

  // Function to format date for a section header
  const formatDateHeader = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.getTime() === today.getTime()) {
        return "Today"
      } else if (date.getTime() === tomorrow.getTime()) {
        return "Tomorrow"
      } else {
        return format(date, "EEEE, MMMM d, yyyy")
      }
    } catch (error) {
      return dateStr
    }
  }

  return (
    <div className="container max-w-xl mx-auto px-4 pb-20 min-h-screen bg-gray-50">
      <header className="py-4 sticky top-0 bg-gray-50 z-10 border-b">
        <h1 className="text-2xl font-bold">Schedule</h1>
      </header>

      <Tabs defaultValue="calendar" className="mt-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <ClipboardList className="h-4 w-4" />
            <span>List</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/add-appointment")}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Card>
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-20 mt-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">No upcoming appointments</h3>
              <p className="text-gray-500 mb-6">
                Schedule your next appointment to stay on track with your health
              </p>
              <Button onClick={() => navigate("/add-appointment")}>
                Book Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
                <div key={date}>
                  <h2 className="text-md font-medium text-gray-700 mb-2">
                    {formatDateHeader(date)}
                  </h2>
                  <div className="space-y-3">
                    {dateAppointments.map(appointment => (
                      <Card 
                        key={appointment.id} 
                        className={`overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors ${
                          appointment.status === "cancelled" 
                            ? "border-l-4 border-l-red-500 bg-red-50/30" 
                            : appointment.status === "completed"
                            ? "border-l-4 border-l-green-500 bg-green-50/30"
                            : "border-l-4 border-l-blue-500"
                        }`}
                        onClick={() => navigate(`/appointment-details/${appointment.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.doctor_name}</h3>
                              <p className="text-sm text-gray-500 mb-1">
                                {appointment.type} - {appointment.purpose}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center">
                                <span className="font-medium">{appointment.time}</span>
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">All Appointments</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/appointments")}
              className="flex items-center gap-1"
            >
              <span>Manage</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">No appointments found</h3>
              <p className="text-gray-500 mb-6">
                Your upcoming appointments will appear here
              </p>
              <Button onClick={() => navigate("/add-appointment")}>
                Book Appointment
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {appointments.map(appointment => (
                <li 
                  key={appointment.id}
                  className="border-b border-gray-100 py-3 px-1 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/appointment-details/${appointment.id}`)}
                >
                  <div>
                    <p className="font-medium">{appointment.doctor_name}</p>
                    <p className="text-sm text-gray-500">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">{format(parseISO(appointment.date), "MMM d, yyyy")}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  )
} 