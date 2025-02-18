import { motion } from "framer-motion";

const LoadingSpinner = () => {
    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-primary-dark to-primary-main flex items-center justify-center relative overflow-hidden'>
            <motion.div
                className='w-16 h-16 border-4 border-t-4 border-t-primary-main border-primary-light rounded-full'
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}

export default LoadingSpinner