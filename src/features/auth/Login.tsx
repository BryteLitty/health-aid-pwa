import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { EyeOff, Eye, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import supabase from "@/supabase/supabase"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginSchema = z.infer<typeof loginSchema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginSchema) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      toast.success("Login successful!")
      navigate(from, { replace: true })
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to login")
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        throw error
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to sign in with Google")
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  return (
    <div className="w-full max-w-md px-4 py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      {...field}
                      type="email"
                      placeholder="Enter your email" 
                      className="pl-12 h-14 bg-gray-50 text-base border-gray-200 shadow-none" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-12 pr-12 h-14 bg-gray-50 text-base border-gray-200 shadow-none"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-center">
            <p className="text-gray-700">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#407CE2] font-medium">
                Sign Up
              </Link>
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg text-white rounded-full bg-[#407CE2] hover:bg-[#407CE2]"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-300 w-full absolute"></div>
            <span className="bg-white px-4 text-gray-500 text-sm relative z-10">OR</span>
          </div>

          <button
            type="button"
            className="w-full h-14 flex items-center justify-center space-x-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 text-black" />
            <span className="text-black">Sign in with Google</span>
          </button>
        </form>
      </Form>
    </div>
  )
}