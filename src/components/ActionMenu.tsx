import { Pill, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface ActionMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function ActionMenu({ isOpen, onClose }: ActionMenuProps) {
  const navigate = useNavigate()

  const actions = [
    {
      icon: Pill,
      label: "Add Medication",
      description: "Set up a new medication reminder",
      path: "/add-medication",
      color: "text-primary",
    },
    {
      icon: Calendar,
      label: "Book Appointment",
      description: "Schedule a doctor's appointment",
      path: "/add-appointment",
      color: "text-green-500",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-center">What would you like to do?</h2>
          <div className="space-y-4">
            {actions.map((action) => (
              <Button
                key={action.path}
                variant="outline"
                className="w-full h-auto p-4 flex items-start space-x-4"
                onClick={() => {
                  onClose()
                  navigate(action.path)
                }}
              >
                <div className={`${action.color} p-2 bg-gray-50 rounded-lg`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 