import React from "react";
import { assets } from "../assets/assets";
const Navbar = ({ setToken, role, storeName }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <div className="flex items-center gap-3">
        <img className="w-[max(10%,80px)]" src={assets.logo} alt="" />
        {role === "seller" && storeName && (
          <span className="text-sm text-gray-500 border-l pl-3">
            {storeName}
          </span>
        )}
        {role === "siteAdmin" && (
          <span className="text-sm text-gray-500 border-l pl-3">
            Site Admin
          </span>
        )}
      </div>
      <button
        onClick={() => setToken("")}
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
