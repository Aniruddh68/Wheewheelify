import { useNavigate, useLocation } from 'react-router-dom';
import { useCompare } from '@/context/CompareContext';
import { X, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const MAX_COMPARE = 4;

export default function ComparisonTray() {
  const { compareList, removeFromCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-expand tray when new items are added, unless we are on the compare page
  useEffect(() => {
    if (compareList.length > 0 && location.pathname !== '/compare') {
      setIsMinimized(false);
    }
  }, [compareList.length, location.pathname]);

  if (compareList.length === 0 || location.pathname === '/compare') {
    return null;
  }

  const emptySlots = Math.max(0, MAX_COMPARE - compareList.length);

  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ${isMinimized ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0'}`}>
      <div className="bg-background/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Toggle Bar */}
        <div 
          className="h-10 flex items-center justify-center cursor-pointer border-b border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70">
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {compareList.length} Vehicle{compareList.length !== 1 ? 's' : ''} Selected
          </div>
        </div>

        {/* Tray Content */}
        <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          
          <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
            {compareList.map((v) => (
              <div key={v.id} className="relative bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-4 group">
                <button 
                  onClick={() => removeFromCompare(v.id)}
                  className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={12} />
                </button>
                <div className="w-16 h-12 bg-black/40 rounded flex shrink-0 items-center justify-center overflow-hidden">
                  <img src={v.imageSrc} alt={v.model} className="object-cover h-full scale-110 mix-blend-screen" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold truncate">{v.brand}</p>
                  <p className="text-sm text-white font-semibold truncate">{v.model}</p>
                  <p className="text-xs text-[var(--accent)] mt-0.5">{v.priceLabel}</p>
                </div>
              </div>
            ))}

            {Array.from({ length: emptySlots }).map((_, i) => (
              <button 
                key={`empty-${i}`} 
                onClick={() => navigate('/browse')}
                className="hidden lg:flex border border-dashed border-white/20 rounded-lg p-3 items-center justify-center gap-2 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all outline-none"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">Add Vehicle</span>
              </button>
            ))}
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col items-center">
            <button
              onClick={() => navigate('/compare')}
              disabled={compareList.length < 2}
              className={`w-full md:w-auto px-8 py-3 rounded uppercase tracking-wider font-bold text-sm transition-all shadow-lg ${
                compareList.length >= 2 
                  ? 'bg-white text-black hover:bg-gray-200 hover:scale-105' 
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Compare Now →
            </button>
            {compareList.length < 2 && (
              <p className="text-[10px] text-white/40 mt-2 text-center uppercase tracking-widest hidden md:block">
                Select 1 more to compare
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
