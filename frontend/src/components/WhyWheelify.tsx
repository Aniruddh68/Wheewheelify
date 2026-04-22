import { BarChart2 } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import techDashboard from "@/assets/tech-dashboard.jpg";

const Speedometer = ({ active }: { active: boolean }) => {
  const needleRotation = active ? 75 : -67;
  return (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none">
      <path
        d="M 10 55 A 40 40 0 0 1 90 55"
        stroke="hsl(var(--foreground) / 0.1)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M 10 55 A 40 40 0 0 1 90 55"
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="126"
        initial={{ strokeDashoffset: 126 }}
        animate={{ strokeDashoffset: active ? 10 : 110 }}
        transition={{ type: "spring", bounce: 0.35, duration: 1.2 }}
      />
      {[...Array(7)].map((_, i) => {
        const angle = -180 + i * 30;
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 36 * Math.cos(rad);
        const y1 = 55 + 36 * Math.sin(rad);
        const x2 = 50 + 40 * Math.cos(rad);
        const y2 = 55 + 40 * Math.sin(rad);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1" />
        );
      })}
      <motion.line
        x1="50" y1="55" x2="50" y2="20"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ originX: 0.5, originY: 1 }}
        initial={{ rotate: -67 }}
        animate={{ rotate: needleRotation }}
        transition={{ type: "spring", bounce: 0.35, duration: 1.2 }}
      />
      <circle cx="50" cy="55" r="3" fill="hsl(var(--primary))" />
    </svg>
  );
};

const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 20 });
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
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

const WhyWheelify = () => {
  const [speedoActive, setSpeedoActive] = useState(false);
  return (
    <section className="py-24 md:py-32 px-8 md:px-16 bg-background" style={{ perspective: "1200px" }}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-auto">
        {/* Precision Intelligence */}
        <motion.div
          className="md:col-span-8 bg-surface-low p-10 md:p-12 relative overflow-hidden flex flex-col justify-end group min-h-[300px] md:min-h-[350px] rounded-sm"
          initial={{ opacity: 0, x: -40, rotateY: -5 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute top-0 right-0 w-full h-full opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700">
            <img alt="Technology Dashboard" className="w-full h-full object-cover" src={techDashboard} loading="lazy" width={1280} height={720} />
          </div>
          <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
            <h3 className="text-3xl md:text-4xl font-headline font-black tracking-tighter uppercase mb-4 text-primary-foreground">
              Precision Intelligence
            </h3>
            <p className="text-muted-foreground max-w-md">
              Access proprietary data sets on maintenance costs, residual value, and regional pricing across all 28 Indian states.
            </p>
          </div>
        </motion.div>

        {/* Market Redline */}
        <motion.div
          className="md:col-span-4 bg-primary p-10 md:p-12 flex flex-col justify-between group cursor-default min-h-[280px] rounded-sm"
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <BarChart2 className="text-primary-foreground w-16 h-16" />
          <div style={{ transform: "translateZ(20px)" }}>
            <h3 className="text-2xl md:text-3xl font-headline font-black tracking-tighter uppercase text-primary-foreground mb-4">
              Market Redline
            </h3>
            <p className="text-primary-foreground/80 text-sm">
              Real-time dealer quote analysis for your specific pin code. No more guessing MSRP vs. Final price.
            </p>
          </div>
        </motion.div>

        {/* Accuracy stat */}
        <motion.div
          className="md:col-span-4 bg-surface-high p-8 flex flex-col items-center justify-center text-center border-t border-primary/20 rounded-sm"
          initial={{ opacity: 0, scale: 0.85, rotateY: 10 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <span className="text-5xl font-headline font-black text-primary-foreground mb-2" style={{ transform: "translateZ(25px)" }}>
            <CountUp target={98} suffix="%" />
          </span>
          <span className="text-[10px] font-label text-muted-foreground tracking-widest uppercase">
            Accuracy Rate
          </span>
        </motion.div>

        {/* Verified Data Streams */}
        <motion.div
          className="md:col-span-8 bg-surface-low p-8 flex items-center gap-8 border-t border-foreground/5 rounded-sm"
          initial={{ opacity: 0, x: 40, rotateY: 5 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          viewport={{ once: true }}
          style={{ transformStyle: "preserve-3d" }}
          onMouseEnter={() => setSpeedoActive(true)}
          onMouseLeave={() => setSpeedoActive(false)}
        >
          <div className="w-20 h-20 shrink-0">
            <Speedometer active={speedoActive} />
          </div>
          <div style={{ transform: "translateZ(15px)" }}>
            <h4 className="font-headline font-bold uppercase tracking-tight text-primary-foreground">
              Verified Data Streams
            </h4>
            <p className="text-sm text-muted-foreground">
              Aggregating from 200+ sources including OEM spec sheets and real-user logs.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyWheelify;
