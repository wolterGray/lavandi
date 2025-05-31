import React from "react";
import {Link} from "react-scroll";
import Slider from "./Slider.jsx";
import {motion} from "framer-motion";

function Home() {
  return (
    <motion.section
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{duration: 2, delay: 1.2, ease: "easeOut"}}
      id="home"
      className="font-manrope h-[80vh] relative">
      <Slider />
    </motion.section>
  );
}

export default Home;
