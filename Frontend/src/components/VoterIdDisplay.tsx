import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

export default function VoterIdDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const voterId = location.state?.voterId;
  const [copied, setCopied] = React.useState(false);

  if (!voterId) {
    return <Navigate to="/register" replace />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(voterId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="bg-green-100 p-4 rounded-full">
          <ShieldCheck className="h-12 w-12 text-green-600" />
        </div>
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Registration Successful!</h2>
        <p className="text-gray-600">Your unique Voter ID has been generated. Please save it securely as you will need it for every login.</p>
      </div>

      <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-8 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
          <div className="text-[120px] font-black text-indigo-100/50 leading-none select-none pointer-events-none">
            ID
          </div>
        </div>
        
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest relative z-10">Your Voter ID</p>
        <div className="flex items-center justify-center gap-3 relative z-10">
          <span className="text-4xl font-mono font-bold text-indigo-900 tracking-wider">
            {voterId}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <Copy className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className="pt-8 space-y-6">
        <p className="text-lg font-medium text-gray-800">Did you save your Voter ID?</p>
        
        <button
          onClick={() => navigate('/login')}
          className="w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all duration-200"
        >
          Yes, I've saved it. Take me to Login
        </button>
        
        <p className="text-sm text-gray-500 italic">
          Tip: Take a screenshot or write it down. 
        </p>
      </div>
    </div>
  );
}
