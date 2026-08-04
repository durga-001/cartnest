import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = ({ setToken, setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(backendUrl + "/api/user/admin", {
        email,
        password,
      });

      if (response.data.success) {
        setRole("siteAdmin");
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success("Login Successful");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Redirect to User Login
  const goToUserLogin = () => {
    window.location.href = "https://cartnest-zj0x.onrender.com/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Panel</h1>

        <form onSubmit={onSubmitHandler}>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </p>

            <input
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md px-3 py-2 border border-gray-300 outline-none"
            />
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>

            <input
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md px-3 py-2 border border-gray-300 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-black text-white hover:bg-gray-900 transition"
          >
            Login
          </button>

          <button
            type="button"
            onClick={goToUserLogin}
            className="w-full py-2 px-4 mt-3 rounded-md bg-gray-700 text-white hover:bg-gray-800 transition"
          >
            Login as User
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
