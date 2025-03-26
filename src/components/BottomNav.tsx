import { Home, Calendar, User, Activity } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export default function BottomNav() {
  const location = useLocation()
  
  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Calendar, label: "Schedule", path: "/schedule" },
    { icon: Activity, label: "Health", path: "/health" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 ${
                isActive ? "text-[#407CE2]" : "text-gray-500"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 