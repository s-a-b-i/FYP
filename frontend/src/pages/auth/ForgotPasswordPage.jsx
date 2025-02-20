import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import Inputs from '@/components/auth/Inputs'
import { ArrowLeft, Loader, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import logo from "@/assets/logo.svg"

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('') 
    const [isSubmitted, setIsSubmitted] = useState(false)

    const { forgotPassword, isLoading } = useAuthStore()

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            await forgotPassword(email)
            toast.success("Password reset link sent to your email successfully")
            setIsSubmitted(true)
        } catch (error) {
            console.log(error) 
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex w-full max-w-6xl bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Column - Form */}
                <div className="w-full md:w-1/2 p-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <img src={logo} alt="Logo" className="w-20 h-20" />
                        </div>

                        <h2 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-primary-main to-primary-dark text-transparent bg-clip-text">
                            Forgot Password?
                        </h2>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <p className="text-gray-500 mb-8 text-center">
                                    Don't worry! Enter your email address and we'll send you a link to reset your password.
                                </p>
                                <Inputs
                                    icon={Mail}
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <motion.button
                                    className="w-full py-3 px-4 bg-gradient-to-r from-primary-main to-primary-dark 
                                             text-white font-bold rounded-lg hover:opacity-90
                                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main
                                             focus:ring-offset-background transition duration-200 shadow-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader className="w-6 h-6 animate-spin mx-auto" />
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </motion.button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="w-20 h-20 bg-gradient-to-br from-primary-main to-primary-dark rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <Mail className="h-10 w-10 text-white" />
                                </motion.div>
                                <p className="text-gray-500 mb-6">
                                    If an account exists for <span className="font-semibold">{email}</span>, you will receive a password reset link shortly.
                                </p>
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <Link 
                                to="/login" 
                                className="text-primary-main hover:text-primary-hover inline-flex items-center gap-2 transition duration-200"
                            >
                                <ArrowLeft className="h-4 w-4" /> 
                                Back to Login
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Gradient Design */}
                <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-primary-light via-primary-main to-primary-dark">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-20" />
                    <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
                        <Mail className="w-16 h-16 mb-6 opacity-90" />
                        <h3 className="text-4xl font-bold mb-4">Password Reset</h3>
                        <p className="text-lg text-center opacity-90">
                            We'll help you get back into your account safely and securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage