"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Clock, ArrowLeft, Pill, Info, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"

const medicationTypes = ["Tablet", "Capsule", "Liquid", "Injection", "Inhaler", "Topical", "Other"]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As Needed" },
]

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  type: z.string().min(1, "Medication type is required"),
  dose: z.string().min(1, "Dose is required"),
  time: z.string().min(1, "Time is required"),
  frequency: z.string().min(1, "Frequency is required"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof medicationSchema>

export default function AddMedicationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(medicationSchema),
  })

  const selectedType = watch("type")
  const selectedFrequency = watch("frequency")

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Please log in to add medication")
      return
    }

    setIsLoading(true)
    try {
      console.log("Submitting data:", {
        user_id: user.id,
        name: data.name,
        type: data.type,
        dose: data.dose,
        time: data.time,
        frequency: data.frequency,
        notes: data.notes,
        status: "active",
      })

      const { data: result, error } = await supabase
        .from("medications")
        .insert({
          user_id: user.id,
          name: data.name,
          type: data.type,
          dose: data.dose,
          time: data.time,
          frequency: data.frequency,
          notes: data.notes,
          status: "active",
        })
        .select()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Success:", result)
      toast.success("Medication added successfully!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Failed to add medication. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-xl mx-auto px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Add Medication</h1>
      </div>

      <Card className="p-0 pb-4">
        <CardHeader className="bg-primary/5 rounded-t-lg border-b py-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Pill className="h-5 w-5 text-primary" />
            <span>Medication Details</span>
          </CardTitle>
          <CardDescription>Enter the details of your medication to help track your treatment</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1 text-base">
                  <Pill className="h-5 w-5 text-primary" />
                  Medication Name
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Enter the name as it appears on your prescription or packaging
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Amoxicillin"
                  className="border-input focus-visible:ring-primary h-12 text-base"
                />
                {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-1 text-base">
                  <div className="text-primary">
                    {selectedType === "tablet" && <Pill className="h-5 w-5" />}
                    {selectedType === "capsule" && <Pill className="h-5 w-5" />}
                    {selectedType === "liquid" && <div className="h-5 w-5 flex items-center justify-center text-lg">💧</div>}
                    {selectedType === "injection" && <div className="h-5 w-5 flex items-center justify-center text-lg">💉</div>}
                    {selectedType === "inhaler" && <div className="h-5 w-5 flex items-center justify-center text-lg">🫁</div>}
                    {selectedType === "topical" && <div className="h-5 w-5 flex items-center justify-center text-lg">🧴</div>}
                    {(!selectedType || selectedType === "other") && (
                      <div className="h-5 w-5 flex items-center justify-center text-lg">💊</div>
                    )}
                  </div>
                  Medication Type
                </Label>
                <Select onValueChange={(value) => setValue("type", value)}>
                  <SelectTrigger id="type" className="border-input focus-visible:ring-primary h-12 text-base">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicationTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()} className="text-base py-2">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm font-medium text-destructive">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dose" className="flex items-center gap-1 text-base">
                  <div className="text-primary">
                    <div className="h-5 w-5 flex items-center justify-center text-lg">📏</div>
                  </div>
                  Dose
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">Specify the amount (e.g., 500mg, 10ml, 2 tablets)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="dose"
                  {...register("dose")}
                  placeholder={selectedType ? `e.g., 500mg per ${selectedType.toLowerCase()}` : "e.g., 500mg"}
                  className="border-input focus-visible:ring-primary h-12 text-base"
                />
                {errors.dose && <p className="text-sm font-medium text-destructive">{errors.dose.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-base">Time to Take</Label>
                <div className="relative">
                  <Input
                    id="time"
                    {...register("time")}
                    type="time"
                    className="border-input focus-visible:ring-primary h-12 text-base pl-12"
                  />
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.time && <p className="text-sm font-medium text-destructive">{errors.time.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="flex items-center gap-1 text-base">
                  Frequency
                  <CalendarClock className="h-5 w-5 ml-1 text-muted-foreground" />
                </Label>
                <Select onValueChange={(value) => setValue("frequency", value)}>
                  <SelectTrigger id="frequency" className="border-input focus-visible:ring-primary h-12 text-base">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value} className="text-base py-2">
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frequency && <p className="text-sm font-medium text-destructive">{errors.frequency.message}</p>}

                {selectedFrequency && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {selectedFrequency === "daily" && "Remember to take this medication every day at the specified time."}
                    {selectedFrequency === "weekly" && "Take this medication once a week at the specified time."}
                    {selectedFrequency === "monthly" && "Take this medication once a month at the specified time."}
                    {selectedFrequency === "as_needed" &&
                      "Take this medication only when needed according to your doctor's instructions."}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-1 text-base">
                  Notes (Optional)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">Add any special instructions or side effects to watch for</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Any additional information or special instructions..."
                  className="border-input focus-visible:ring-primary min-h-[120px] text-base"
                />
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-14 rounded-full bg-primary hover:bg-primary/80 text-white text-lg font-medium flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Pill className="h-5 w-5" />
                    <span>Add Medication</span>
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

