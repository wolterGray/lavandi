import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";

function CustomButton({children}) {
  return (
    <a
      href="https://lavandi.booksy.com/a/"
      target="_blank"
      rel="noopener noreferrer"
      role="link"
      className="relative cursor-pointer bg-primaryColor-600 inline-flex items-center justify-center px-6 py-3 rounded-full   text-mainColor text-md tracking-wide overflow-hidden transition-all duration-500 group">
      <span className="absolute inset-0 bg-primaryColor-700 transition-transform duration-500 ease-in-out transform translate-x-[-100%]  group-hover:translate-x-0 z-0 " />

      <span className="relative z-10 flex items-center gap-2">
        <span className="transition-all duration-500 group-hover:translate-x-2">
          {children}
        </span>
        <FaArrowRightLong className="transition-all duration-500 transform group-hover:translate-x-1" />
      </span>
    </a>
  );
}

export default CustomButton;
