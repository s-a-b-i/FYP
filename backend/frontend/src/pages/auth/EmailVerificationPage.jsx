import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader, Mail } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import logo from "@/assets/logo.svg";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { verifyEmail, error, isLoading } = useAuthStore();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedValue = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedValue[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      navigate("/");
      toast.success("Email verified successfully");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex w-full max-w-6xl bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Column - Verification Form */}
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
              Verify Your Email
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Please enter the 6-digit code sent to your email
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white border-2 
                             border-gray-200 rounded-lg focus:border-primary-main focus:outline-none 
                             transition duration-200 shadow-sm"
                  />
                ))}
              </div>

              {error && (
                <p className="text-destructive font-semibold text-center">{error}</p>
              )}

              <motion.button
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-main to-primary-dark 
                         text-white font-bold rounded-lg hover:opacity-90
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main
                         focus:ring-offset-background transition duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || code.some((digit) => !digit)}
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Verify Email"
                )}
              </motion.button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Didn't receive the code?{" "}
              <button className="text-primary-main hover:text-primary-hover transition-colors duration-200 font-semibold">
                Resend
              </button>
            </p>
          </motion.div>
        </div>

        {/* Right Column - Gradient Design */}
        <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-primary-light via-primary-main to-primary-dark">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-20" />
          <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
            <Mail className="w-16 h-16 mb-6 opacity-90" />
            <h3 className="text-4xl font-bold mb-4">Check Your Email</h3>
            <p className="text-lg text-center opacity-90">
              We've sent you a verification code to ensure the security of your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;