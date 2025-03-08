import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { Loader, AlertCircle, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from 'framer-motion';

import "./custom.css";

const VerifyEmail = () => {
  // Use an array of strings for each digit
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Create refs for each digit input
  useEffect(() => {
    digitRefs.current = digitRefs.current.slice(0, 6);
  }, []);

  const navigate = useNavigate();
  const { verifyEmail, isLoading, error } = useAuthStore();

  // Helper to get the full code
  const getFullCode = () => codeDigits.join('');

  // Handle input change for each digit
  const handleDigitChange = (index: number, value: string) => {
    // Allow only single digit
    if (!/^\d?$/.test(value)) return;
    
    // Update the digit
    const newCodeDigits = [...codeDigits];
    newCodeDigits[index] = value;
    setCodeDigits(newCodeDigits);
    
    // Auto-focus to next input if a digit was entered
    if (value !== '' && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (codeDigits[index] === '' && index > 0) {
        // If current input is empty and backspace is pressed, go to previous input
        digitRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').substring(0, 6).split('');
    
    const newCodeDigits = [...codeDigits];
    digits.forEach((digit, index) => {
      if (index < 6) newCodeDigits[index] = digit;
    });
    
    setCodeDigits(newCodeDigits);
    
    // Focus the appropriate field after pasting
    if (digits.length < 6) {
      digitRefs.current[digits.length]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = getFullCode();
    
    // Check if code is complete
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '⚠️'
      });
      return;
    }
    
    try {
      await verifyEmail(code);
      toast.success("Email verified successfully", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '✅',
        duration: 4000
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const resendCode = () => {
    // This is a placeholder - you would need to implement the resend functionality in your auth store
    toast.success("Verification code resent", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      icon: '📧'
    });
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
              src="/verify.png" 
              alt="Email verification" 
              className="max-w-md rounded-lg"
            />
            
            <div className="text-center mt-10">
              <h2 className="text-2xl font-bold font-rowdies mb-3">
                Verify Your Email
              </h2>
              <p className="text-blue-100 font-poppins max-w-sm mx-auto">
                We've sent a 6-digit verification code to your email address. Enter the code to complete your registration.
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
            <div className="mb-6 text-center">
              <div className="bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-[#053252]" />
              </div>
              <h1 className="text-3xl font-rowdies text-[#053252]">Verify Your Email</h1>
              <p className="text-gray-600 font-poppins mt-2">
                We've sent a verification code to your email
              </p>
            </div>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 font-poppins text-center">
                  Enter 6-digit code
                </label>
                
                <div className="flex justify-between items-center gap-2 mt-2">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (digitRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-full aspect-square text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-poppins"
                    />
                  ))}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center p-3 text-sm text-red-800 bg-red-50 rounded-lg mt-4"
                  >
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
                
                <p className="text-sm text-gray-500 text-center mt-4 font-poppins">
                  Didn't receive a code? 
                  <button 
                    type="button"
                    onClick={resendCode}
                    className="text-[#053252] hover:text-blue-700 font-semibold ml-1"
                  >
                    Resend
                  </button>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#053252] hover:bg-[#0a4470] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
              >
                {isLoading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-poppins">
                Need to change email?{' '}
                <Link 
                  to="/register" 
                  className="text-[#053252] hover:text-blue-700 font-semibold"
                >
                  Go back
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;