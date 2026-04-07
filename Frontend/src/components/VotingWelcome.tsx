import  { useEffect, useState } from 'react';
import { User, MapPin, Vote, History, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function VotingWelcome() {
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    voterId: string;
  } | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('user_data');
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  // const fullName = userData ? `${userData.firstName} ${userData.lastName}` : 'Voter';
  // const voterId = userData ? userData.voterId : 'Generating...';
  const citizenship = userData ? (userData as any).citizenshipNumber : 'XX-XX-XX-XXXXX';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-all font-bold text-sm shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Authenticated Voter</span>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                Welcome, <span className="text-indigo-600">{userData?.firstName} {userData?.lastName}</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Vote className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight hidden md:block">VoterPortal</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
              <p className="text-slate-500">Manage your voting profile and participate in active elections.</p>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Election Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live Election
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">General Election 2026</h2>
                <p className="text-slate-600 mb-8 max-w-md">Cast your vote for the upcoming local representatives in your ward.</p>
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-3">
                  <Vote className="w-5 h-5" />
                  Cast Your Vote Now
                </button>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Vote className="absolute -right-12 -bottom-12 w-64 h-64 text-indigo-600 opacity-[0.03]" />
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <History className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Previous Votes</p>
                  <p className="text-xl font-bold text-slate-900">4 Elections</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-purple-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Security Status</p>
                  <p className="text-xl font-bold text-slate-900">Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Voter Profile
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">District</span>
                  <span className="text-slate-900 font-medium">Kathmandu</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Municipality</span>
                  <span className="text-slate-900 font-medium">KMC</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Ward No.</span>
                  <span className="text-slate-900 font-medium">32</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 text-sm">Citizenship</span>
                  <span className="text-slate-900 font-medium">{citizenship}</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Edit Profile Details
              </button>
            </div>

            {/* Location Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <MapPin className="w-8 h-8 text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Your Polling Station</h3>
                <p className="text-slate-400 text-sm mb-4">Shree Shanti Shiksha Mandir, Ward 32, Kathmandu</p>
                <button className="text-indigo-400 text-sm font-bold hover:text-indigo-300 transition-colors">
                  View on Map →
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-10 blur-3xl -mr-16 -mt-16"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
