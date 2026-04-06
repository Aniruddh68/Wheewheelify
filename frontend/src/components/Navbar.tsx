import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Models", active: true },
  { label: "How it works", active: false },
  { label: "Why Wheelify", active: false },
  { label: "About", active: false },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-foreground/5 flex justify-between items-center px-8 h-20 shadow-2xl">
      <div className="text-2xl font-black font-headline uppercase tracking-tighter text-primary-foreground">
        Wheelify<span className="text-primary">.</span>
      </div>

      <div className="hidden md:flex items-center gap-10">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href="#"
            className={`font-headline font-bold uppercase tracking-tighter transition-colors ${
              link.active
                ? "text-primary-foreground border-b-2 border-primary pb-1"
                : "text-muted-foreground hover:text-primary-foreground"
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>

      <button className="hidden md:block bg-primary text-primary-foreground px-6 py-2 font-headline font-bold uppercase tracking-tighter rounded-sm active:scale-95 transition-transform hover:brightness-90">
        Configure
      </button>

      <button
        className="md:hidden text-primary-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-foreground/5 flex flex-col p-8 gap-6 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href="#"
              className={`font-headline font-bold uppercase tracking-tighter ${
                link.active ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
          <button className="bg-primary text-primary-foreground px-6 py-2 font-headline font-bold uppercase tracking-tighter rounded-sm w-fit">
            Configure
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
