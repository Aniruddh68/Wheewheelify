import Papa from 'papaparse';

export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid' | 'Flex Fuel' | string;
export type CarType = 'Hatchback' | 'Sedan' | 'SUV' | 'MPV' | 'Coupe' | 'Pickup' | string;
export type TransmissionType = 'Manual' | 'Automatic' | 'AMT' | 'CVT' | 'DCT' | string;

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant: string;
  price: number;           // in Lakh
  priceLabel: string;      // raw label like "6.9 Lakh"
  launchYear: number;
  carType: CarType;
  engine: string;
  mileage: string;
  range: string;           // for EVs
  transmission: TransmissionType;
  fuelType: FuelType;
  batteryCapacity: string;
  topSpeed: string;
  airbags: number;
  abs: boolean;
  adas: boolean;
  ncapRating: string;
  parkingSensors: string;
  infotainment: string;
  touchscreenSize: string;
  sunroof: boolean;
  acType: string;
  seatMaterial: string;
  connectivity: string;
  imageFile: string;       // e.g. "Tata Tiago.png"
  imageSrc: string;        // resolved public URL
  chargingTimeDC: string;
  chargingTimeAC: string;
  motorPower: string;
  seatingCapacity: number;
  engineCC: string;
  turbo: boolean;
  horsepower: string;
  warranty: string;
  headlight: string;
  power: string;
  torque: string;
  fuelTankCapacity: string;
  isEV: boolean;
}

// Resolve image path – images are in /assets/vehicles/
function resolveImage(rawFilename: string): string {
  if (!rawFilename || rawFilename === '—' || rawFilename.trim() === '') {
    return '/placeholder.svg';
  }
  const name = rawFilename.trim();
  if (name.startsWith('/') || name.startsWith('http')) {
    return name;
  }
  return `/assets/vehicles/${name}`;
}

function toBool(val: string): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return v === 'yes' || v === 'true' || v === '1';
}

function toNum(val: string, fallback = 0): number {
  const n = parseFloat(val?.trim().replace(/[^\d.]/g, ''));
  return isNaN(n) ? fallback : n;
}

function toInt(val: string, fallback = 0): number {
  const n = parseInt(val?.trim(), 10);
  return isNaN(n) ? fallback : n;
}

let cachedVehicles: Vehicle[] | null = null;

export async function fetchVehicles(): Promise<Vehicle[]> {
  if (cachedVehicles) return cachedVehicles;

  return new Promise((resolve, reject) => {
    Papa.parse('/vehicles.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      complete: (results) => {
        const raw = results.data as Record<string, string>[];
        const vehicles: Vehicle[] = raw
          .filter((row) => row['Company'] && row['Model Name'])
          .map((row, idx) => {
            const brand = row['Company']?.trim() || '';
            const model = row['Model Name']?.trim() || '';
            const variant = row['Variant']?.trim() || '';
            const priceRaw = row['Price']?.trim() || '0';
            const price = toNum(priceRaw);
            const priceLabel = row['Ex-showroom price']?.trim() || `${price} Lakh`;
            const fuelType = row['Fuel type']?.trim() || 'Petrol';
            const imageFile = row['Car images']?.trim() || '';

            return {
              id: `${brand}-${model}-${variant}-${idx}`.replace(/\s+/g, '-').toLowerCase(),
              brand,
              model,
              variant,
              price,
              priceLabel,
              launchYear: toInt(row['Launch year']),
              carType: row['Car type']?.trim() || '',
              engine: row['Engine']?.trim() || '',
              mileage: row['Mileage']?.trim() || '—',
              range: row['Range']?.trim() || '—',
              transmission: row['Transmission type']?.trim() || '',
              fuelType,
              batteryCapacity: row['Battery capacity']?.trim() || '—',
              topSpeed: row['Top speed']?.trim() || '—',
              airbags: toInt(row['Airbags count']),
              abs: toBool(row['ABS, EBD']),
              adas: toBool(row['ADAS features']),
              ncapRating: row['NCAP rating']?.trim() || '—',
              parkingSensors: row['Parking sensors/camera']?.trim() || '—',
              infotainment: row['Infotainment system']?.trim() || '—',
              touchscreenSize: row['Touchscreen size']?.trim() || '—',
              sunroof: toBool(row['Sunroof']),
              acType: row['AC type']?.trim() || '—',
              seatMaterial: row['Seat material']?.trim() || '—',
              connectivity: row['Connectivity']?.trim() || '—',
              imageFile,
              imageSrc: resolveImage(imageFile),
              chargingTimeDC: row['Charging Time DC']?.trim() || '—',
              chargingTimeAC: row['Charging Time AC']?.trim() || '—',
              motorPower: row['Electric Motor Power']?.trim() || '—',
              seatingCapacity: toInt(row['Seating capacity'], 5),
              engineCC: row['Engine (cc)']?.trim() || '—',
              turbo: toBool(row['Turbo']),
              horsepower: row['Horsepower (est.)']?.trim() || '—',
              warranty: row['Warranty']?.trim() || '—',
              headlight: row['Headlight']?.trim() || '—',
              power: row['Power']?.trim() || '—',
              torque: row['Torque']?.trim() || '—',
              fuelTankCapacity: row['Fuel Tank Capacity']?.trim() || '—',
              isEV: fuelType.toLowerCase() === 'electric',
            };
          });

        cachedVehicles = vehicles;
        resolve(vehicles);
      },
      error: (err) => reject(err),
    });
  });
}

// Get unique brands/types from all vehicles
export function getFilterOptions(vehicles: Vehicle[]) {
  const brands = [...new Set(vehicles.map((v) => v.brand))].sort();
  const carTypes = [...new Set(vehicles.map((v) => v.carType).filter(Boolean))].sort();
  const fuelTypes = [...new Set(vehicles.map((v) => v.fuelType).filter(Boolean))].sort();
  const transmissions = [...new Set(vehicles.map((v) => v.transmission).filter(Boolean))].sort();
  const prices = vehicles.map((v) => v.price).filter((p) => p > 0);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));
  return { brands, carTypes, fuelTypes, transmissions, minPrice, maxPrice };
}
