import { Bell, Calendar, Phone, Pill, Plus, AlertCircle, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import BottomNav from "@/components/BottomNav"
import { useState, useEffect } from "react"
import ActionMenu from "@/components/ActionMenu"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import ConfirmationDialog from "@/components/ConfirmationDialog"

// Define types
interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
  notes?: string
  user_id: string
  created_at: string
}

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

const DashboardPage = () => {
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingMeds, setIsLoadingMeds] = useState(true)
  const [isLoadingAppts, setIsLoadingAppts] = useState(true)
  
  // State for confirmation dialogs
  const [showDeleteMedDialog, setShowDeleteMedDialog] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null)
  const [showCancelApptDialog, setShowCancelApptDialog] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const { user } = useAuth()

  // Format today's date
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");

  // Fetch medications from Supabase
  useEffect(() => {
    const fetchMedications = async () => {
      if (!user) return;
      
      try {
        setIsLoadingMeds(true);
        const { data, error } = await supabase
          .from("medications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setMedications(data || []);
      } catch (error) {
        console.error("Error fetching medications:", error);
        toast.error("Failed to load medications");
      } finally {
        setIsLoadingMeds(false);
      }
    };

    fetchMedications();
  }, [user]);

  // Fetch appointments from Supabase
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        setIsLoadingAppts(true);
        const { data, error } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });
        
        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setIsLoadingAppts(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Get today's upcoming items
  const todaysMedications = medications.filter(med => {
    // In a real app, you might want to filter by scheduled time for today
    // This is a simplified version
    return true;
  }).slice(0, 3);

  const upcomingAppointments = appointments
    .filter(appt => {
      // Only show appointments that are today or in the future
      return new Date(appt.date) >= new Date(new Date().setHours(0,0,0,0));
    })
    .slice(0, 3);

  const handleEditAppointment = (id: string) => {
    navigate(`/edit-appointment/${id}`);
  };

  const handleViewAppointmentDetails = (id: string) => {
    navigate(`/appointment-details/${id}`);
  };

  const handleCancelAppointmentClick = (id: string) => {
    setAppointmentToCancel(id);
    setShowCancelApptDialog(true);
  };
  
  const handleCloseCancelDialog = () => {
    setShowCancelApptDialog(false);
    setAppointmentToCancel(null);
  };
  
  const handleConfirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentToCancel);
      
      if (error) throw error;
      
      // Update local state
      setAppointments(appointments.filter(appt => appt.id !== appointmentToCancel));
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setShowCancelApptDialog(false);
      setAppointmentToCancel(null);
    }
  };

  const handleEditMedication = (id: string) => {
    navigate(`/edit-medication/${id}`);
  };

  const handleViewMedicationDetails = (id: string) => {
    navigate(`/medication-details/${id}`);
  };

  const handleDeleteMedicationClick = (id: string) => {
    setMedicationToDelete(id);
    setShowDeleteMedDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setShowDeleteMedDialog(false);
    setMedicationToDelete(null);
  };
  
  const handleConfirmDeleteMedication = async () => {
    if (!medicationToDelete) return;
    
    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", medicationToDelete);
      
      if (error) throw error;
      
      // Update local state
      setMedications(medications.filter(med => med.id !== medicationToDelete));
      toast.success("Medication deleted successfully");
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast.error("Failed to delete medication");
    } finally {
      setShowDeleteMedDialog(false);
      setMedicationToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome, {user?.user_metadata?.name || 'User'}</h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
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
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Medications</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-primary"
            onClick={() => navigate('/medications')}
          >
            View all
          </Button>
        </div>
        
        {isLoadingMeds ? (
          // Loading state
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Card key={i} className="p-3 bg-white">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-12 ml-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : todaysMedications.length > 0 ? (
          <div className="space-y-3">
            {/* Medications */}
            {todaysMedications.map(med => (
              <Card 
                key={med.id} 
                className="p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewMedicationDetails(med.id)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Take Medication</h3>
                    <p className="text-sm text-gray-500">{med.name} - {med.dosage}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 mr-2">{med.time}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewMedicationDetails(med.id);
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditMedication(med.id);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedicationClick(med.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 bg-white text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Pill className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No medications for today</h3>
              <p className="text-sm text-gray-500">
                Add medications to see them here
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/add-medication")}
                className="mt-2"
              >
                <Pill className="h-4 w-4 mr-1" />
                Add Medication
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Appointments */}
      <section className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Appointments</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-primary"
            onClick={() => navigate('/appointments')}
          >
            View all
          </Button>
        </div>
        
        {isLoadingAppts ? (
          // Loading state
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Card key={i} className="p-3 bg-white">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-12 ml-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map(appt => (
              <Card 
                key={appt.id} 
                className="p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewAppointmentDetails(appt.id)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Doctor Appointment</h3>
                    <p className="text-sm text-gray-500">
                      {appt.doctor_name} - {appt.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(appt.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 mr-2">{appt.time}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewAppointmentDetails(appt.id);
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(appt.id);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelAppointmentClick(appt.id);
                          }}
                        >
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 bg-white text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No upcoming appointments</h3>
              <p className="text-sm text-gray-500">
                Book an appointment to see it here
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/add-appointment")}
                className="mt-2"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Book Appointment
              </Button>
            </div>
          </Card>
        )}
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
            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-primary/5 border-primary/20"
            onClick={() => navigate("/medications")}
          >
            <Pill className="h-6 w-6 text-[#407CE2]" />
            <span className="text-sm font-medium text-[#407CE2]">Manage Medications</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-primary/5 border-primary/20"
            onClick={() => navigate("/appointments")}
          >
            <Calendar className="h-6 w-6 text-[#407CE2]" />
            <span className="text-sm font-medium text-[#407CE2]">Manage Appointments</span>
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

      <ConfirmationDialog
        isOpen={showCancelApptDialog}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancelAppointment}
        title="Confirm Appointment Cancellation"
        description="Are you sure you want to cancel this appointment?"
      />

      <ConfirmationDialog
        isOpen={showDeleteMedDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteMedication}
        title="Confirm Medication Deletion"
        description="Are you sure you want to delete this medication?"
      />
    </div>
  )
}

export default DashboardPage 