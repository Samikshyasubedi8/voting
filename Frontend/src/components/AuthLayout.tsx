import React from 'react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col min-h-[500px]"
      >
        {/* Main Content: Form */}
        <div className="w-full p-8 sm:p-12 flex flex-col justify-center items-center">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
