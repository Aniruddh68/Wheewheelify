import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import vehicleCar1 from "@/assets/vehicle-car-1.jpg";
import vehicleBike1 from "@/assets/vehicle-bike-1.jpg";
import vehicleEv1 from "@/assets/vehicle-ev-1.jpg";
import vehicleCar2 from "@/assets/vehicle-car-2.jpg";
import vehicleTruck1 from "@/assets/vehicle-truck-1.jpg";
import vehicleBike2 from "@/assets/vehicle-bike-2.jpg";

const StatCountUp = ({ value, suffix = "", label, delay = 0 }: { value: number; suffix?: string; label: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 40, damping: 18 });
  const display = useTransform(springVal, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
    >
      <motion.span className="block text-primary-foreground font-headline font-bold text-2xl mb-1">
        {display}
      </motion.span>
      <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-label">{label}</span>
    </motion.div>
  );
};

const vehicles = [
  { src: vehicleCar1, alt: "Sports car", label: "SPORTS", rotate: -6, z: 60, top: "2%", left: "3%", w: "52%", h: "44%" },
  { src: vehicleBike1, alt: "Sport bike", label: "SUPERBIKE", rotate: 4, z: 35, top: "0%", left: "54%", w: "44%", h: "38%" },
  { src: vehicleEv1, alt: "Electric SUV", label: "EV", rotate: -2, z: 50, top: "36%", left: "50%", w: "48%", h: "36%" },
  { src: vehicleCar2, alt: "Luxury sedan", label: "LUXURY", rotate: 3, z: 25, top: "48%", left: "2%", w: "42%", h: "32%" },
  { src: vehicleTruck1, alt: "Commercial truck", label: "COMMERCIAL", rotate: -4, z: 20, top: "68%", left: "30%", w: "34%", h: "30%" },
  { src: vehicleBike2, alt: "Cruiser bike", label: "CRUISER", rotate: 2, z: 45, top: "62%", left: "60%", w: "38%", h: "36%" },
];

const VehicleCard = ({ v, i }: { v: typeof vehicles[0]; i: number }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -20, y: x * 20 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute rounded-xl overflow-hidden group cursor-pointer"
      style={{
        top: v.top,
        left: v.left,
        width: v.w,
        height: v.h,
        transform: `perspective(800px) rotate(${v.rotate}deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${v.z}px)`,
        boxShadow: `0 ${v.z}px ${v.z * 2}px rgba(0,0,0,0.8), 0 0 ${v.z * 0.8}px rgba(255,26,26,0.08)`,
        transformStyle: "preserve-3d",
        zIndex: v.z,
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
      }}
    >
      <img
        alt={v.alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
        src={v.src}
        loading="lazy"
        width={640}
        height={640}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-70 group-hover:opacity-30 transition-opacity duration-500" />
      <span className="absolute bottom-2 left-3 text-[9px] font-label tracking-[0.25em] uppercase text-primary-foreground/60 group-hover:text-primary transition-colors duration-300">
        {v.label}
      </span>
      <div className="absolute inset-0 border border-foreground/10 rounded-xl group-hover:border-primary/40 transition-colors duration-500" />
      {/* Specular highlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 + tilt.x * 2}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
        }}
      />
    </motion.div>
  );
};

const BuiltWithPurpose = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const floatY = useSpring(useTransform(scrollYProgress, [0, 1], [40, -40]), { stiffness: 50, damping: 20 });

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-8 md:px-32 bg-background border-y border-foreground/5">
      <div className="flex flex-col md:flex-row gap-16 md:gap-20 items-center">
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase text-primary-foreground mb-8">
            Built With <br />
            <span className="text-primary">Purpose.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg">
            Wheelify was founded by automotive engineers and data scientists who realized the car buying process was broken. We don't take commissions from dealers. Our only loyalty is to the data.
          </p>
          <StatCountUp value={100} suffix="%" label="Independent" delay={0.3} />
        </motion.div>

        {/* 3D Floating Vehicle Cards */}
        <motion.div
          className="w-full md:w-1/2 relative"
          style={{ perspective: "1200px", height: "520px", y: floatY }}
        >
          {vehicles.map((v, i) => (
            <VehicleCard key={i} v={v} i={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BuiltWithPurpose;
