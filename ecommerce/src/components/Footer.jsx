import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center py-10 text-sm">
          <img src={assets.logo} className="mb-5 w-40" alt="CartNest Logo" />

          <p className="max-w-md text-gray-600 leading-6">
            CartNest is your trusted hub for discovering and shopping unique
            artisan products. Whether you're looking for something special or
            everyday essentials, CartNest makes shopping simple, secure, and
            tailored to your needs.
          </p>
        </div>

        <hr />

        <p className="py-5 text-center text-sm text-gray-500">
          © 2025 CartNest. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
