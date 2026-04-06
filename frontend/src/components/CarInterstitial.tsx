import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import luxuryCar from "@/assets/luxury-car-interstitial.jpg";

const PARTICLE_COUNT = 18;

const DustParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        top: `${10 + Math.random() * 80}%`,
        size: 1 + Math.random() * 2.5,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 4,
        driftX: -15 + Math.random() * 30,
        driftY: -20 + Math.random() * -10,
        opacityPeak: 0.15 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-foreground/30"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, p.driftY, 0],
            x: [0, p.driftX, 0],
            opacity: [0, p.opacityPeak, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const CarInterstitial = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const carX = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const textY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05]);

  return (
    <section ref={sectionRef} className="w-full px-4 md:px-16 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-7xl mx-auto rounded-xl overflow-hidden"
        style={{ perspective: "1200px" }}
      >
        <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden">
          {/* Dark background with subtle rays */}
          <motion.div
            className="absolute inset-0 bg-background"
            style={{ scale: bgScale }}
          >
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                background: `
                  linear-gradient(125deg, transparent 20%, hsl(var(--foreground) / 0.15) 35%, transparent 50%),
                  linear-gradient(135deg, transparent 40%, hsl(var(--foreground) / 0.08) 55%, transparent 65%),
                  linear-gradient(140deg, transparent 55%, hsl(var(--foreground) / 0.05) 70%, transparent 80%)
                `,
              }}
            />
          </motion.div>

          {/* Car image with 3D parallax */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ x: carX, transformStyle: "preserve-3d" }}
          >
            <motion.img
              src={luxuryCar}
              alt="Luxury black sedan silhouette"
              loading="lazy"
              width={1920}
              height={768}
              className="w-[110%] h-full object-cover"
              style={{
                filter: "brightness(0.3) contrast(1.3) saturate(0.2)",
                maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
              }}
            />
          </motion.div>

          {/* Red rim glow */}
          <motion.div
            className="absolute inset-x-0 top-[15%] h-[70%] pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 80% 20% at 50% 25%, hsl(var(--primary) / 0.12) 0%, transparent 70%),
                radial-gradient(ellipse 70% 15% at 50% 80%, hsl(var(--primary) / 0.1) 0%, transparent 70%),
                radial-gradient(ellipse 15% 50% at 15% 50%, hsl(var(--primary) / 0.06) 0%, transparent 70%),
                radial-gradient(ellipse 15% 50% at 85% 50%, hsl(var(--primary) / 0.06) 0%, transparent 70%)
              `,
              filter: "blur(12px)",
            }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Highlight edges - car silhouette glow */}
          <div
            className="absolute inset-0 mix-blend-screen opacity-20"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 55%, hsl(var(--foreground) / 0.15) 0%, transparent 70%)",
            }}
          />

          {/* Animated light sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background: "linear-gradient(105deg, transparent 0%, transparent 40%, hsl(var(--foreground) / 0.08) 45%, hsl(var(--foreground) / 0.15) 50%, hsl(var(--foreground) / 0.08) 55%, transparent 60%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
          />

          {/* Floating dust particles */}
          <DustParticles />

          {/* Text overlay */}
          <motion.div
            className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-10"
            style={{ y: textY, transformStyle: "preserve-3d" }}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[10px] md:text-xs font-label text-muted-foreground tracking-[0.3em] uppercase mb-4 md:mb-6"
            >
              Experience the Future with Wheelify.
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-6xl lg:text-7xl font-headline font-black tracking-tighter text-primary-foreground leading-[0.95]"
            >
              Beyond the Road
            </motion.h2>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-6xl lg:text-7xl font-headline font-light tracking-tight text-primary-foreground/80 mt-1 md:mt-2"
            >
              Redefining Future Travel
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute top-[20%] right-8 md:right-16 max-w-[200px] text-[10px] md:text-xs text-muted-foreground/60 leading-relaxed font-body hidden md:block"
            >
              Step into a world of unparalleled innovation and sustainable elegance with our cutting-edge intelligence.
            </motion.p>
          </motion.div>

          {/* Gradient fades */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background/60 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent" />

          <div className="absolute inset-0 border border-foreground/5 rounded-xl" />
        </div>
      </motion.div>
    </section>
  );
};

export default CarInterstitial;
