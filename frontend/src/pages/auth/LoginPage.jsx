// import React from 'react'
// import { useState } from 'react'
// import {motion} from 'framer-motion'
// import {Lock, Mail, Loader} from 'lucide-react'
// import Inputs from '@/components/auth/Inputs'
// import { Link } from 'react-router-dom' 
// import { useAuthStore } from '@/store/authStore'
// import toast from 'react-hot-toast'
// import { useNavigate } from 'react-router-dom'

// const LoginPage = () => {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   const navigate = useNavigate()
  
//   const {login, isLoading, error} = useAuthStore()

//   const handleLogin = async (e) => {
//     e.preventDefault()
  
//     try {
//       await login(email, password);
//       navigate("/");
//       toast.success("Login successful");
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="max-w-md w-full bg-card bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
//     >
//       <div className="p-8">
//         <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary-main to-primary-dark text-transparent bg-clip-text">
//           Welcome Back
//         </h2>

//         <form onSubmit={handleLogin}>
//           <Inputs
//             icon={Mail}
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <Inputs
//             icon={Lock}
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
          
//           <div className="flex items-center justify-between">
//             <Link 
//               to="/forgot-password" 
//               className="text-sm text-primary-main hover:text-primary-hover transition-colors duration-200 hover:underline"
//             >
//               Forgot Password?
//             </Link>
//           </div>

//           {error && (
//             <p className="text-destructive font-semibold mt-2">{error}</p>
//           )}

//           <motion.button
//             className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-primary-main to-primary-dark 
//                        text-white font-bold rounded-lg hover:from-primary-hover hover:to-primary-dark 
//                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main
//                        focus:ring-offset-background transition duration-200"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <Loader className="w-6 h-6 animate-spin mx-auto" />
//             ) : (
//               "Login"
//             )}
//           </motion.button>
//         </form>
//       </div>

//       <div className="bg-card bg-opacity-50 backdrop-filter backdrop-blur-xl px-8 py-4 flex justify-center">
//         <p className="text-muted-foreground">
//           Don't have an account?{" "}
//           <Link
//             to="/signup"
//             className="text-primary-main hover:text-primary-hover transition-colors duration-200"
//           >
//             Sign Up
//           </Link>
//         </p>
//       </div>
//     </motion.div>
//   )
// }

// export default LoginPage


import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader } from 'lucide-react';
import Inputs from '@/components/auth/Inputs';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import logo from "@/assets/logo.svg";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate('/');
      toast.success('Login successful');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex w-full max-w-6xl bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Column - Login Form */}
        <div className="w-full md:w-1/2 p-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src={logo}
                alt="Logo"
                className="w-20 h-20"
              />
            </div>

            <h2 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-primary-main to-primary-dark text-transparent bg-clip-text">
              Welcome Back
            </h2>
            <p className="text-center text-gray-500 mb-8">Sign in to continue your journey</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <Inputs
                icon={Mail}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Inputs
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-main hover:text-primary-hover transition-colors duration-200 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <p className="text-destructive font-semibold">{error}</p>
              )}

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
                  'Login'
                )}
              </motion.button>
            </form>
          </motion.div>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-main hover:text-primary-hover transition-colors duration-200 font-semibold"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Gradient Design */}
        <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-primary-light via-primary-main to-primary-dark">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-20"/>
          <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
            <h3 className="text-4xl font-bold mb-4">Welcome to Our Platform</h3>
            <p className="text-lg text-center opacity-90">
              Discover amazing features and services tailored just for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;