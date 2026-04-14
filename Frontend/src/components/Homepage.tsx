import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

import { 
  Users, 
  Vote, 
  BarChart3, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const SLIDES = [
  {
    url: "/everest.jpg",
    title: "Secure Digital Democracy",
    
  },
  {
    url: "/pokhara.png",
    title: "Transparent Results",
    
  },
  {
    url: "/voting.avif",
    title: "Accessible to All",
    
  }
   
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-red-100 selection:text-red-900 relative">
      {/* Background Image with Low Opacity */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'url("https://nepaleconomicforum.org/wp-content/uploads/2026/01/NEFtake-Website-Thumbnail-2025-1-1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg" 
                  alt="Nepal Flag" 
                  className="h-8 w-auto drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-2xl text-blue-900 tracking-tight">NVOTE</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Home', action: () => navigate('/') },
                { label: 'Candidates', action: () => navigate('/candidate-details') },
                { label: 'Vote', action: () => navigate('/login') },
                { label: 'Results', action: () => navigate('/results') },
                { label: 'Contact', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={item.action}
                  className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                Sign In
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-red-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {[
                  { label: 'Home', action: () => { navigate('/'); setIsMenuOpen(false); } },
                  { label: 'Candidates', action: () => { navigate('/candidate-details'); setIsMenuOpen(false); } },
                  { label: 'Vote', action: () => { navigate('/login'); setIsMenuOpen(false); } },
                  { label: 'Results', action: () => { navigate('/results'); setIsMenuOpen(false); } },
                  { label: 'Contact', action: () => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); } }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="block w-full text-left px-3 py-2 text-base font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg bg-transparent border-none cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-bold"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              
              <h1 className="text-5xl md:text-7xl font-black text-blue-900 tracking-tight leading-[1.1]">
                Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-blue-800">Voting System</span>
              </h1>
              
            </motion.div>

            {/* Main Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-10"
            >
              {[
                { label: 'Candidate Details', icon: Users, color: 'red', path: '/candidate-details' },
                { label: 'Vote Now', icon: CheckCircle2, color: 'blue', path: '/login' },
                { label: 'View Results', icon: BarChart3, color: 'red', path: '/results' }
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(btn.path)}
                  className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border border-red-50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-red-100 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center gap-4"
                >
                  <div className={`w-16 h-16 ${btn.color === 'red' ? 'bg-red-50' : 'bg-blue-50'} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <btn.icon className={`w-8 h-8 ${btn.color === 'red' ? 'text-red-600' : 'text-blue-900'}`} />
                  </div>
                  <span className="text-lg font-bold text-blue-900">{btn.label}</span>
                  <div className={`flex items-center text-sm font-bold ${btn.color === 'red' ? 'text-red-600' : 'text-blue-800'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Get Started <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sliding Image Section */}
      <section className="py-20 bg-slate-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <img 
                  src={SLIDES[currentSlide].url} 
                  alt={SLIDES[currentSlide].title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-12 md:p-20">
                  <div className="max-w-2xl text-white space-y-4">
                    <motion.h3 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl md:text-5xl font-bold"
                    >
                      {SLIDES[currentSlide].title}
                    </motion.h3>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-xl text-slate-200"
                    >
                      {SLIDES[currentSlide].subtitle}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-8 right-12 flex gap-3 z-20">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-blue-900 text-center mb-12">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Email</h3>
              <p className="text-gray-600">contact@nvote.gov.np</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Phone</h3>
              <p className="text-gray-600">+977-1-4123456</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Address</h3>
              <p className="text-gray-600">Kathmandu, Nepal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-white pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg" 
                  alt="Nepal Flag" 
                  className="h-10 w-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-2xl tracking-tight">NAMASKAR</span>
                </div>
              </div>
              <p className="text-slate-300 max-w-sm leading-relaxed">
                 Secure, transparent, and accessible for every citizen.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6"> Links</h4>
              <ul className="space-y-4 text-slate-400">
                {['About Us', 'Privacy Policy', 'Terms of Service'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-red-400 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-4 text-slate-400">
                {[, 'Contact Support', 'FAQ', ].map((link) => (
                  <li key={link}><a href="#" className="hover:text-red-400 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} NVOTE. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <ShieldCheck className="w-4 h-4 text-red-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
