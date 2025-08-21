import React from "react";
import {FaArrowRightLong} from "react-icons/fa6";

function CustomButton({text, onClick}) {
  // const handleClick = () => {
  //   if (onClick) {
  //     onClick(true);
  //   } else {
  //     console.log("Кнопка нажата, но onClick не передан");
  //   }
  // };

  return (
    <a
      type="button"
      // onClick={handleClick}
      target="_blank"
      href="https://nuarr.booksy.com/a"
      className="
        relative cursor-pointer 
        bg-secondaryColor border-primaryColor/50 border 
        inline-flex items-center justify-center 
        px-4 py-4 text-xl sm:w-max w-full
        sm:px-6 sm:py-3 sm:text-base
        md:px-6 md:py-3 md:text-lg
        rounded-full text-primaryColor hover:text-secondaryColor 
        tracking-wide overflow-hidden transition-all duration-500 group
      ">
      <span className="absolute inset-0 bg-primaryColor transition-transform duration-500 ease-in-out transform -translate-x-full group-hover:translate-x-0 z-0" />

      <span className="relative z-10 flex items-center gap-2">
        <span className="transition-all duration-500 group-hover:translate-x-2">
          {text}
        </span>
        <FaArrowRightLong className="transition-all duration-500 transform group-hover:translate-x-1" />
      </span>
    </a>
  );
}

export default CustomButton;
