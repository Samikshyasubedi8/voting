import React, { useEffect, useState } from 'react';
import { 
  User, 
  MapPin, 
  Vote, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  role: string;
  municipality: string;
  ward: number | null;
  photo: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  voterId: string;
  district: string;
  municipality: string;
  ward: number;
}

export default function VotingWelcome() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<{
    mayor: string | null;
    deputyMayor: string | null;
    wardChairperson: string | null;
    wardMembers: string[];
  }>({
    mayor: null,
    deputyMayor: null,
    wardChairperson: null,
    wardMembers: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('user_data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUserData(parsedData);
      fetchCandidates(parsedData.municipality, parsedData.ward);
    }
    
    const votedStatus = localStorage.getItem('has_voted');
    if (votedStatus === 'true') {
      setHasVoted(true);
    }
  }, []);

  const fetchCandidates = async (municipality: string, ward: number) => {
    try {
      const response = await fetch(`/api/voting/candidates?municipality=${encodeURIComponent(municipality)}&ward=${ward}`);
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  const toggleWardMember = (candidateId: string) => {
    if (hasVoted) return;
    setSelections(prev => {
      const isSelected = prev.wardMembers.includes(candidateId);
      if (isSelected) {
        return { ...prev, wardMembers: prev.wardMembers.filter(id => id !== candidateId) };
      } else {
        if (prev.wardMembers.length >= 4) {
          setError("You can select a maximum of 4 Ward Members.");
          return prev;
        }
        setError(null);
        return { ...prev, wardMembers: [...prev.wardMembers, candidateId] };
      }
    });
  };

  const selectSingle = (role: 'mayor' | 'deputyMayor' | 'wardChairperson', candidateId: string) => {
    if (hasVoted) return;
    setSelections(prev => ({ ...prev, [role]: candidateId }));
    setError(null);
  };

  const handleSubmit = () => {
    if (!selections.mayor || !selections.deputyMayor || !selections.wardChairperson) {
      setError("Please select a candidate for Mayor, Deputy Mayor, and Ward Chairperson.");
      return;
    }
    if (selections.wardMembers.length === 0) {
      setError("Please select at least one Ward Member.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setShowConfirm(false);
    setHasVoted(true);
    localStorage.setItem('has_voted', 'true');
  };

  const getPartyColor = (party: string) => {
    switch (party.toUpperCase()) {
      case 'RSP': return 'bg-blue-600';
      case 'UML': return 'bg-sun-500 bg-orange-500';
      case 'CONGRESS': return 'bg-green-600';
      default: return 'bg-slate-600';
    }
  };

  if (!userData) return null;

  const roles = [
    { key: 'mayor', title: 'Mayor', description: 'Municipality Level - Select 1' },
    { key: 'deputyMayor', title: 'Deputy Mayor', description: 'Municipality Level - Select 1' },
    { key: 'wardChairperson', title: 'Ward Chairperson', description: 'Ward Level - Select 1' },
    { key: 'wardMembers', title: 'Ward Members', description: 'Ward Level - Select up to 4' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Vote className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">NVOTE</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Voter Portal</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* User Info Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-900 text-white rounded-3xl p-6 mb-8 shadow-xl shadow-indigo-200 flex flex-wrap items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{userData.firstName} {userData.lastName}</h2>
              <p className="text-indigo-300 text-xs font-medium">Voter ID: {userData.voterId}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Location</p>
                <p className="text-sm font-semibold">{userData.district}, {userData.municipality}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Ward</p>
                <p className="text-sm font-semibold">No. {userData.ward}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Banner */}
        {hasVoted ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center mb-12"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Vote Submitted Successfully!</h3>
            <p className="text-slate-600">Thank you for participating in the democratic process. Your vote has been recorded securely.</p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Cast Your Vote</h3>
                <p className="text-slate-500">Step 1 of 1: Candidate Selection</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <Info className="w-4 h-4" />
                Live Election 2026
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 font-medium"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}

            {roles.map((role) => (
              <section key={role.key} className="space-y-6">
                <div className="flex items-end gap-4">
                  <h4 className="text-xl font-bold text-slate-900 leading-none">{role.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-none">{role.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates
                    .filter(c => c.role === role.title)
                    .map(candidate => {
                      const isSelected = role.key === 'wardMembers' 
                        ? selections.wardMembers.includes(candidate.id)
                        : (selections as any)[role.key] === candidate.id;

                      return (
                        <motion.div
                          key={candidate.id}
                          whileHover={{ y: -4 }}
                          onClick={() => role.key === 'wardMembers' ? toggleWardMember(candidate.id) : selectSingle(role.key as any, candidate.id)}
                          className={`relative cursor-pointer group p-4 rounded-3xl border-2 transition-all duration-300 flex items-center gap-4 ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' 
                              : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
                          }`}
                        >
                          <div className="relative">
                            <img 
                              src={candidate.photo} 
                              alt={candidate.name} 
                              className="w-16 h-16 rounded-2xl object-cover bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-bold text-slate-900">{candidate.name}</h5>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase ${getPartyColor(candidate.party)}`}>
                                {candidate.party}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Candidate for {candidate.role}</p>
                          </div>

                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </section>
            ))}

            <div className="pt-12 flex justify-center">
              <button 
                onClick={handleSubmit}
                className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 group"
              >
                Submit Your Vote
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-indigo-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Confirm Your Vote</h3>
                <p className="text-slate-500">Are you sure you want to submit your selections? This action cannot be undone.</p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  disabled={isSubmitting}
                  onClick={confirmVote}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Yes, Submit Vote"
                  )}
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
