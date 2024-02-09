"use client";

import { motion, useAnimate } from "framer-motion";
import { cubicBezier } from "framer-motion";
import { RouletteNumbers } from "../auxiliares/roulette-numbers";

type RouletteWheelProps = {
  spinDegrees: number;
  onAnimationComplete: () => void;
};

export default function RouletteWheel({
  spinDegrees,
  onAnimationComplete,
}: RouletteWheelProps) {
  const rouletteNumbersCircunferenceAngle =
    (Math.PI * 24) / RouletteNumbers.length;

  return (
    <div className="w-96 h-96 relative">
      <motion.div
        className="w-full h-full border-4 border-white rounded-full relative"
        animate={{ rotate: spinDegrees }}
        transition={{ duration: 10, ease: [0.5, 0.1, 0.1, 1] }}
        onAnimationComplete={onAnimationComplete}
      >
        {RouletteNumbers.map((rouletteNumber, index) => {
          const degrees = (360 / RouletteNumbers.length) * index;

          return (
            <div
              key={rouletteNumber.value}
              className={`
          w-6 h-1/2 absolute top-0 left-1/2 
          transform origin-bottom
          flex alice-center justify-center
          bg-white
          `}
              style={{
                width: `${rouletteNumbersCircunferenceAngle}rem`,
                rotate: `${degrees}deg`,
                translate: `-50%`,
                clipPath: "polygon(0% 0, 100% 0, 50% 100%)",
              }}
            >
              <div
                className={`
              text-white 
                text-center text-sm
               `}
                style={{
                  width: "88%",
                  backgroundColor: rouletteNumber.color,
                  clipPath: "polygon(0% 0, 100% 0, 50% 100%)",
                }}
              >
                {rouletteNumber.value}
              </div>
            </div>
          );
        })}

        <div
          id="inline-circle"
          className="
            w-1/3 h-1/3 border-4 border-gray-300 rounded-full 
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            flex items-center justify-center bg-white opacity-95 
            text-black text-center font-bold text-xl"
        >
          Gamba`s <br /> Casino
        </div>
      </motion.div>

      <div
        id="pointer"
        className="h-6 w-3 bg-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 rotate-180"
        style={{
          clipPath: "polygon(0% 0, 100% 0, 50% 100%)",
        }}
      ></div>
    </div>
  );
}
