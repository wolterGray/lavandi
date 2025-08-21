import {motion} from "framer-motion";
import Slider from "./Slider";

function Home() {
  return (
    <motion.section
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 2, delay: 1.2, ease: "easeOut"}}
      id="home"
      className="font-manrope relative h-[75vh] sm:h-[70vh] overflow-hidden">
      <Slider />
    </motion.section>
  );
}
export default Home;
