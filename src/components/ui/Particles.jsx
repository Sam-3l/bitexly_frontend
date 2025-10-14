import { motion } from "framer-motion";

// Number of particles
const NUM_PARTICLES = 30;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Particles() {
  const particles = Array.from({ length: NUM_PARTICLES });

  return (
    <>
      {particles.map((_, i) => {
        const size = random(3, 8); // pixel size
        const startX = random(0, 100);
        const startY = random(0, 100);
        const duration = random(20, 40); // seconds
        const delay = random(0, 20);

        return (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-30"
            style={{
              width: size,
              height: size,
              top: `${startY}%`,
              left: `${startX}%`,
              filter: "blur(2px)",
            }}
            animate={{
              x: [0, random(-50, 50), 0],
              y: [0, random(-50, 50), 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay,
            }}
          />
        );
      })}
    </>
  );
}