import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, Activity, Pill, Plus, Weight, ArrowRight, BarChart3, Droplet, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BottomNav from "@/components/BottomNav"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function HealthPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

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
      } catch (error) {
        console.error("Error fetching medications:", error)
        toast.error("Failed to load medications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedications()
  }, [user])

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
    <div className="container max-w-xl mx-auto px-4 pb-20 min-h-screen bg-gray-50">
      <header className="py-4 sticky top-0 bg-gray-50 z-10 border-b">
        <h1 className="text-2xl font-bold">Health</h1>
      </header>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>Vitals</span>
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-1">
            <Pill className="h-4 w-4" />
            <span>Meds</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-2 space-y-6">
          <section>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Health Summary</CardTitle>
                <CardDescription>Your health metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <Heart className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-xs text-gray-500">Blood Pressure</p>
                    <p className="text-xl font-bold">120/80</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                    <Activity className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p className="text-xl font-bold">72 bpm</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                    <Weight className="h-8 w-8 text-purple-500 mb-2" />
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="text-xl font-bold">68 kg</p>
                    <p className="text-xs text-green-600">Stable</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
                    <Droplet className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-xs text-gray-500">Glucose</p>
                    <p className="text-xl font-bold">96 mg/dL</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Medication Summary</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-primary"
                onClick={() => navigate("/medications")}
              >
                View all
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : medications.length === 0 ? (
              <Card className="text-center py-6">
                <CardContent>
                  <Pill className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-base font-medium">No medications added</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Add your medications to track them
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => navigate("/add-medication")}
                    className="mx-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medication
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {medications.slice(0, 2).map(medication => (
                  <Card 
                    key={medication.id} 
                    className="overflow-hidden cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/medication-details/${medication.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <Pill className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{medication.name}</h3>
                          <p className="text-sm text-gray-500">
                            {medication.dosage} - {medication.time}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getFrequencyColor(medication.frequency)}`}>
                          {medication.frequency}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {medications.length > 2 && (
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-between"
                    onClick={() => navigate("/medications")}
                  >
                    <span>View all medications ({medications.length})</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Health Trends</h2>
              <Button variant="ghost" size="sm" className="text-sm text-primary">View all</Button>
            </div>
            <Card className="p-6 text-center bg-gray-50 border-dashed">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-base font-medium">Track your health over time</h3>
              <p className="text-sm text-gray-500 mb-4">
                Coming soon: Track your metrics and see your progress over time
              </p>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="vitals" className="mt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vital Signs</CardTitle>
              <CardDescription>Track your vital health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                <li className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium">Blood Pressure</p>
                      <p className="text-sm text-gray-500">Last updated: Today</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">120/80</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </li>
                <li className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium">Heart Rate</p>
                      <p className="text-sm text-gray-500">Last updated: Today</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">72 bpm</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </li>
                <li className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Weight className="h-5 w-5 text-purple-500 mr-3" />
                    <div>
                      <p className="font-medium">Weight</p>
                      <p className="text-sm text-gray-500">Last updated: Yesterday</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">68 kg</p>
                    <p className="text-xs text-green-600">Stable</p>
                  </div>
                </li>
                <li className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Droplet className="h-5 w-5 text-amber-500 mr-3" />
                    <div>
                      <p className="font-medium">Blood Glucose</p>
                      <p className="text-sm text-gray-500">Last updated: 2 days ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">96 mg/dL</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Medications</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/add-medication")}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : medications.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">No medications found</h3>
              <p className="text-gray-500 mb-6">
                Add your medications to track and get reminders
              </p>
              <Button onClick={() => navigate("/add-medication")}>
                Add Medication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map(medication => (
                <Card 
                  key={medication.id} 
                  className="overflow-hidden cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/medication-details/${medication.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-1">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{medication.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getFrequencyColor(medication.frequency)}`}>
                            {medication.frequency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {medication.dosage} - {medication.type}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{medication.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/medications")}
              >
                Manage Medications
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  )
} 