import { useState } from 'react';
import { X, Box, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { VehicleGroup, Vehicle } from '@/utils/parseVehicles';

interface VehicleDetailModalProps {
  vehicle: VehicleGroup;
  onClose: () => void;
}

function SpecCard({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === '' || value === '—' || value === 0 || value === '0') return null;
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-center items-start">
      <span className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{label}</span>
      <span className="text-white font-bold text-sm md:text-base leading-snug">{value}</span>
    </div>
  );
}

export default function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const navigate = useNavigate();
  // Use the first variant as the representative for detailed specs
  const rep = vehicle.variants[0];

  const engineOrMotor = rep.isEV 
    ? (rep.motorPower !== '—' && rep.motorPower ? rep.motorPower : 'Electric Motor')
    : rep.engine;

  const mileageOrRange = rep.isEV
    ? (rep.range !== '—' && rep.range ? `${rep.range} km/charge` : null)
    : (rep.mileage !== '—' && rep.mileage ? `${rep.mileage} kmpl` : null);

  const powerTorque = [rep.power !== '—' ? rep.power : null, rep.torque !== '—' ? rep.torque : null]
    .filter(Boolean)
    .join(' / ');

  const capacity = rep.isEV 
    ? (rep.batteryCapacity !== '—' ? rep.batteryCapacity : null)
    : (rep.fuelTankCapacity !== '—' ? rep.fuelTankCapacity : null);

  const safetyFeatures = [
    rep.abs ? 'ABS' : null,
    rep.airbags ? `${rep.airbags} Airbags` : null,
    rep.adas ? 'ADAS' : null
  ].filter(Boolean).join(' • ');

  const handleExplore = () => {
    onClose();
    navigate(`/vehicle/${vehicle.id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header shrink-0 flex justify-between items-start">
          <div>
            <p className="modal-brand uppercase font-bold text-xs tracking-wider text-[var(--accent)]">{vehicle.brand}</p>
            <h2 className="modal-title text-3xl font-bold mt-1 text-white">
              {vehicle.model}
            </h2>
            <p className="modal-price mt-2 text-md text-white/70">{vehicle.priceLabel}</p>
          </div>
          <div className="modal-actions flex items-center gap-3">
            <button 
              onClick={handleExplore}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Explore <ArrowRight size={16} />
            </button>
            <button className="modal-close p-2 hover:bg-white/10 rounded-full text-white transition-all" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            {/* Visual area – Image or 3D */}
            <div className="modal-visual relative w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-black/40 overflow-hidden">
                <img
                  src={vehicle.imageSrc}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="object-contain w-full h-full drop-shadow-2xl mix-blend-screen scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
            </div>

            {/* Specs Grid */}
            <div className="px-6 md:px-10 mt-6 max-w-5xl mx-auto space-y-10">
              
              {/* PERFORMANCE */}
              <section>
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <SpecCard label={rep.isEV ? "Motor" : "Engine"} value={engineOrMotor} />
                  <SpecCard label={rep.isEV ? "Range" : "Mileage"} value={mileageOrRange} />
                  <SpecCard label="Top Speed" value={rep.topSpeed !== '—' ? `${rep.topSpeed} km/h` : null} />
                  <SpecCard label="Power / Torque" value={powerTorque} />
                </div>
              </section>

              {/* SPECIFICATIONS */}
              <section>
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <SpecCard label="Transmission" value={rep.transmission} />
                  <SpecCard label={rep.isEV ? "Battery Capacity" : "Fuel Tank"} value={capacity} />
                  <SpecCard label="Drivetrain" value={rep.carType} />
                  <SpecCard label="Seating" value={rep.seatingCapacity ? `${rep.seatingCapacity} Persons` : null} />
                </div>
              </section>

              {/* OVERVIEW & FEATURES */}
              <section>
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Overview & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <SpecCard label="Variants Available" value={`${vehicle.variants.length} Variants`} />
                  <SpecCard label="Safety / Brakes" value={safetyFeatures} />
                  <SpecCard label="NCAP Rating" value={vehicle.ncapRating} />
                  <SpecCard label="Infotainment" value={rep.touchscreenSize !== '—' ? rep.touchscreenSize : rep.infotainment} />
                </div>
              </section>
              
            </div>
        </div>
      </div>
    </div>
  );
}
