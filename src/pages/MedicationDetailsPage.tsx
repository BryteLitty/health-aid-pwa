import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Pill, ArrowLeft, Clock, CalendarClock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import BottomNav from "@/components/BottomNav"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import ConfirmationDialog from "@/components/ConfirmationDialog"

// Define type for medication
interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
  type: string
  notes?: string
  user_id: string
  created_at: string
}

export default function MedicationDetailsPage() {
  const [medication, setMedication] = useState<Medication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchMedication = async () => {
      if (!id || !user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("medications")
          .select("*")
          .eq("id", id)
          .single()

        if (error) throw error
        setMedication(data)
      } catch (error) {
        console.error("Error fetching medication:", error)
        toast.error("Failed to load medication details")
        navigate("/medications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedication()
  }, [id, user, navigate])

  const handleEdit = () => {
    navigate(`/edit-medication/${id}`)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
  }

  const handleConfirmDelete = async () => {
    if (!medication) return

    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Medication deleted successfully")
      navigate("/medications")
    } catch (error) {
      console.error("Error deleting medication:", error)
      toast.error("Failed to delete medication")
    } finally {
      setShowDeleteDialog(false)
    }
  }

  // Get icon based on medication type
  const getMedicationIcon = () => {
    if (!medication) return <Pill className="h-8 w-8 text-primary" />
    
    switch(medication.type?.toLowerCase()) {
      case "tablet":
      case "capsule":
        return <Pill className="h-8 w-8 text-primary" />
      case "liquid":
        return <div className="text-primary text-3xl">💧</div>
      case "injection":
        return <div className="text-primary text-3xl">💉</div>
      case "inhaler":
        return <div className="text-primary text-3xl">🫁</div>
      case "topical":
        return <div className="text-primary text-3xl">🧴</div>
      default:
        return <Pill className="h-8 w-8 text-primary" />
    }
  }

  // Get color based on frequency for visual distinction
  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case "daily":
        return "bg-blue-100 text-blue-800"
      case "twice daily":
        return "bg-indigo-100 text-indigo-800"
      case "weekly":
        return "bg-green-100 text-green-800"
      case "monthly":
        return "bg-purple-100 text-purple-800"
      case "as needed":
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

  if (!medication) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/medications")}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Medication Not Found</h1>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <p className="mb-4">This medication doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate("/medications")}>
              Back to Medications
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
          onClick={() => navigate("/medications")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Medication Details</h1>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="bg-primary/5 p-6 flex items-center gap-4 border-b">
          <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center">
            {getMedicationIcon()}
          </div>
          <div>
            <CardTitle className="text-xl">{medication.name}</CardTitle>
            <CardDescription className="text-sm capitalize">{medication.type}</CardDescription>
          </div>
        </div>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Dosage</p>
              <p className="font-medium">{medication.dosage}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Schedule</p>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getFrequencyColor(medication.frequency)}`}>
                  {medication.frequency}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Time to Take</h3>
            </div>
            <p className="pl-7">{medication.time}</p>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Frequency</h3>
            </div>
            <p className="pl-7">
              {medication.frequency === "daily" && "Take every day at the specified time."}
              {medication.frequency === "twice daily" && "Take twice a day at the specified time."}
              {medication.frequency === "weekly" && "Take once a week at the specified time."}
              {medication.frequency === "monthly" && "Take once a month at the specified time."}
              {medication.frequency === "as needed" && "Take only when needed according to your doctor's instructions."}
            </p>
          </div>

          {medication.notes && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Notes</h3>
              </div>
              <p className="pl-7">{medication.notes}</p>
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
          Edit Medication
        </Button>
        <Button 
          variant="destructive" 
          className="flex-1"
          onClick={handleDeleteClick}
        >
          Delete Medication
        </Button>
      </div>

      <BottomNav />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Medication"
        description={`Are you sure you want to delete ${medication?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
      />
    </div>
  )
} 