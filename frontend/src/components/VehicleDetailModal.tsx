import { useState } from 'react';
import { X } from 'lucide-react';
import type { VehicleGroup, Vehicle } from '@/utils/parseVehicles';

interface VehicleDetailModalProps {
  vehicle: VehicleGroup;
  onClose: () => void;
}

export default function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {

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

            <button className="modal-close p-2 hover:bg-white/10 rounded-full text-white transition-all" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Visual area – Image or 3D */}
            <div className="modal-visual relative w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-black/40 overflow-hidden">
                <img
                  src={vehicle.imageSrc}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="object-cover w-full h-full mix-blend-screen scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
            </div>

            {/* Variants Table */}
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-3">Available Variants ({vehicle.variants.length})</h3>
              <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/20">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
                    <tr>
                      <th className="py-4 px-6 font-medium border-b border-white/10">Variant</th>
                      <th className="py-4 px-6 font-medium border-b border-white/10">Fuel</th>
                      <th className="py-4 px-6 font-medium border-b border-white/10">Transmission</th>
                      <th className="py-4 px-6 font-medium border-b border-white/10">Econ/Range</th>
                      <th className="py-4 px-6 font-medium border-b border-white/10 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-white/80 divide-y divide-white/5">
                    {vehicle.variants.map((v: Vehicle, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 font-medium text-white">{v.variant || "Standard"}</td>
                        <td className="py-4 px-6">
                            <span className="px-2 py-1 rounded bg-white/10 text-xs">{v.fuelType}</span>
                        </td>
                        <td className="py-4 px-6">{v.transmission}</td>
                        <td className="py-4 px-6">{v.isEV ? `${v.range} km` : `${v.mileage} kmpl`}</td>
                        <td className="py-4 px-6 text-right font-semibold text-[var(--accent)]">{v.priceLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
