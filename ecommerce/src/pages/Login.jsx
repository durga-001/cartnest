import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = ({ setToken, setRole, setStoreName }) => {
  const [tab, setTab] = useState("seller"); // 'seller' | 'siteAdmin'
  const [mode, setMode] = useState("login"); // 'login' | 'register' (seller only)

  const [storeName, setStoreNameInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const resetFields = () => {
    setStoreNameInput("");
    setEmail("");
    setPassword("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (tab === "siteAdmin") {
        const response = await axios.post(backendUrl + "/api/user/admin", {
          email,
          password,
        });
        if (response.data.success) {
          setRole("siteAdmin");
          setStoreName("");
          setToken(response.data.token);
        } else {
          toast.error(response.data.message);
        }
        return;
      }

      // seller tab
      const endpoint =
        mode === "login" ? "/api/seller/login" : "/api/seller/register";
      const payload =
        mode === "login" ? { email, password } : { storeName, email, password };
      const response = await axios.post(backendUrl + endpoint, payload);

      if (response.data.success) {
        setRole("seller");
        setStoreName(response.data.storeName || "");
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

        <div className="flex mb-5 border rounded-md overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => {
              setTab("seller");
              setMode("login");
              resetFields();
            }}
            className={`flex-1 py-2 ${tab === "seller" ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}
          >
            Store Owner
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("siteAdmin");
              resetFields();
            }}
            className={`flex-1 py-2 ${tab === "siteAdmin" ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}
          >
            Site Admin
          </button>
        </div>

        <form onSubmit={onSubmitHandler}>
          {tab === "seller" && mode === "register" && (
            <div className="mb-3 min-w-72">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Store name
              </p>
              <input
                onChange={(e) => setStoreNameInput(e.target.value)}
                value={storeName}
                className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
                type="text"
                placeholder="e.g. Urban Threads"
                required
              />
            </div>
          )}

          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Email address
            </p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black"
            type="submit"
          >
            {tab === "seller"
              ? mode === "login"
                ? "Login"
                : "Create Store Account"
              : "Login"}
          </button>
        </form>

        {tab === "seller" && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            {mode === "login" ? "New seller? " : "Already have a store? "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                resetFields();
              }}
              className="underline cursor-pointer"
            >
              {mode === "login" ? "Create a store account" : "Login instead"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
