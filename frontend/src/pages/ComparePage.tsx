import { useCompare } from '@/context/CompareContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ComparePage() {
  const { compareList, removeFromCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length < 2) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col pt-20">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-black to-black">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
            <CheckCircle2 size={40} className="text-white/20" />
          </div>
          <h1 className="text-4xl font-headline font-black uppercase tracking-tighter mb-4">Comparison Builder</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            You need to select at least 2 vehicles to see a head-to-head comparison. Go browse the fleet and add vehicles to your tray.
          </p>
          <button 
            onClick={() => navigate('/browse')}
            className="bg-primary text-primary-foreground px-8 py-3 font-headline font-bold uppercase tracking-tighter rounded-sm active:scale-95 transition-transform hover:brightness-110 flex items-center gap-2"
          >
            Browse Vehicles <ChevronRight size={18} />
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Derive winners
  const prices = compareList.map(v => v.minPrice).filter(p => p > 0);
  const bestPrice = prices.length ? Math.min(...prices) : null;

  const getMileageNum = (v: import('@/utils/parseVehicles').VehicleGroup) => {
    const primaryStr = v.variants[0]?.isEV ? v.variants[0]?.range : v.variants[0]?.mileage;
    return parseFloat(primaryStr?.toString().replace(/[^\d.]/g, '')) || 0;
  };
  const bestMileage = Math.max(...compareList.map(getMileageNum));

  const getEngineNum = (v: import('@/utils/parseVehicles').VehicleGroup) => {
    const raw = v.variants[0]?.engineCC || v.variants[0]?.engine || '0';
    return parseInt(raw.toString().replace(/[^\d]/g, ''), 10) || 0;
  };
  const bestEngine = Math.max(...compareList.map(getEngineNum));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 border border-white/10 px-4 py-2 rounded-full w-fit bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-12">
          <p className="text-[var(--accent)] font-bold text-sm tracking-widest uppercase mb-2">Head-to-Head Details</p>
          <h1 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Compare Vehicles</h1>
        </div>

        {/* Dynamic Grid */}
        <div className="overflow-x-auto pb-8">
          <div className={`min-w-[800px] grid gap-0 border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] ${
            {
              2: 'grid-cols-3',
              3: 'grid-cols-4',
              4: 'grid-cols-5'
            }[compareList.length] || 'grid-cols-3'
          }`}>
            
            {/* Headers Row */}
            <div className="p-6 border-b border-r border-white/10 flex items-end bg-black/40">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white/40">Dimensions <br/>& Specs</h2>
            </div>
            
            {compareList.map((v) => (
              <div key={v.id} className="p-6 border-b border-r border-white/10 relative group bg-black/20 text-center">
                <button 
                  onClick={() => removeFromCompare(v.id)}
                  className="absolute top-4 right-4 text-white/30 hover:text-red-500 transition-colors"
                  title="Remove from comparison"
                >
                  <X size={20} />
                </button>
                <div className="h-40 flex items-center justify-center mb-4 p-4">
                  <img src={v.imageSrc} alt={v.model} className="max-h-full max-w-full object-contain mix-blend-screen scale-110 drop-shadow-2xl" />
                </div>
                <p className="text-xs text-[var(--accent)] font-bold tracking-widest uppercase mb-1">{v.brand}</p>
                <h3 className="text-2xl font-black font-headline uppercase tracking-tighter truncate">{v.model}</h3>
                <p className="text-lg font-medium text-white/80 mt-2">{v.priceLabel}</p>
              </div>
            ))}

            {/* Spec Rows */}
            {/* Starting Price Row */}
            <div className="p-4 px-6 border-b border-r border-white/10 font-bold text-white/50 uppercase tracking-widest text-xs flex items-center bg-black/40">Starting Price</div>
            {compareList.map((v) => {
              const isWinner = v.minPrice === bestPrice && v.minPrice > 0;
              return (
                <div key={`${v.id}-price`} className={`p-4 px-6 border-b border-r border-white/10 flex items-center justify-center ${isWinner ? 'bg-green-500/10' : ''}`}>
                  <span className={`font-semibold ${isWinner ? 'text-green-400' : 'text-white'}`}>
                    ₹{v.minPrice > 0 ? (v.minPrice % 1 === 0 ? v.minPrice : v.minPrice.toFixed(2)) + ' Lakh' : 'TBA'}
                  </span>
                  {isWinner && <CheckCircle2 size={14} className="text-green-500 ml-2" />}
                </div>
              );
            })}

            {/* Engine / Battery Capacity Row */}
            <div className="p-4 px-6 border-b border-r border-white/10 font-bold text-white/50 uppercase tracking-widest text-xs flex items-center bg-black/40">Engine / Motor</div>
            {compareList.map((v) => {
              const valNum = getEngineNum(v);
              const isWinner = valNum === bestEngine && valNum > 0;
              const displayLabel = v.variants[0]?.engineCC || v.variants[0]?.engine || 'N/A';
              return (
                <div key={`${v.id}-engine`} className={`p-4 px-6 border-b border-r border-white/10 flex items-center justify-center ${isWinner ? 'bg-[var(--accent)]/10' : ''}`}>
                  <span className={`font-semibold ${isWinner ? 'text-[var(--accent)]' : 'text-white/80'}`}>{displayLabel}</span>
                  {isWinner && <CheckCircle2 size={14} className="text-[var(--accent)] ml-2" />}
                </div>
              );
            })}

            {/* Fuel Types Row */}
            <div className="p-4 px-6 border-b border-r border-white/10 font-bold text-white/50 uppercase tracking-widest text-xs flex items-center bg-black/40">Fuel Options</div>
            {compareList.map((v) => (
              <div key={`${v.id}-fuel`} className="p-4 px-6 border-b border-r border-white/10 flex items-center justify-center text-center">
                <span className="text-white/80 font-medium">{v.fuels.join(" / ") || '—'}</span>
              </div>
            ))}

            {/* Transmission Row */}
            <div className="p-4 px-6 border-b border-r border-white/10 font-bold text-white/50 uppercase tracking-widest text-xs flex items-center bg-black/40">Transmission</div>
            {compareList.map((v) => (
              <div key={`${v.id}-trans`} className="p-4 px-6 border-b border-r border-white/10 flex items-center justify-center text-center">
                <span className="text-white/80 font-medium">{v.transmissions.join(" / ") || '—'}</span>
              </div>
            ))}

            {/* Mileage Row */}
            <div className="p-4 px-6 border-b border-r border-white/10 font-bold text-white/50 uppercase tracking-widest text-xs flex items-center bg-black/40">Mileage / Range</div>
            {compareList.map((v) => {
              const numStr = v.variants[0]?.isEV ? v.variants[0]?.range : v.variants[0]?.mileage;
              const valNum = getMileageNum(v);
              const isWinner = valNum === bestMileage && valNum > 0;
              return (
                <div key={`${v.id}-mileage`} className={`p-4 px-6 border-b border-r border-white/10 flex items-center justify-center ${isWinner ? 'bg-blue-500/10' : ''}`}>
                  <span className={`font-semibold ${isWinner ? 'text-blue-400' : 'text-white/80'}`}>{numStr || 'N/A'}</span>
                  {isWinner && <CheckCircle2 size={14} className="text-blue-500 ml-2" />}
                </div>
              );
            })}

            {/* Seating Row */}
            <div className="p-4 px-6 border-b border-r border-white/10 font-bold text-white/50 uppercase tracking-widest text-xs flex items-center bg-black/40">Seating Capacity</div>
            {compareList.map((v) => (
              <div key={`${v.id}-seats`} className="p-4 px-6 border-b border-r border-white/10 flex items-center justify-center text-center">
                <span className="text-white/80 font-medium">{v.seatingCapacities.join(" / ")}</span>
              </div>
            ))}

            {/* NCAP Safety Row */}
            <div className="p-4 px-6 border-r border-white/10 font-bold text-white/50 uppercase tracking-widest text-xs flex items-center bg-black/40">Safety Rating</div>
            {compareList.map((v) => (
              <div key={`${v.id}-safety`} className="p-4 px-6 border-r border-white/10 flex items-center justify-center text-center">
                <span className="text-white/80 font-medium">{v.ncapRating === '—' ? 'Not Tested / NA' : `${v.ncapRating} Stars`}</span>
              </div>
            ))}

          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8 max-w-2xl mx-auto">
           <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 font-headline uppercase font-bold tracking-widest transition-colors rounded">
             Calculate Fuel Cost →
           </button>
           <button className="bg-[var(--accent)] text-black px-8 py-4 font-headline uppercase font-bold tracking-widest transition-all hover:scale-105 active:scale-95 rounded shadow-[0_0_20px_rgba(255,204,0,0.3)]">
             View 5-Year TCO →
           </button>
        </div>

      </main>
      <Footer />
    </div>
  );
}
