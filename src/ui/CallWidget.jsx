import React from "react";
import { FaPhoneAlt } from "react-icons/fa";

function CallWidget({ phone = "+48 123 456 789" }) {
  return (
    <>
      <style>
        {`
          @keyframes subtle-glow {
            0%   { transform: scale(1);   box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); }
            50%  { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 215, 0, 0.35); }
            100% { transform: scale(1);   box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); }
          }
        `}
      </style>

      <a
        href={`tel:${phone}`}
        className="
          fixed bottom-10 right-6 z-50
          flex items-center justify-center
          w-14 h-14 md:w-16 md:h-16
          rounded-full
          bg-black/40 backdrop-blur-md
          text-primaryColor
          border border-yellow-500/30
          hover:scale-105 active:scale-95
          transition-all duration-200
			 
        "
        style={{
          animation: "subtle-glow 2s infinite ease-in-out",
        }}
      >
        <FaPhoneAlt className="text-lg md:text-xl" />
      </a>
    </>
  );
}

export default CallWidget;
