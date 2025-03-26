"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Clock, ArrowLeft, Pill, Info, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"

// Helper function to generate UUID 
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const medicationTypes = ["Tablet", "Capsule", "Liquid", "Injection", "Inhaler", "Topical", "Other"]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "twice daily", label: "Twice Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as needed", label: "As Needed" },
]

export default function AddMedicationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const isEditMode = Boolean(id)

  // Form state
  const [formState, setFormState] = useState({
    name: "",
    type: "",
    dosage: "",
    time: "",
    frequency: "",
    notes: ""
  })

  // Error state - only show after form submission attempt
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Fetch medication data if in edit mode
  useEffect(() => {
    // Debug: Check Supabase connection and auth status
    const checkConnection = async () => {
      try {
        console.log("Checking Supabase connection...");
        const { data, error } = await supabase.from("medications").select("count").limit(1);
        console.log("Connection check:", { data, error });
        
        // Check auth status
        const session = await supabase.auth.getSession();
        console.log("Auth session:", session);
      } catch (e) {
        console.error("Supabase connection check failed:", e);
      }
    };
    
    checkConnection();
    
    if (isEditMode && id) {
      const fetchMedication = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("medications")
            .select("*")
            .eq("id", id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setFormState({
              name: data.name,
              type: data.type,
              dosage: data.dosage,
              time: data.time,
              frequency: data.frequency,
              notes: data.notes || ""
            });
          }
        } catch (error) {
          console.error("Error fetching medication:", error);
          toast.error("Failed to load medication details");
          navigate("/medications");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMedication();
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
    
    // Add more descriptive error messages and thorough validation
    const name = formState.name.trim()
    if (!name) newErrors.name = "Medication name is required"
    
    if (!formState.type) newErrors.type = "Medication type is required"
    
    const dosage = formState.dosage.trim()
    if (!dosage) newErrors.dosage = "Dosage is required"
    
    if (!formState.time) newErrors.time = "Time is required"
    
    if (!formState.frequency) newErrors.frequency = "Frequency is required"
    
    console.log("Validation check:", {
      name: Boolean(name),
      type: Boolean(formState.type),
      dosage: Boolean(dosage),
      time: Boolean(formState.time),
      frequency: Boolean(formState.frequency)
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    console.log("Form submitted. Validating...")
    
    // Validate form
    const isValid = validateForm()
    console.log("Form validation result:", isValid, "Errors:", errors)
    
    if (!isValid) {
      toast.error("Please fill in all required fields")
      return
    }
    
    if (!user) {
      console.log("No user found. Authentication issue.")
      toast.error("Please log in to manage medications")
      return
    }

    setIsLoading(true)
    try {
      const medicationData = {
        id: isEditMode ? id : generateUUID(),
        user_id: user.id,
        name: formState.name.trim(),
        type: formState.type,
        // Using dose instead of dosage
        dose: formState.dosage.trim(),
        time: formState.time,
        frequency: formState.frequency,
        notes: formState.notes?.trim() || "",
        status: "active",
        created_at: new Date().toISOString()
      };
      
      console.log("Sending data to Supabase:", medicationData)

      if (isEditMode) {
        // Update existing medication
        const { error, data, status, statusText } = await supabase
          .from("medications")
          .update(medicationData)
          .eq("id", id);

        console.log("Update response:", { error, data, status, statusText })
        if (error) throw error;
        toast.success("Medication updated successfully!");
      } else {
        // Create new medication with detailed error logging
        const { error, data, status, statusText } = await supabase
          .from("medications")
          .insert(medicationData);

        console.log("Insert response:", { error, data, status, statusText })
        
        if (error) {
          console.error("Supabase error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        toast.success("Medication added successfully!");
      }

      navigate("/medications");
    } catch (error) {
      console.error("Submission error:", error)
      
      // Enhanced error reporting
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string; message: string; details?: string; hint?: string };
        
        if (dbError.code === "23505") {
          toast.error("A medication with this name already exists")
        } else if (dbError.code === "23502") {
          toast.error("Missing required fields in database")
        } else if (dbError.message) {
          toast.error(`Database Error: ${dbError.message}`)
        } else {
          toast.error(isEditMode ? "Failed to update medication" : "Failed to add medication")
        }
      } else if (error instanceof Error) {
        toast.error(`Error: ${error.message}`)
      } else {
        toast.error(isEditMode ? "Failed to update medication" : "Failed to add medication")
      }
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
          onClick={() => navigate(isEditMode ? "/medications" : "/dashboard")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Medication" : "Add Medication"}</h1>
      </div>

      <Card className="p-0 pb-4">
        <CardHeader className="bg-primary/5 rounded-t-lg border-b py-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Pill className="h-5 w-5 text-primary" />
            <span>Medication Details</span>
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update the details of your medication" 
              : "Enter the details of your medication to help track your treatment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {formSubmitted && Object.keys(errors).length > 0 && (
              <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20 mb-4">
                <h3 className="text-sm font-medium text-destructive mb-1">
                  Please correct the following errors:
                </h3>
                <ul className="text-sm text-destructive list-disc pl-5">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            
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
                  value={formState.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  className={`border-input focus-visible:ring-primary h-12 text-base ${formSubmitted && errors.name ? "border-destructive" : ""}`}
                />
                {formSubmitted && errors.name && (
                  <p className="text-sm font-medium text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-1 text-base">
                  <div className="text-primary">
                    {formState.type === "tablet" && <Pill className="h-5 w-5" />}
                    {formState.type === "capsule" && <Pill className="h-5 w-5" />}
                    {formState.type === "liquid" && <div className="h-5 w-5 flex items-center justify-center text-lg">💧</div>}
                    {formState.type === "injection" && <div className="h-5 w-5 flex items-center justify-center text-lg">💉</div>}
                    {formState.type === "inhaler" && <div className="h-5 w-5 flex items-center justify-center text-lg">🫁</div>}
                    {formState.type === "topical" && <div className="h-5 w-5 flex items-center justify-center text-lg">🧴</div>}
                    {(!formState.type || formState.type === "other") && (
                      <div className="h-5 w-5 flex items-center justify-center text-lg">💊</div>
                    )}
                  </div>
                  Medication Type
                </Label>
                <Select 
                  value={formState.type} 
                  onValueChange={(value) => updateForm("type", value)}
                >
                  <SelectTrigger 
                    id="type" 
                    className={`border-input focus-visible:ring-primary h-12 text-base ${formSubmitted && errors.type ? "border-destructive" : ""}`}
                  >
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
                {formSubmitted && errors.type && (
                  <p className="text-sm font-medium text-destructive">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage" className="flex items-center gap-1 text-base">
                  <div className="text-primary">
                    <div className="h-5 w-5 flex items-center justify-center text-lg">📏</div>
                  </div>
                  Dosage
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
                  id="dosage"
                  value={formState.dosage}
                  onChange={(e) => updateForm("dosage", e.target.value)}
                  placeholder={formState.type ? `e.g., 500mg per ${formState.type.toLowerCase()}` : "e.g., 500mg"}
                  className={`border-input focus-visible:ring-primary h-12 text-base ${formSubmitted && errors.dosage ? "border-destructive" : ""}`}
                />
                {formSubmitted && errors.dosage && (
                  <p className="text-sm font-medium text-destructive">{errors.dosage}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-base">Time to Take</Label>
                <div className="relative">
                  <Input
                    id="time"
                    type="time"
                    value={formState.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                    className={`border-input focus-visible:ring-primary h-12 text-base pl-12 ${formSubmitted && errors.time ? "border-destructive" : ""}`}
                  />
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                {formSubmitted && errors.time && (
                  <p className="text-sm font-medium text-destructive">{errors.time}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="flex items-center gap-1 text-base">
                  Frequency
                  <CalendarClock className="h-5 w-5 ml-1 text-muted-foreground" />
                </Label>
                <Select 
                  value={formState.frequency} 
                  onValueChange={(value) => updateForm("frequency", value)}
                >
                  <SelectTrigger 
                    id="frequency" 
                    className={`border-input focus-visible:ring-primary h-12 text-base ${formSubmitted && errors.frequency ? "border-destructive" : ""}`}
                  >
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
                {formSubmitted && errors.frequency && (
                  <p className="text-sm font-medium text-destructive">{errors.frequency}</p>
                )}

                {formState.frequency && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {formState.frequency === "daily" && "Remember to take this medication every day at the specified time."}
                    {formState.frequency === "twice daily" && "Take this medication twice a day at the specified time."}
                    {formState.frequency === "weekly" && "Take this medication once a week at the specified time."}
                    {formState.frequency === "monthly" && "Take this medication once a month at the specified time."}
                    {formState.frequency === "as needed" &&
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
                  value={formState.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Any additional information or special instructions..."
                  className="border-input focus-visible:ring-primary min-h-[120px] text-base"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditMode ? "/medications" : "/dashboard")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {isEditMode ? "Updating..." : "Adding..."}
                  </span>
                ) : isEditMode ? "Update Medication" : "Add Medication"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

