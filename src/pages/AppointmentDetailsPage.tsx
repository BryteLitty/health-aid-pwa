import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Calendar, ArrowLeft, Clock, User, Info, MapPin, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BottomNav from "@/components/BottomNav"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function AppointmentDetailsPage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id || !user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", id)
          .single()

        if (error) throw error
        setAppointment(data)
      } catch (error) {
        console.error("Error fetching appointment:", error)
        toast.error("Failed to load appointment details")
        navigate("/appointments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointment()
  }, [id, user, navigate])

  const handleEdit = () => {
    navigate(`/edit-appointment/${id}`)
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelDialog = () => {
    setShowCancelDialog(false)
  }

  const handleConfirmCancel = async () => {
    if (!appointment) return

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Appointment cancelled successfully")
      navigate("/appointments")
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast.error("Failed to cancel appointment")
    } finally {
      setShowCancelDialog(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-36 mb-2" />
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 mt-0.5" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <BottomNav />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/appointments")}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Appointment Not Found</h1>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <p className="mb-4">This appointment doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate("/appointments")}>
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="container max-w-xl mx-auto px-4 py-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/appointments")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Appointment Details</h1>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2 pt-6">
          <CardTitle className="flex items-center justify-between">
            <span>{appointment.doctor_name}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </CardTitle>
          <p className="text-sm text-gray-500">{appointment.type}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(appointment.date), "MMMM d, yyyy")}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{appointment.time}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Doctor</p>
              <p className="font-medium">{appointment.doctor_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Purpose</p>
              <p className="font-medium">{appointment.purpose}</p>
            </div>
          </div>

          {appointment.notes && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">{appointment.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleEdit}
        >
          Edit Appointment
        </Button>
        <Button 
          variant="destructive" 
          className="flex-1"
          onClick={handleCancelClick}
        >
          Cancel Appointment
        </Button>
      </div>

      <BottomNav />

      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={handleCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        description={`Are you sure you want to cancel your appointment with ${appointment?.doctor_name} on ${appointment ? format(new Date(appointment.date), "MMMM d, yyyy") : ""}? This action cannot be undone.`}
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        confirmVariant="destructive"
      />
    </div>
  )
} 