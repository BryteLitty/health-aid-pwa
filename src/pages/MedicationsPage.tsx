import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Pill, ArrowLeft, MoreVertical, Plus, SearchIcon, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import BottomNav from "@/components/BottomNav"
import ConfirmationDialog from "@/components/ConfirmationDialog"

// Define type for medication
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

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch medications from Supabase
  useEffect(() => {
    const fetchMedications = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("medications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setMedications(data || [])
        setFilteredMedications(data || [])
      } catch (error) {
        console.error("Error fetching medications:", error)
        toast.error("Failed to load medications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedications()
  }, [user])

  // Filter medications based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMedications(medications)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = medications.filter(
      medication =>
        medication.name.toLowerCase().includes(term) ||
        medication.dosage.toLowerCase().includes(term) ||
        medication.frequency.toLowerCase().includes(term)
    )

    setFilteredMedications(filtered)
  }, [searchTerm, medications])

  const handleEditMedication = (id: string) => {
    navigate(`/edit-medication/${id}`)
  }

  const handleDeleteClick = (id: string) => {
    setMedicationToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setMedicationToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!medicationToDelete) return

    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", medicationToDelete)

      if (error) throw error

      // Update local state
      setMedications(medications.filter(med => med.id !== medicationToDelete))
      toast.success("Medication deleted successfully")
    } catch (error) {
      console.error("Error deleting medication:", error)
      toast.error("Failed to delete medication")
    } finally {
      setShowDeleteDialog(false)
      setMedicationToDelete(null)
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
          <h1 className="text-xl font-bold">My Medications</h1>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate("/add-medication")}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medications..."
            className="pl-9"
          />
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
      ) : filteredMedications.length === 0 ? (
        // Empty state
        <div className="text-center py-10">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Pill className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No medications found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Add your first medication to get started"}
          </p>
          <Button 
            onClick={() => navigate("/add-medication")}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        </div>
      ) : (
        // Medications list
        <div className="space-y-4">
          {filteredMedications.map(medication => (
            <Card 
              key={medication.id} 
              className="overflow-hidden border-l-4 border-l-primary"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium">{medication.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditMedication(medication.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(medication.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  Dosage: {medication.dosage}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getFrequencyColor(medication.frequency)}`}>
                    {medication.frequency}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {medication.time}
                  </span>
                </div>
                {medication.notes && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md flex items-start gap-1">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-500" />
                    <span>
                      {medication.notes.substring(0, 100)}
                      {medication.notes.length > 100 ? "..." : ""}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BottomNav />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Medication"
        description={`Are you sure you want to delete this medication? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
      />
    </div>
  )
} 