import SignUpForm from "@/features/auth/SignUp"
import Logo from "@/assets/images/logo.svg"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const SignUpPage = () => {
    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center">
            <div className="w-full px-4 pt-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
        <div className="flex flex-col items-center justify-center">
            <div className="w-full px-4 pt-4 flex flex-col items-center justify-center">
                <img src={Logo} alt="Logo" className="w-1/8" />
                <h1 className="text-black">Health Aid Plus</h1>
                <h2 className="text-black text-2xl font-bold mt-4">Sign Up</h2>
            </div>
            <SignUpForm />
        </div>
    </div>
  )
}

export default SignUpPage;