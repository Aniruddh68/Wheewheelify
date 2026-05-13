import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";


type NavLinkItem = {
  label: string;
  href?: string;
  dropdown?: NavLinkItem[];
};

const navLinks: NavLinkItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Explore Vehicles",
    dropdown: [
      {
        label: "Browse Vehicles",
        dropdown: [
          { label: "Cars", href: "/browse?category=cars" },
          { label: "Bikes & Scooters", href: "/browse?category=twowheelers" },
        ]
      },
      { label: "Upcoming Launches", href: "#" },
    ],
  },
  {
    label: "Analysis Tools",
    dropdown: [
      { label: "🤖 AI Vehicle Recommender", href: "/ai-recommender" },
      { label: "Fuel Cost Calculator", href: "/fuel-calculator" },
      { label: "15-Year TCO", href: "/tco" },
      { label: "Break-Even Analysis", href: "/break-even" },
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



const DesktopSubDropdown = ({ item }: { item: NavLinkItem }) => {
  if (!item.dropdown) {
    return (
      <Link
        to={item.href || "#"}
        className="px-4 py-3 text-sm font-heading font-bold uppercase tracking-wide text-muted-foreground hover:text-primary-foreground hover:bg-white/5 transition-colors block"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative group/sub w-full">
      <button className="w-full text-left px-4 py-3 text-sm font-heading font-bold uppercase tracking-wide text-muted-foreground hover:text-primary-foreground hover:bg-white/5 transition-colors flex justify-between items-center">
        {item.label}
        <ChevronRight size={16} className="text-muted-foreground/50" />
      </button>
      <div className="absolute top-0 left-full ml-1 w-52 bg-background/95 backdrop-blur-xl border border-foreground/5 rounded-md shadow-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible group-focus-within/sub:opacity-100 group-focus-within/sub:visible transition-all flex flex-col py-2 z-50">
        {item.dropdown.map((sub) => (
          <Link
            key={sub.label}
            to={sub.href || "#"}
            className="px-4 py-3 text-sm font-heading font-bold uppercase tracking-wide text-muted-foreground hover:text-primary-foreground hover:bg-white/5 transition-colors block"
          >
            {sub.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

const DesktopDropdown = ({ item }: { item: NavLinkItem }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 font-heading font-bold uppercase tracking-wide text-muted-foreground hover:text-primary-foreground transition-colors py-2">
        {item.label}
        {item.dropdown && <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />}
      </button>
      {item.dropdown && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-background/95 backdrop-blur-xl border border-foreground/5 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all flex flex-col py-2 z-50">
          {item.dropdown.map((sub) => (
            <DesktopSubDropdown key={sub.label} item={sub} />
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
        className="font-headline font-bold uppercase tracking-tighter text-muted-foreground hover:text-primary-foreground block py-1"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between font-headline font-bold uppercase tracking-tighter text-muted-foreground hover:text-primary-foreground w-full text-left py-1"
      >
        {item.label}
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 pl-4 border-l-2 border-foreground/10 mt-1 pb-2">
          {item.dropdown.map((sub) => (
            <MobileDropdown key={sub.label} item={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { compareList } = useCompare();
  const { currentUser, loading, loginWithGoogle, logout } = useAuth();

  const handleCompareClick = () => {
    if (compareList.length >= 2) {
      // Already have vehicles selected — go straight to compare
      navigate('/compare');
    } else {
      // Go to browse so user can pick vehicles
      navigate('/browse');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-foreground/5 flex justify-between items-center px-8 h-20 shadow-2xl">
      <Link to="/" className="text-2xl font-black font-headline uppercase tracking-tighter text-primary-foreground hover:opacity-90 transition-opacity">
        Wheelify<span className="text-primary">.</span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-8">
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

        {/* Compare Vehicles — Smart button with badge */}
        <button
          onClick={handleCompareClick}
          className="relative flex items-center gap-2 font-heading font-bold uppercase tracking-wide transition-colors text-muted-foreground hover:text-primary-foreground py-2"
        >
          Compare Vehicles
          {compareList.length >= 1 && (
            <span className="absolute -top-1 -right-4 bg-yellow-400 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {compareList.length}
            </span>
          )}
        </button>
        {/* Auth Desktop */}
        <div className="ml-4 flex items-center">
          {loading ? (
            <div className="w-24 h-10 bg-foreground/10 animate-pulse rounded-sm"></div>
          ) : currentUser ? (
            <div className="relative group">
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}&background=random`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border border-primary/30 object-cover" 
                />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-background/95 backdrop-blur-xl border border-foreground/5 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50">
                <div className="px-4 py-2 border-b border-foreground/10 mb-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="font-bold block text-foreground">{currentUser.displayName || "User"}</span>
                  <span className="text-muted-foreground text-xs">{currentUser.email}</span>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-muted-foreground hover:text-primary-foreground hover:bg-white/5 transition-colors block">My Garage</button>
                <button 
                  onClick={logout} 
                  className="w-full text-left px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                  Logout <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="bg-primary text-primary-foreground px-6 py-2 font-headline font-bold uppercase tracking-tighter rounded-sm active:scale-95 transition-transform hover:brightness-90"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

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
          
          <div className="mt-4 pt-4 border-t border-foreground/10">
            {loading ? (
              <div className="w-full h-10 bg-foreground/10 animate-pulse rounded-sm"></div>
            ) : currentUser ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}&background=random`} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border border-primary/30 object-cover" 
                  />
                  <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="font-bold text-sm">{currentUser.displayName || "User"}</span>
                    <span className="text-muted-foreground text-xs">{currentUser.email}</span>
                  </div>
                </div>
                <button className="bg-white/5 text-foreground px-6 py-2 font-headline font-bold uppercase tracking-tighter rounded-sm w-full text-left">
                  My Garage
                </button>
                <button 
                  onClick={logout}
                  className="bg-red-500/10 text-red-400 px-6 py-2 font-headline font-bold uppercase tracking-tighter rounded-sm w-full flex items-center justify-between"
                >
                  Logout <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="bg-primary text-primary-foreground px-6 py-2 font-headline font-bold uppercase tracking-tighter rounded-sm w-full"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
