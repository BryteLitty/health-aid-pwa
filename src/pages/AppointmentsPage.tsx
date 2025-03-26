import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon, ArrowLeft, MoreVertical, Plus, SearchIcon, FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import BottomNav from "@/components/BottomNav"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ConfirmationDialog from "@/components/ConfirmationDialog"

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

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch appointments from Supabase
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
        setAppointments(data || [])
        setFilteredAppointments(data || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to load appointments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Filter appointments based on search term and status
  useEffect(() => {
    let result = appointments

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(appointment => 
        appointment.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        appointment =>
          appointment.doctor_name.toLowerCase().includes(term) ||
          appointment.purpose.toLowerCase().includes(term) ||
          appointment.type.toLowerCase().includes(term)
      )
    }

    setFilteredAppointments(result)
  }, [searchTerm, statusFilter, appointments])

  const handleEditAppointment = (id: string) => {
    navigate(`/edit-appointment/${id}`)
  }

  const handleCancelClick = (id: string) => {
    setAppointmentToCancel(id)
    setShowCancelDialog(true)
  }

  const handleCloseCancelDialog = () => {
    setShowCancelDialog(false)
    setAppointmentToCancel(null)
  }

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentToCancel)

      if (error) throw error

      // Update local state
      setAppointments(appointments.filter(appt => appt.id !== appointmentToCancel))
      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast.error("Failed to cancel appointment")
    } finally {
      setShowCancelDialog(false)
      setAppointmentToCancel(null)
    }
  }

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)

      if (error) throw error

      // Update local state
      setAppointments(
        appointments.map(appt => 
          appt.id === id ? { ...appt, status } : appt
        )
      )
      
      toast.success(`Appointment marked as ${status}`)
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast.error("Failed to update appointment status")
    }
  }

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

  const groupedAppointments = groupAppointmentsByDate(filteredAppointments)

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
          <h1 className="text-xl font-bold">My Appointments</h1>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate("/add-appointment")}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      {/* Search and filter */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor, purpose..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <FilterIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        // Loading state
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        // Empty state
        <div className="text-center py-10">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No appointments found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Book your first appointment to get started"}
          </p>
          <Button 
            onClick={() => navigate("/add-appointment")}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>
      ) : (
        // Appointments list
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-2">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </h2>
              <div className="space-y-3">
                {dateAppointments.map(appointment => (
                  <Card 
                    key={appointment.id} 
                    className={`overflow-hidden border-l-4 ${
                      appointment.status === "cancelled" 
                        ? "border-l-red-500 bg-red-50/30" 
                        : appointment.status === "completed"
                        ? "border-l-green-500 bg-green-50/30"
                        : "border-l-blue-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{appointment.doctor_name}</h3>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={appointment.status} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditAppointment(appointment.id)}>
                                Edit
                              </DropdownMenuItem>
                              {appointment.status !== "completed" && (
                                <DropdownMenuItem
                                  onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                >
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              {appointment.status !== "cancelled" && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleCancelClick(appointment.id)}
                                >
                                  Cancel
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Type: {appointment.type}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        Purpose: {appointment.purpose}
                      </p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {appointment.time}
                        </span>
                        {appointment.notes && (
                          <span className="text-xs text-gray-500 italic">
                            Note: {appointment.notes.substring(0, 50)}
                            {appointment.notes.length > 50 ? "..." : ""}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />

      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        confirmVariant="destructive"
      />
    </div>
  )
} 