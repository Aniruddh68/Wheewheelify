import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

type NavLinkItem = {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
};

const navLinks: NavLinkItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Explore Vehicles",
    dropdown: [
      { label: "Browse All", href: "/browse" },
      { label: "Upcoming Launches", href: "#" },
      { label: "Compare Vehicles", href: "#" },
    ],
  },
  {
    label: "Analysis Tools",
    dropdown: [
      { label: "Fuel Cost Calculator", href: "#" },
      { label: "5-Year TCO", href: "#" },
      { label: "Break-Even Analysis", href: "#" },
    ],
  },
  {
    label: "Learn",
    dropdown: [
      { label: "How It Works", href: "#" },
      { label: "About Wheelify", href: "#" },
    ],
  },
];

const DesktopDropdown = ({ item }: { item: NavLinkItem }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 font-heading font-bold uppercase tracking-wide text-muted-foreground hover:text-primary-foreground transition-colors py-2">
        {item.label}
        {item.dropdown && <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />}
      </button>
      {item.dropdown && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-background/95 backdrop-blur-xl border border-foreground/5 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50">
          {item.dropdown.map((sub) => (
            <Link
              key={sub.label}
              to={sub.href || "#"}
              className="px-4 py-3 text-sm font-heading font-bold uppercase tracking-wide text-muted-foreground hover:text-primary-foreground hover:bg-white/5 transition-colors"
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const MobileDropdown = ({ item }: { item: NavLinkItem }) => {
  const [open, setOpen] = useState(false);

  if (!item.dropdown) {
    return (
      <Link
        to={item.href || "#"}
        className="font-headline font-bold uppercase tracking-tighter text-muted-foreground hover:text-primary-foreground"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between font-headline font-bold uppercase tracking-tighter text-muted-foreground hover:text-primary-foreground w-full text-left"
      >
        {item.label}
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 pl-4 border-l-2 border-foreground/10 mt-2">
          {item.dropdown.map((sub) => (
            <Link
              key={sub.label}
              to={sub.href || "#"}
              className="text-sm font-headline uppercase tracking-tighter text-muted-foreground hover:text-primary-foreground"
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-foreground/5 flex justify-between items-center px-8 h-20 shadow-2xl">
      <Link to="/" className="text-2xl font-black font-headline uppercase tracking-tighter text-primary-foreground hover:opacity-90 transition-opacity">
        Wheelify<span className="text-primary">.</span>
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {navLinks.map((link) => (
          link.dropdown ? (
            <DesktopDropdown key={link.label} item={link} />
          ) : (
            <Link
              key={link.label}
              to={link.href || "#"}
              className="font-heading font-bold uppercase tracking-wide transition-colors text-muted-foreground hover:text-primary-foreground py-2"
            >
              {link.label}
            </Link>
          )
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
        <div className="absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-foreground/5 flex flex-col p-8 gap-6 md:hidden max-h-[calc(100vh-5rem)] overflow-y-auto">
          {navLinks.map((link) => (
            <MobileDropdown key={link.label} item={link} />
          ))}
          <button className="bg-primary text-primary-foreground px-6 py-2 font-headline font-bold uppercase tracking-tighter rounded-sm w-fit mt-4">
            Configure
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
