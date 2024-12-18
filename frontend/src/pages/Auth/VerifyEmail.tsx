import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

import "./custom.css";

const VerifyEmail = () => {
  const [code, setCode] = React.useState("");

  const navigate = useNavigate();

  const { verifyEmail, isLoading, error } = useAuthStore();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail(code);
      navigate("/login");
      toast.success("Email Verified Successfully");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex flex-row auth-page">
      <div className="flex flex-col w-1/2">
        <a href="/" className="flex flex-row">
          <img src="/Logo.png" alt="logo" />  
        </a>
        <div className='flex justify-center items-center h-4/5'>
          <img src="/verify.png" alt="banner" />
        </div>
      </div>
      <div className="flex flex-col w-1/2 justify-center items-center min-h-screen customBackground">
        <form
          onSubmit={handleVerify}
          className="flex flex-col bg-white p-4 w-3/4 rounded-lg "
        >
          <h1 className="text-3xl font-rowdies py-8 text-center">
            {" "}
            Verify Email{" "}
          </h1>
          <label className="text-l font-poppins py-2">
            {" "}
            Enter 6 digit code{" "}
          </label>
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {error && (
            <p className="text-red-500 text-sm font-poppins">{error}</p>
          )}

          <button className="customColorButton text-white text-xl py-2 rounded-3xl mt-4 mb-8 w-1/3 self-center">
            {" "}
            {isLoading ? (
              <Loader className="animate-spin mx-auto" size={24} />
            ) : (
              "Verify"
            )}{" "}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
