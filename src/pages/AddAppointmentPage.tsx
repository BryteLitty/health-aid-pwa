"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Clock, CalendarIcon, ArrowLeft, User, Info, Stethoscope, FileText, Building, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"

const appointmentTypes = [
  "General Checkup",
  "Follow-up",
  "Emergency",
  "Specialist Consultation",
  "Vaccination",
  "Laboratory Test",
  "Other",
]

export default function AddAppointmentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const isEditMode = Boolean(id)
  
  // Function to format date for input field
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize today's date
  const today = new Date();
  const todayFormatted = formatDateForInput(today);
  
  // Form state
  const [formState, setFormState] = useState({
    doctorName: "",
    type: "",
    purpose: "",
    date: todayFormatted, // Set default to today
    time: "",
    notes: ""
  });
  
  // Error state - only show after form submission attempt
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  
  // Fetch appointment data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchAppointment = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .eq("id", id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setFormState({
              doctorName: data.doctor_name,
              type: data.type,
              purpose: data.purpose,
              date: data.date,
              time: data.time,
              notes: data.notes || ""
            });
          }
        } catch (error) {
          console.error("Error fetching appointment:", error);
          toast.error("Failed to load appointment details");
          navigate("/appointments");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAppointment();
    }
  }, [id, isEditMode, navigate]);
  
  // Update form state
  const updateForm = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field if it exists and user is typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  
  // Validate form and return true if valid
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formState.doctorName.trim()) newErrors.doctorName = "Doctor's name is required"
    if (!formState.type) newErrors.type = "Appointment type is required"
    if (!formState.purpose.trim()) newErrors.purpose = "Purpose is required"
    if (!formState.date) newErrors.date = "Date is required"
    if (!formState.time) newErrors.time = "Time is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Function to get appointment type icon
  const getAppointmentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "general checkup":
        return <Stethoscope className="h-4 w-4" />
      case "follow-up":
        return <FileText className="h-4 w-4" />
      case "emergency":
        return <AlertCircle className="h-4 w-4" />
      case "specialist consultation":
        return <User className="h-4 w-4" />
      case "vaccination":
        return <div className="h-4 w-4 flex items-center justify-center">💉</div>
      case "laboratory test":
        return <div className="h-4 w-4 flex items-center justify-center">🧪</div>
      default:
        return <Building className="h-4 w-4" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    console.log("Form data being submitted:", formState);
    
    // Validate form
    const isValid = validateForm()
    if (!isValid) {
      toast.error("Please fill in all required fields")
      return
    }
    
    if (!user) {
      toast.error("Please log in to book an appointment")
      return
    }

    setIsLoading(true)
    try {
      const appointmentData = {
        user_id: user.id,
        doctor_name: formState.doctorName,
        type: formState.type,
        purpose: formState.purpose,
        date: formState.date,
        time: formState.time,
        notes: formState.notes || "",
        status: isEditMode ? undefined : "scheduled", // Only set status for new appointments
      };

      if (isEditMode) {
        // Update existing appointment
        const { error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Appointment updated successfully!");
      } else {
        // Create new appointment
        const { error } = await supabase
          .from("appointments")
          .insert(appointmentData);

        if (error) throw error;
        toast.success("Appointment booked successfully!");
      }

      navigate("/appointments");
    } catch (error) {
      toast.error(isEditMode ? "Failed to update appointment" : "Failed to book appointment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-xl mx-auto px-4 py-2 space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(isEditMode ? "/appointments" : "/dashboard")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Appointment" : "Book Appointment"}</h1>
      </div>

      <Card className="p-0 pb-4">
        <CardHeader className="bg-primary/5 rounded-t-lg border-b py-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>Appointment Details</span>
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update your appointment details below"
              : "Schedule your appointment with healthcare professionals"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doctorName" className="flex items-center gap-1">
                  <User className="h-4 w-4 text-primary" />
                  Doctor's Name
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">Enter the full name of the healthcare provider</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="doctorName"
                  value={formState.doctorName}
                  onChange={(e) => updateForm("doctorName", e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className={`border-input focus-visible:ring-primary h-12 ${formSubmitted && errors.doctorName ? "border-destructive" : ""}`}
                />
                {formSubmitted && errors.doctorName && (
                  <p className="text-xs font-medium text-destructive">{errors.doctorName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-1">
                  <div className="text-primary">
                    {formState.type ? getAppointmentTypeIcon(formState.type) : <Stethoscope className="h-4 w-4" />}
                  </div>
                  Appointment Type
                </Label>
                <Select
                  value={formState.type}
                  onValueChange={(value) => updateForm("type", value)}
                >
                  <SelectTrigger 
                    id="type" 
                    className={`border-input focus-visible:ring-primary h-12 py-5 ${formSubmitted && errors.type ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formSubmitted && errors.type && (
                  <p className="text-xs font-medium text-destructive">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-primary" />
                Purpose
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Briefly describe the reason for your visit</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="purpose"
                value={formState.purpose}
                onChange={(e) => updateForm("purpose", e.target.value)}
                placeholder="Brief description of the visit"
                className={`border-input focus-visible:ring-primary h-12 ${formSubmitted && errors.purpose ? "border-destructive" : ""}`}
              />
              {formSubmitted && errors.purpose && (
                <p className="text-xs font-medium text-destructive">{errors.purpose}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Date
                </Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formState.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    min={todayFormatted} // Prevent selecting past dates
                    className={`border-input focus-visible:ring-primary h-12 pl-10 ${
                      formSubmitted && errors.date ? "border-destructive" : ""
                    }`}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {formSubmitted && errors.date && (
                  <p className="text-xs font-medium text-destructive">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  Time
                </Label>
                <div className="relative">
                  <Input
                    id="time"
                    type="time"
                    value={formState.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                    className={`border-input focus-visible:ring-primary pl-10 h-12 ${formSubmitted && errors.time ? "border-destructive" : ""}`}
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {formSubmitted && errors.time && (
                  <p className="text-xs font-medium text-destructive">{errors.time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-primary" />
                Notes (Optional)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Add any special requirements or information for the healthcare provider
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Textarea
                id="notes"
                value={formState.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
                placeholder="Any additional information or special requirements..."
                className="border-input focus-visible:ring-primary min-h-[120px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditMode ? "/appointments" : "/dashboard")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {isEditMode ? "Updating..." : "Booking..."}
                  </span>
                ) : isEditMode ? "Update Appointment" : "Book Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

