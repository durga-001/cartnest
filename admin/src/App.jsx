import React, { useState } from "react";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./components/Navbar";
import "tailwindcss";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import Careers from "./pages/Careers";
import Applications from "./pages/Applications";
import Login from "./components/Login";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "$";
const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : "",
  );
  const [role, setRole] = useState(
    localStorage.getItem("role") ? localStorage.getItem("role") : "",
  );
  const [storeName, setStoreName] = useState(
    localStorage.getItem("storeName") ? localStorage.getItem("storeName") : "",
  );

  useEffect(() => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("storeName", storeName);
  }, [token, role, storeName]);

  const logout = () => {
    setToken("");
    setRole("");
    setStoreName("");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login
          setToken={setToken}
          setRole={setRole}
          setStoreName={setStoreName}
        />
      ) : (
        <>
          <Navbar setToken={logout} role={role} storeName={storeName} />
          <hr />
          <div className="flex w-full">
            <Sidebar role={role} />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                {role === "seller" && (
                  <>
                    <Route path="/" element={<Navigate to="/add" />} />
                    <Route path="/add" element={<Add token={token} />} />
                    <Route path="/list" element={<List token={token} />} />
                    <Route
                      path="/edit/:id"
                      element={<EditProduct token={token} />}
                    />
                  </>
                )}
                {role === "siteAdmin" && (
                  <>
                    <Route path="/" element={<Navigate to="/add" />} />
                    <Route path="/add" element={<Add token={token} />} />
                    <Route path="/list" element={<List token={token} />} />
                    <Route
                      path="/edit/:id"
                      element={<EditProduct token={token} />}
                    />
                    <Route path="/orders" element={<Orders token={token} />} />
                    <Route
                      path="/careers"
                      element={<Careers token={token} />}
                    />
                    <Route
                      path="/applications"
                      element={<Applications token={token} />}
                    />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
