"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Clock, CalendarIcon, ArrowLeft, User, Info, Stethoscope, FileText, Building, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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

const appointmentSchema = z.object({
  doctorName: z.string().min(1, "Doctor's name is required"),
  type: z.string().min(1, "Appointment type is required"),
  purpose: z.string().min(1, "Purpose is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof appointmentSchema>

export default function AddAppointmentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch,
  } = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("appointments").insert({
        user_id: user.id,
        doctor_name: data.doctorName,
        type: data.type,
        purpose: data.purpose,
        date: data.date,
        time: data.time,
        notes: data.notes,
        status: "scheduled",
      })

      if (error) throw error

      toast.success("Appointment booked successfully!")
      navigate("/dashboard")
    } catch (error) {
      toast.error("Failed to book appointment")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="container max-w-xl mx-auto px-4 py-2 space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Book Appointment</h1>
      </div>

      <Card className="p-0 pb-4">
        <CardHeader className="bg-primary/5 rounded-t-lg border-b py-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>Appointment Details</span>
          </CardTitle>
          <CardDescription>Schedule your appointment with healthcare professionals</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  {...register("doctorName")}
                  placeholder="Dr. Jane Smith"
                  className="border-input focus-visible:ring-primary h-12"
                />
                {errors.doctorName && (
                  <p className="text-xs font-medium text-destructive">{errors.doctorName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-1">
                  <div className="text-primary">
                    {selectedType ? getAppointmentTypeIcon(selectedType) : <Stethoscope className="h-4 w-4" />}
                  </div>
                  Appointment Type
                </Label>
                <Select
                  onValueChange={(value) => {
                    setValue("type", value)
                    setSelectedType(value)
                  }}
                >
                  <SelectTrigger id="type" className="border-input focus-visible:ring-primary h-12 py-5">
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
                {errors.type && <p className="text-xs font-medium text-destructive">{errors.type.message}</p>}
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
                {...register("purpose")}
                placeholder="Brief description of the visit"
                className="border-input focus-visible:ring-primary h-12"
              />
              {errors.purpose && <p className="text-xs font-medium text-destructive">{errors.purpose.message}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={`w-full h-12 justify-start text-left font-normal border-input focus-visible:ring-primary ${
                        !selectedDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        if (date) {
                          setValue("date", format(date, "yyyy-MM-dd"))
                        }
                      }}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-xs font-medium text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  Time
                </Label>
                <div className="relative">
                  <Input
                    id="time"
                    {...register("time")}
                    type="time"
                    className="border-input focus-visible:ring-primary pl-10 h-12"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.time && <p className="text-xs font-medium text-destructive">{errors.time.message}</p>}
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
                {...register("notes")}
                placeholder="Any additional information or special requirements..."
                className="border-input focus-visible:ring-primary min-h-[120px]"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white text-lg font-medium flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-5 w-5" />
                    <span>Book Appointment</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

