import { ClipboardList, BarChart3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Input Profile",
    desc: "Tell us your daily commute, city constraints, and fuel preferences. We model your specific usage pattern.",
    mt: "",
  },
  {
    num: "02",
    icon: BarChart3,
    title: "Deep Compare",
    desc: "Our engine simulates 5-year running costs, factoring in maintenance schedules and local fuel volatility.",
    mt: "md:mt-24",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Final Verdict",
    desc: 'Get a ranked list of vehicles with a definitive "True Cost" score. No marketing fluff, just raw data.',
    mt: "md:mt-48",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 md:py-32 px-8 md:px-32 relative bg-background overflow-hidden">
      <motion.div
        className="text-center mb-16 md:mb-24 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <span className="text-primary font-headline font-black tracking-[0.4em] uppercase text-xs mb-4 block">
          Engineered Workflow
        </span>
        <h2 className="text-4xl md:text-7xl font-headline font-black tracking-tighter uppercase text-primary-foreground">
          The Intelligence Loop
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            className={`relative group ${step.mt}`}
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            style={{ perspective: "600px" }}
          >
            <span className="absolute -top-20 md:-top-32 -left-6 md:-left-12 ghost-number select-none text-[8rem] md:text-[20rem]">
              {step.num}
            </span>
            <motion.div
              className="glass-card p-8 md:p-10 rounded-sm relative z-10 hover:border-primary transition-all duration-500 min-h-[280px] md:min-h-[320px] flex flex-col justify-end"
              whileHover={{
                rotateY: 3,
                rotateX: -2,
                scale: 1.03,
                boxShadow: "0 25px 60px rgba(255,26,26,0.12), 0 0 40px rgba(255,26,26,0.06)",
              }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-12 h-12 bg-primary rounded-full mb-6 flex items-center justify-center">
                <step.icon className="text-primary-foreground" size={20} />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase text-primary-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
