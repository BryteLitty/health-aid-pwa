import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import Logo from "../../assets/images/logo.svg";
import Pills from "../../assets/images/tabs.svg";
import Sethoscope from "../../assets/images/docs.svg";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-sky-50">
      {/* Pills at the top */}
      <div className="absolute top-0 right-0 p-8">
        <img src={Pills} alt="Medical pills" width={150} height={100} className="opacity-20" />
      </div>
      <div className="absolute top-10 left-10">
        <img src={Pills} alt="Small pill" width={40} height={20} className="opacity-20" />
      </div>

      {/* Logo and title section */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center z-10">
        <img src={Logo} alt="Logo" className="w-1/2" />
        {/* <div className="mb-4 rounded-2xl bg-sky-100 p-4 border-2 border-blue-800">
          <div className="relative h-16 w-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-sky-200"></div>
            <div className="absolute inset-1 rounded-xl border-2 border-blue-800 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-blue-800 flex items-center justify-center">
                <span className="text-blue-800 text-xl font-bold">+</span>
              </div>
            </div>
          </div>
        </div> */}
        <h1 className="text-4xl text-gray-900 mt-6">Health Aid Plus</h1>
        <p className="text-gray-600 mt-2">Connecting you to your medic</p>
      </div>

      {/* Stethoscope at the bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <img src={Sethoscope} alt="Stethoscope" className="w-1/2 opacity-10" />
      </div>

      {/* Navigation dots and button */}
      <div className="w-full flex items-center justify-between px-8 pb-8 z-10">
        <div className="flex gap-1">
          <div className="h-1.5 w-6 rounded-full bg-[#407CE2]"></div>
          <div className="h-1.5 w-3 rounded-full bg-[#407CE2]/20"></div>
        </div>
        <Link
          to="/onboarding"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#407CE2] text-white shadow-lg hover:bg-blue-700"
        >
          <ArrowRight className="h-6 w-6" />
        </Link>
      </div>
    </main>
  )
}
