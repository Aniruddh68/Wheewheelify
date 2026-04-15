import { motion } from "framer-motion";

const footerLinks = {
  Platform: ["Intelligence", "Comparison Engine", "TCO Calculator"],
  Vehicles: ["Electric", "High Performance", "Hybrid Systems"],
  Legal: ["Privacy Policy", "Terms of Service", "Press Kit"],
};

const Footer = () => {
  return (
    <footer className="relative w-full pt-20 pb-10 bg-footer font-headline uppercase overflow-hidden">
      <div className="h-px bg-primary w-full absolute top-0" />

      <div className="flex flex-col items-center w-full px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full mb-20 px-4 md:px-8">
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-2xl font-black text-primary-foreground tracking-tighter">
              Wheelify<span className="text-primary">.</span>
            </div>
            <p className="text-xs text-muted-foreground normal-case leading-relaxed font-body">
              The new benchmark in automotive selection. Engineered for performance, designed for clarity.
            </p>
          </motion.div>

          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div
              key={category}
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
              viewport={{ once: true }}
            >
              <h5 className="text-primary-foreground font-bold text-sm tracking-widest">{category}</h5>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link}>
                    <a className="text-muted-foreground hover:text-primary transition-colors text-xs" href="#">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Giant brand text */}
        <motion.div
          className="w-full relative py-10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
        >
          <span className="text-[12vw] md:text-[15vw] font-black leading-none tracking-tighter text-center w-full block text-gradient-fade select-none">
            WHEELIFY
          </span>
          <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-primary font-black tracking-[0.3em] text-sm md:text-lg whitespace-nowrap">
              Decide Better. Drive Smarter.
            </span>
          </div>
        </motion.div>

        <div className="w-full flex justify-center items-center mt-10 text-[10px] text-muted-foreground tracking-widest gap-8">
          <a className="hover:text-primary-foreground transition-colors" href="#">INSTAGRAM</a>
          <a className="hover:text-primary-foreground transition-colors" href="#">TWITTER</a>
          <a className="hover:text-primary-foreground transition-colors" href="#">YOUTUBE</a>
        </div>
      </div>

      <div className="h-px bg-primary w-full absolute bottom-0" />
    </footer>
  );
};

export default Footer;
