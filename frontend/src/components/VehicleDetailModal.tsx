import { Suspense, lazy, useState } from 'react';
import { X, RotateCcw, Loader2 } from 'lucide-react';
import type { VehicleGroup, Vehicle } from '@/utils/parseVehicles';

const Spline = lazy(() => import('@splinetool/react-spline'));

// A public demo Spline car scene – swap with your own exported .splinecode URL
const DEMO_SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HlWTxhgHv/scene.splinecode';

interface VehicleDetailModalProps {
  vehicle: VehicleGroup;
  onClose: () => void;
}

export default function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const [show3D, setShow3D] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);

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
            {!show3D && (
              <button className="btn-3d px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-medium text-white transition-all" onClick={() => setShow3D(true)}>
                ⟳ View in 3D
              </button>
            )}
            {show3D && (
              <button className="btn-3d-back px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-medium text-white flex items-center gap-2 transition-all" onClick={() => { setShow3D(false); setSplineLoaded(false); }}>
                <RotateCcw size={14} /> Back to Image
              </button>
            )}
            <button className="modal-close p-2 hover:bg-white/10 rounded-full text-white transition-all" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Visual area – Image or 3D */}
            <div className="modal-visual relative w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-black/40 overflow-hidden">
              {!show3D ? (
                <img
                  src={vehicle.imageSrc}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="object-cover w-full h-full mix-blend-screen scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              ) : (
                <div className="spline-wrapper w-full h-full absolute inset-0">
                  {!splineLoaded && (
                    <div className="spline-loading absolute inset-0 flex flex-col items-center justify-center text-white/50">
                      <Loader2 className="animate-spin mb-3" size={32} />
                      <p>Loading 3D scene…</p>
                    </div>
                  )}
                  <Suspense fallback={null}>
                    <Spline
                      scene={DEMO_SPLINE_SCENE}
                      onLoad={() => setSplineLoaded(true)}
                      style={{ opacity: splineLoaded ? 1 : 0, transition: 'opacity 0.6s', width: '100%', height: '100%' }}
                    />
                  </Suspense>
                </div>
              )}
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
