import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, Cog, Route, Battery, Users, ShieldCheck, Wifi, Sofa, Activity, ChevronDown } from 'lucide-react';
import { fetchVehicles, groupVehicles } from '@/utils/parseVehicles';
import type { VehicleGroup } from '@/utils/parseVehicles';

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicleGroup, setVehicleGroup] = useState<VehicleGroup | null>(null);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles().then(data => {
      const groups = groupVehicles(data);
      const found = groups.find(g => g.id === id);
      setVehicleGroup(found || null);
      if (found) {
        // Sort variants by price ascending so the default (0) is base model
        found.variants.sort((a, b) => a.price - b.price);
        setActiveVariantIdx(0);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vehicleGroup) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Vehicle Not Found</h1>
        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded font-medium border border-white/10 transition-colors" onClick={() => navigate('/browse')}>
          Return to Browse
        </button>
      </div>
    );
  }

  const activeVariant = vehicleGroup.variants[activeVariantIdx];

  // Generate generic description based on the overall group
  const description = `The ${vehicleGroup.brand} ${vehicleGroup.model} is a standout ${vehicleGroup.carTypes.join('/') || 'vehicle'} in its class, offering remarkable performance and supreme comfort. It comes equipped with a versatile range of ${vehicleGroup.variants.length} variant${vehicleGroup.variants.length > 1 ? 's' : ''}, supporting ${vehicleGroup.fuels.join(', ')} fuel options.`;

  return (
    <div className="min-h-screen bg-[#070707] text-white overflow-x-hidden selection:bg-[var(--accent)] selection:text-black">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 h-16 bg-black/80 backdrop-blur-md border-b border-white/5 flex items-center px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
        {/* Left: Image Canvas */}
        <div className="w-full lg:w-3/5 flex justify-center relative">
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--accent)] rounded-full mix-blend-screen filter blur-[140px] opacity-20 transition-opacity duration-500"></div>
          <img 
            src={vehicleGroup.imageSrc} 
            alt={`${vehicleGroup.brand} ${vehicleGroup.model}`} 
            className="w-full h-auto max-h-[500px] object-contain object-center z-20 relative transform hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </div>

        {/* Right: Intro & Configurator Details */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6 relative z-20">
          <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-[var(--accent)] w-max tracking-widest uppercase">
            {vehicleGroup.brand}
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {vehicleGroup.model}
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-light">
            {description}
          </p>
          
          {/* Variant Selector */}
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center justify-between">
              <span>Select Variant</span>
              <span className="text-white/20">({vehicleGroup.variants.length} Available)</span>
            </label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm border border-white/20 rounded-2xl py-4 pl-4 pr-10 text-white font-semibold focus:outline-none focus:border-[var(--accent)] hover:border-white/30 transition-colors cursor-pointer text-lg"
                value={activeVariantIdx}
                onChange={(e) => setActiveVariantIdx(Number(e.target.value))}
              >
                {vehicleGroup.variants.map((v, i) => (
                  <option key={i} value={i} className="bg-[#111] text-white py-2">
                    {v.variant || 'Standard'} • {v.fuelType} • {v.priceLabel}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--accent)]">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/30 rounded-3xl flex flex-col gap-1 backdrop-blur-sm shadow-xl transition-all duration-300">
            <span className="text-xs text-[var(--accent)] uppercase tracking-widest font-bold">Ex-Showroom Price</span>
            <span className="text-4xl font-extrabold tracking-tight text-white">{activeVariant.priceLabel}</span>
          </div>
        </div>
      </section>

      {/* Core Specs Grid */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/5">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Activity className="text-[var(--accent)]" /> Specs for <span className="font-light tracking-wide text-white/60 ml-2">"{activeVariant.variant}"</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SpecCard 
            icon={<Fuel />} 
            label="Fuel Type" 
            value={activeVariant.fuelType || 'N/A'} 
          />
          <SpecCard 
            icon={<Cog />} 
            label="Transmission" 
            value={activeVariant.transmission || 'N/A'} 
          />
          <SpecCard 
            icon={activeVariant.isEV ? <Battery /> : <Route />} 
            label={activeVariant.isEV ? 'Certified Range' : (vehicleGroup.vehicleCategory === 'Cars' ? 'ARAI Mileage' : 'Mileage')} 
            value={activeVariant.isEV ? `${activeVariant.range} km` : `${activeVariant.mileage} ${vehicleGroup.vehicleCategory === 'Cars' ? 'kmpl' : 'km/l'}`} 
          />
          <SpecCard 
            icon={<Users />} 
            label={vehicleGroup.vehicleCategory === 'Cars' ? 'Seating' : 'Capacity'} 
            value={vehicleGroup.vehicleCategory === 'Cars' ? `${activeVariant.seatingCapacity} Seats` : '2 Seats'} 
          />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicleGroup.vehicleCategory === 'Cars' && (
            <>
              <FeatureHighlight 
                icon={<ShieldCheck size={48} />} 
                title="Safety Framework" 
                items={[
                  { label: 'NCAP Rating', value: activeVariant.ncapRating !== '—' ? activeVariant.ncapRating : vehicleGroup.ncapRating },
                  { label: 'Airbags', value: `${activeVariant.airbags} Standard` },
                  { label: 'ADAS Suite', value: activeVariant.adas ? 'Available' : 'None' },
                  { label: 'ABS & EBD', value: activeVariant.abs ? 'Standard' : 'None' },
                ]}
              />
              <FeatureHighlight 
                icon={<Sofa size={48} />} 
                title="Comfort & Build" 
                items={[
                   { label: 'Sunroof', value: activeVariant.sunroof ? 'Yes' : 'No' },
                   { label: 'Climate Control', value: activeVariant.acType !== '—' ? activeVariant.acType : 'Manual' },
                   { label: 'Seat Material', value: activeVariant.seatMaterial !== '—' ? activeVariant.seatMaterial : 'Fabric' },
                   { label: 'Body Style', value: activeVariant.carType || 'N/A' },
                ]}
              />
              <FeatureHighlight 
                icon={<Wifi size={48} />} 
                title="Tech & Powertrain" 
                items={[
                   { label: 'Engine/Motor', value: activeVariant.isEV ? (activeVariant.batteryCapacity !== '—' ? activeVariant.batteryCapacity : activeVariant.motorPower) : activeVariant.engineCC },
                   { label: 'Infotainment', value: activeVariant.touchscreenSize !== '—' ? activeVariant.touchscreenSize : 'Standard Audio' },
                   { label: 'Connectivity', value: activeVariant.connectivity !== '—' ? activeVariant.connectivity : 'Bluetooth' },
                   { label: 'Parking Sensors', value: activeVariant.parkingSensors !== '—' ? activeVariant.parkingSensors : 'Standard' },
                ]}
              />
            </>
          )}

          {vehicleGroup.vehicleCategory === 'Bikes' && (
            <>
              <FeatureHighlight 
                icon={<ShieldCheck size={48} />} 
                title="Safety & Tech" 
                items={[
                  { label: 'ABS / CBS', value: activeVariant.abs ? 'Standard' : 'None' },
                  { label: 'Console Type', value: activeVariant.touchscreenSize },
                  { label: 'Connectivity', value: activeVariant.connectivity },
                  { label: 'Headlight', value: activeVariant.headlight !== '—' ? activeVariant.headlight : 'Standard' },
                ]}
              />
              <FeatureHighlight 
                icon={<Activity size={48} />} 
                title="Performance" 
                items={[
                  { label: 'Power', value: activeVariant.power !== '—' ? activeVariant.power : activeVariant.horsepower },
                  { label: 'Torque', value: activeVariant.torque },
                  { label: 'Fuel Tank', value: activeVariant.fuelTankCapacity !== '—' ? `${activeVariant.fuelTankCapacity} L` : '—' },
                  { label: 'Displacement', value: activeVariant.engineCC !== '—' ? `${activeVariant.engineCC}` : '—' },
                ]}
              />
              <FeatureHighlight 
                icon={<Cog size={48} />} 
                title="Drivetrain & Build" 
                items={[
                  { label: 'Gears', value: activeVariant.transmission },
                  { label: 'Body Style', value: activeVariant.carType },
                  { label: 'Seating', value: '2 Seats' },
                  { label: 'Warranty', value: activeVariant.warranty !== '—' ? activeVariant.warranty : 'Standard' },
                ]}
              />
            </>
          )}

          {vehicleGroup.vehicleCategory === 'Scooters' && (
            <>
              <FeatureHighlight 
                icon={<ShieldCheck size={48} />} 
                title="Safety & Utility" 
                items={[
                  { label: 'Braking System', value: activeVariant.abs ? 'Combined / ABS' : 'Standard' },
                  { label: 'Features', value: activeVariant.touchscreenSize },
                  { label: 'Connectivity', value: activeVariant.connectivity },
                  { label: 'Headlight', value: activeVariant.headlight !== '—' ? activeVariant.headlight : 'Standard' },
                ]}
              />
              <FeatureHighlight 
                icon={<Activity size={48} />} 
                title="Engine & Drive" 
                items={[
                  { label: 'Power', value: activeVariant.power !== '—' ? activeVariant.power : activeVariant.horsepower },
                  { label: 'Torque', value: activeVariant.torque },
                  { label: 'Fuel Tank', value: activeVariant.fuelTankCapacity !== '—' ? `${activeVariant.fuelTankCapacity} L` : '—' },
                  { label: 'Displacement', value: activeVariant.engineCC !== '—' ? `${activeVariant.engineCC}` : '—' },
                ]}
              />
              <FeatureHighlight 
                icon={<Cog size={48} />} 
                title="Build Profile" 
                items={[
                  { label: 'Transmission', value: activeVariant.transmission },
                  { label: 'Category', value: activeVariant.carType },
                  { label: 'Seating', value: '2 Seats' },
                  { label: 'Warranty', value: activeVariant.warranty !== '—' ? activeVariant.warranty : 'Standard' },
                ]}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SpecCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  // Fix weird blank or "— kmpl" cases 
  const displayValue = value === '— km' || value === '— kmpl' || value === '—' ? 'N/A' : value;

  return (
    <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 flex items-start gap-4 hover:bg-white/10 transition-colors cursor-default">
      <div className="p-3 bg-white/5 text-[var(--accent)] rounded-2xl shrink-0 border border-white/5">
        {icon}
      </div>
      <div>
        <h4 className="text-white/40 text-xs tracking-widest uppercase font-semibold mb-1">{label}</h4>
        <p className="text-white font-medium text-lg leading-tight">{displayValue}</p>
      </div>
    </div>
  );
}

function FeatureHighlight({ icon, title, items }: { icon: React.ReactNode, title: string, items: { label: string, value: string }[] }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:border-white/20 transition-all">
      <div className="absolute -top-4 -right-4 text-white/5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-8 text-white">{title}</h3>
      <ul className="space-y-5">
        {items.map((item, i) => {
          const displayValue = item.value === '—' || item.value === '' ? 'Standard' : item.value;
          return (
            <li key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 relative z-10">
              <span className="text-white/40 text-sm tracking-wide">{item.label}</span>
              <span className="text-white text-sm font-medium text-right max-w-[55%] truncate" title={displayValue}>{displayValue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
