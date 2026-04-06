import { Play } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroCar from "@/assets/hero-car.jpg";

const statsChips = [
  { label: "Petrol Price", value: "₹104.2", suffix: "AVG/L", suffixColor: "text-primary", position: "top-[15%] left-[5%]" },
  { label: "5-Year TCO", value: "₹12.4L", suffix: "(-12%)", suffixColor: "text-green-500", position: "top-[20%] right-[10%]" },
  { label: "Break-Even", value: "28 MO.", suffix: "", suffixColor: "", position: "bottom-[25%] left-[15%]" },
  { label: "Real Mileage", value: "18.4", suffix: "KM/L", suffixColor: "text-muted-foreground", position: "bottom-[30%] right-[5%]" },
];

const bottomStats = [
  { label: "Vehicles Listed", value: "4,280+" },
  { label: "Fuel Types", value: "GAS/EV/HYB" },
  { label: "TCO Analysis", value: "UNLIMITED" },
  { label: "Free to Use", value: "100% OPEN" },
];

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const carY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const carScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section ref={ref} className="relative min-h-screen w-full flex flex-col md:flex-row pt-20 overflow-hidden">
      {/* Left content */}
      <motion.div
        className="w-full md:w-[42%] flex flex-col justify-center px-8 md:pl-16 z-10 py-20"
        style={{ y: textY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-surface-highest border border-foreground/5 rounded-sm mb-6 w-fit"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-label font-bold tracking-[0.2em] text-muted-foreground uppercase">
            INDIA'S #1 VEHICLE INTELLIGENCE PLATFORM
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-[5.5rem] leading-[0.9] font-headline font-black tracking-tighter uppercase mb-8 text-primary-foreground"
        >
          MAKE <br />
          <span className="text-primary text-7xl md:text-[112px] block">SMARTER</span>
          DECISIONS.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-muted-foreground font-body text-lg max-w-md mb-12 leading-relaxed"
        >
          The only automotive intelligence platform designed for the Indian road. Compare total cost of ownership, real-world mileage, and performance benchmarks in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-wrap gap-4"
        >
          <button className="px-8 py-4 bg-primary text-primary-foreground font-headline font-bold uppercase tracking-tighter rounded-sm hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:scale-105 transition-all duration-300">
            Compare Vehicles
          </button>
          <button className="px-8 py-4 bg-transparent border border-muted-foreground/30 text-primary-foreground font-headline font-bold uppercase tracking-tighter rounded-sm hover:border-primary hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <Play size={14} />
            Watch Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Right - car image with floating chips */}
      <div className="w-full md:w-[58%] relative flex items-center justify-center min-h-[500px]" style={{ perspective: "1000px" }}>
        <motion.div
          className="relative w-full h-full flex items-center justify-center p-8 md:p-12"
          style={{ y: carY, scale: carScale }}
        >
          <motion.img
            alt="Wheelify Flagship Vehicle"
            className="w-full h-auto object-contain red-rim-glow z-0"
            src={heroCar}
            width={1280}
            height={720}
            initial={{ opacity: 0, scale: 0.9, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {statsChips.map((chip, idx) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + idx * 0.15 }}
              whileHover={{ scale: 1.08, rotateY: 5, z: 30 }}
              className={`absolute ${chip.position} glass-card p-3 md:p-4 rounded-xl flex flex-col gap-1 w-32 md:w-40 z-20 hidden md:flex backdrop-blur-md`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="text-[10px] font-label text-muted-foreground tracking-widest uppercase">
                {chip.label}
              </span>
              <div className="flex items-end gap-1">
                <span className="text-lg md:text-xl font-headline font-bold text-primary-foreground">
                  {chip.value}
                </span>
                {chip.suffix && (
                  <span className={`text-xs pb-1 font-bold ${chip.suffixColor}`}>
                    {chip.suffix}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom stats banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2 }}
        className="absolute bottom-0 w-full h-auto md:h-[90px] bg-background/40 backdrop-blur-md border-t border-foreground/10 flex items-center px-4 md:px-16 z-30 py-4 md:py-0"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 w-full divide-x divide-foreground/10 gap-y-4 md:gap-y-0">
          {bottomStats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + idx * 0.1 }}
              className="flex flex-col px-4 md:px-8"
            >
              <span className="text-[10px] font-label text-muted-foreground tracking-[0.2em] uppercase">
                {stat.label}
              </span>
              <span className="text-xl md:text-2xl font-headline font-black text-primary-foreground">
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
