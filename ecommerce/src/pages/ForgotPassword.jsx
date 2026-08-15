import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter otp + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown ticker for the resend cooldown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (sendingOtp || resendTimer > 0) return;

    setSendingOtp(true);
    try {
      const res = await axios.post(backendUrl + "/api/user/send-reset-otp", {
        email,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(2);
        setResendTimer(30); // block resend for 30s so the click is clearly confirmed
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(backendUrl + "/api/user/reset-password", {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={step === 1 ? sendOtp : submitReset}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {step === 1 ? (
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Enter your registered email"
          required
        />
      ) : (
        <>
          <input
            onChange={(e) => setOtp(e.target.value)}
            value={otp}
            type="text"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Enter OTP sent to your email"
            required
          />
          <input
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
            type="password"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Enter new password"
            required
          />
        </>
      )}

      <button
        className="bg-black text-white font-light px-8 py-2 mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={step === 1 && (sendingOtp || resendTimer > 0)}
      >
        {step === 1
          ? sendingOtp
            ? "Sending..."
            : resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Send OTP"
          : "Reset Password"}
      </button>
    </form>
  );
};

export default ForgotPassword;
