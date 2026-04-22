import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Copy, CheckCircle2, AlertCircle, Download, Printer } from 'lucide-react';

export default function VoterIdDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const voterId = location.state?.voterId;
  const fullName = location.state?.fullName;
  const [copied, setCopied] = React.useState(false);

  if (!voterId) {
    return <Navigate to="/register" replace />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(voterId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const fileContent = `
VOTER ID CARD
=============
Name: ${fullName || 'Voter'}
Voter ID: ${voterId}
Issued: ${new Date().toLocaleDateString()}
    
IMPORTANT: Keep this Voter ID secure. You will need it to login to the voting system.
    `;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    element.href = url;
    element.download = `voter_id_${voterId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
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
        <p className="text-gray-600">
          Welcome{fullName ? `, ${fullName}` : ''}! Your unique Voter ID has been generated.
        </p>
      </div>

      {/* Voter ID Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-8 space-y-4 relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 p-2">
          <div className="text-[120px] font-black text-indigo-100/50 leading-none select-none pointer-events-none">
            ID
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">Your Permanent Voter ID</p>
          <div className="flex items-center justify-center gap-3 mt-2">
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
          {copied && (
            <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
          )}
        </div>

        {fullName && (
          <div className="relative z-10 pt-2 border-t border-indigo-200">
            <p className="text-xs text-gray-500">Registered to</p>
            <p className="font-semibold text-gray-800">{fullName}</p>
          </div>
        )}

        <div className="relative z-10 pt-2">
          <p className="text-xs text-gray-500">Issued on</p>
          <p className="text-sm text-gray-700">{new Date().toLocaleDateString()}</p>
        </div>
      </motion.div>

      {/* Warning Message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Important: Save this Voter ID</p>
            <p className="text-xs text-yellow-700 mt-1">
              This is your permanent Voter ID. You will need it to login to your account every time.
              Keep it safe and do not share it with anyone.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
        
        <button
          onClick={() => navigate('/login')}
          className="w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all duration-200"
        >
          Yes, I've saved it. Take me to Login
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Tip: Take a screenshot, print, or download this page to save your Voter ID.
        </p>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            button {
              display: none;
            }
            .no-print {
              display: none;
            }
            body {
              background: white;
            }
            .bg-gradient-to-br {
              background: white;
              border: 2px solid #e0e0e0;
            }
          }
        `}
      </style>
    </div>
  );
}