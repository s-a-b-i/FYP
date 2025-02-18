import React from 'react'
import { motion } from 'framer-motion'

const FloatingShape = ({ size, top, left, delay }) => {
  return (
    <motion.div
      className={`absolute rounded-full bg-primary-main/20 ${size} blur-xl ${top} ${left}`}
      animate={{
        y: ["0%", "100%", "0%"],
        x: ["0%", "100%", "0%"],
        rotate: [0, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
      aria-hidden="true"
    />
  )
}

export default FloatingShape