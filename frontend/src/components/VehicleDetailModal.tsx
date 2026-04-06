import { Suspense, lazy, useState } from 'react';
import { X, RotateCcw, Loader2 } from 'lucide-react';
import type { Vehicle } from '@/utils/parseVehicles';

const Spline = lazy(() => import('@splinetool/react-spline'));

// A public demo Spline car scene – swap with your own exported .splinecode URL
const DEMO_SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HlWTxhgHv/scene.splinecode';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const [show3D, setShow3D] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const badge = (label: string, val: string | number | boolean | undefined | null) => {
    if (val === undefined || val === null || val === '—' || val === '' || val === false || val === 0) return null;
    return (
      <div className="vehicle-badge">
        <span className="badge-label">{label}</span>
        <span className="badge-val">{typeof val === 'boolean' ? 'Yes' : val}</span>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-brand">{vehicle.brand}</p>
            <h2 className="modal-title">
              {vehicle.model} <span className="modal-variant">{vehicle.variant}</span>
            </h2>
            <p className="modal-price">{vehicle.priceLabel}</p>
          </div>
          <div className="modal-actions">
            {!show3D && (
              <button className="btn-3d" onClick={() => setShow3D(true)}>
                ⟳ View in 3D
              </button>
            )}
            {show3D && (
              <button className="btn-3d-back" onClick={() => { setShow3D(false); setSplineLoaded(false); }}>
                <RotateCcw size={14} /> Back to Image
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Visual area – Image or 3D */}
        <div className="modal-visual">
          {!show3D ? (
            <img
              src={vehicle.imageSrc}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="modal-img"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
          ) : (
            <div className="spline-wrapper">
              {!splineLoaded && (
                <div className="spline-loading">
                  <Loader2 className="spin-icon" size={32} />
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
          <div className="modal-fuel-badge" data-fuel={vehicle.fuelType.toLowerCase()}>
            {vehicle.fuelType}
          </div>
        </div>

        {/* Specs grid */}
        <div className="modal-specs">
          <div className="specs-group">
            <h3 className="specs-group-title">Performance</h3>
            <div className="badges-row">
              {badge('Engine', vehicle.engine)}
              {badge('HP', vehicle.horsepower)}
              {badge('Torque', vehicle.torque)}
              {badge('Top Speed', `${vehicle.topSpeed} km/h`)}
              {vehicle.isEV && badge('Range', `${vehicle.range} km`)}
              {!vehicle.isEV && badge('Mileage', `${vehicle.mileage} kmpl`)}
              {badge('Turbo', vehicle.turbo)}
            </div>
          </div>
          <div className="specs-group">
            <h3 className="specs-group-title">Features</h3>
            <div className="badges-row">
              {badge('Transmission', vehicle.transmission)}
              {badge('Seats', vehicle.seatingCapacity)}
              {badge('NCAP', vehicle.ncapRating)}
              {badge('Airbags', vehicle.airbags)}
              {badge('ABS', vehicle.abs)}
              {badge('ADAS', vehicle.adas)}
              {badge('Sunroof', vehicle.sunroof)}
              {badge('Connectivity', vehicle.connectivity)}
            </div>
          </div>
          {vehicle.isEV && (
            <div className="specs-group">
              <h3 className="specs-group-title">EV Specs</h3>
              <div className="badges-row">
                {badge('Battery', vehicle.batteryCapacity)}
                {badge('DC Charge', vehicle.chargingTimeDC)}
                {badge('AC Charge', vehicle.chargingTimeAC)}
                {badge('Motor', vehicle.motorPower)}
              </div>
            </div>
          )}
          <div className="specs-group">
            <h3 className="specs-group-title">Comfort</h3>
            <div className="badges-row">
              {badge('AC', vehicle.acType)}
              {badge('Seats', vehicle.seatMaterial)}
              {badge('Infotainment', vehicle.infotainment)}
              {badge('Screen', vehicle.touchscreenSize ? `${vehicle.touchscreenSize}"` : '')}
              {badge('Parking', vehicle.parkingSensors)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
