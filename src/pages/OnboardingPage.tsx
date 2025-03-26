import Logo from "../assets/images/logo.svg";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnboardingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-sky-50">
        <div className="w-full px-4 pt-4">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1">
            <img src={Logo} alt="Logo" className="w-1/3" />
            <h1 className="text-4xl text-gray-900 mt-6">Health Aid Plus</h1>
            <p className="text-gray-600 mt-2">Connecting you to your medic</p>
            <p className="text-black font-bold text-lg mt-8">Get Started</p>
        </div>

        {/* buttons */}
        <div className="flex flex-col gap-6 w-full items-center justify-center pb-10">
            <button onClick={() => navigate("/login")} className="bg-[#407CE2] border-1 cursor-pointer border-[#407CE2] text-white w-2/3 py-4 rounded-full">
                <p>Login</p>
            </button>

            <button onClick={() => navigate("/signup")} className="bg-white border-1 cursor-pointer border-[#407CE2] text-[#407CE2] w-2/3 py-4 rounded-full">
                <p>Sign Up</p>
            </button>
        </div>
    </div>
  )
}

export default OnboardingPage