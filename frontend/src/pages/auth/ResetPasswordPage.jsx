import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useNavigate, useParams } from "react-router-dom";
import Input from "@/components/auth/Inputs";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading, message } = useAuthStore();

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ResetPasswordPage loaded");
    console.log("Token from URL:", token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Attempting password reset...");
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      console.log("Error: Passwords do not match");
      return;
    }

    try {
      console.log("Calling resetPassword with token:", token);
      await resetPassword(token, password);

      console.log("Password reset successful!");
      toast.success("Password reset successfully, redirecting to login page...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error occurred during password reset:", error);
      toast.error(error.message || "Error resetting password");
    }
  };

  useEffect(() => {
    if (error) {
      console.error("Error from store:", error);
    }
    if (message) {
      console.log("Message from store:", message);
    }
    console.log("isLoading:", isLoading);
  }, [error, message, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-card/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary-main to-primary-dark text-transparent bg-clip-text">
          Reset Password
        </h2>
        {error && (
          <p className="text-destructive font-semibold text-sm mb-4">{error}</p>
        )}
        {message && (
          <p className="text-status-success-text text-sm mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            icon={Lock}
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-main to-primary-dark text-white font-bold rounded-lg shadow-lg hover:from-primary-hover hover:to-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 focus:ring-offset-background transition duration-200"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Set New Password"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;