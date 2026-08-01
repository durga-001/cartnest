import React from "react";
import { assets } from "../assets/assets.js";
const Hero = () => {
  return (
    <div className="flex flex-col sm:flex-row h-[550px] rounded-2xl overflow-hidden bg-[var(--accent-soft)]">
      {/* Left */}
      <div className="w-full sm:w-1/2 flex items-center justify-center">
        <div className="text-[#2b2b2b]">
          <div className="flex items-center gap-2">
            <p className="w-8 md:w-11 h-0.5 bg-[var(--accent)]"></p>
            <p className="font-medium text-sm md:text-base tracking-wide uppercase">
              Fresh Picks
            </p>
          </div>

          <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-tight">
            New In Store
          </h1>

          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm md:text-base">Shop Now</p>
            <p className="w-8 md:w-11 h-0.5 bg-[var(--accent)]"></p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="w-full sm:w-1/2 h-full">
        <img
          src={assets.hero_img}
          alt=""
          className="w-full h-full object-cover object-top"
        />
      </div>
    </div>
  );
};

export default Hero;
