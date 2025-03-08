import React, { useState } from 'react';
import { ArrowLeft, Mail, Loader, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import "./custom.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, error, forgotPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Left Panel - Brand Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="hidden md:flex md:w-1/2 bg-[#053252] text-white"
      >
        <div className="w-full flex flex-col justify-between p-12">
          <div className="flex justify-start">
            <Link to="/">
              <img src="/Logo.png" alt="VisuGrow" className="h-26" />
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-grow">
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              src="/forgotBanner.png" 
              alt="Password recovery" 
              className="max-w-md rounded-lg"
            />
            
            <div className="text-center mt-10">
              <h2 className="text-2xl font-bold font-rowdies mb-3">
                Forgot Your Password?
              </h2>
              <p className="text-blue-100 font-poppins max-w-sm mx-auto">
                No worries! We'll send you a secure link to reset your password and get you back to analyzing your data.
              </p>
            </div>
          </div>
          
          <div className="text-center text-blue-200 text-sm">
            © {new Date().getFullYear()} VisuGrow. All rights reserved.
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-16 bg-gradient-to-br from-blue-50 to-white"
      >
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-[#053252] mb-8 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to login
            </Link>

            {!isSubmitted ? (
              <>
                <h1 className="text-3xl font-rowdies text-[#053252] mb-4">Password Recovery</h1>
                <p className="text-gray-600 font-poppins mb-8">
                  Enter your email address and we'll send you a link to reset your password
                </p>
                
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 font-poppins">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-poppins"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center p-3 text-sm text-red-800 bg-red-50 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#053252] hover:bg-[#0a4470] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
                  >
                    {isLoading ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <>
                        Send Recovery Link 
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="bg-green-50 rounded-full h-24 w-24 flex items-center justify-center mb-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle size={48} className="text-green-500" />
                  </motion.div>
                </div>
                
                <h2 className="text-2xl font-rowdies text-gray-800 mb-3">Email Sent Successfully</h2>
                
                <p className="text-gray-600 font-poppins mb-2">
                  We've sent a recovery link to:
                </p>
                <p className="font-medium text-[#053252] mb-6 break-all">
                  {email}
                </p>
                
                <p className="text-gray-500 text-sm mb-8 max-w-xs">
                  Please check your inbox and follow the instructions to reset your password. The link will expire in 30 minutes.
                </p>
                
                <div className="flex flex-col space-y-3 w-full">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-[#053252] hover:bg-[#0a4470] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
                  >
                    <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={18} />
                    Back to Login
                  </button>
                  
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full bg-transparent border border-gray-300 hover:border-[#053252] text-gray-700 hover:text-[#053252] font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Try Another Email
                  </button>
                </div>
              </motion.div>
            )}
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-poppins">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-[#053252] hover:text-blue-700 font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;