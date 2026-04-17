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

export interface VehicleGroup {
  id: string;              // unique group id
  brand: string;
  model: string;           // Base Model Name
  variants: Vehicle[];     // all variants belonging to this base model
  fuels: string[];         // unique fuels across variants
  transmissions: string[]; // unique transmissions across variants
  carTypes: string[];      // unique car types
  minPrice: number;
  maxPrice: number;
  priceLabel: string;      // generated e.g., "5.5 Lakh - 8.0 Lakh" or "5.5 Lakh"
  ncapRating: string;      // assume highest severity/best rating or just first variant's
  imageSrc: string;        // representative image (first valid one)
  isEV: boolean;           // true if there's any EV variant
  seatingCapacities: number[];
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
    Papa.parse('/Vehical Dataset updated final.csv', {
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
export function getFilterOptions(items: any[]) {
  const isGroup = items.length > 0 && 'variants' in items[0];
  const brands = [...new Set(items.map((v) => v.brand))].sort();
  let carTypes, fuelTypes, transmissions, minPrice, maxPrice;
  if (isGroup) {
      carTypes = [...new Set(items.flatMap((v) => v.carTypes))].sort();
      fuelTypes = [...new Set(items.flatMap((v) => v.fuels))].sort();
      transmissions = [...new Set(items.flatMap((v) => v.transmissions))].sort();
      const prices = items.map((v) => v.minPrice).filter((p) => p > 0);
      minPrice = prices.length ? Math.floor(Math.min(...prices)) : 0;
      maxPrice = prices.length ? Math.ceil(Math.max(...items.map(v => v.maxPrice))) : 0;
  } else {
      carTypes = [...new Set(items.map((v) => v.carType).filter(Boolean))].sort();
      fuelTypes = [...new Set(items.map((v) => v.fuelType).filter(Boolean))].sort();
      transmissions = [...new Set(items.map((v) => v.transmission).filter(Boolean))].sort();
      const prices = items.map((v) => v.price).filter((p) => p > 0);
      minPrice = prices.length ? Math.floor(Math.min(...prices)) : 0;
      maxPrice = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  }
  return { brands, carTypes, fuelTypes, transmissions, minPrice, maxPrice };
}

export function groupVehicles(vehicles: Vehicle[]): VehicleGroup[] {
  const groups = new Map<string, VehicleGroup>();

  vehicles.forEach((v) => {
    // Generate a unique ID for the group (Brand + Base Model)
    const groupId = `${v.brand}-${v.model}`.toLowerCase().replace(/\s+/g, '-');
    
    if (!groups.has(groupId)) {
      groups.set(groupId, {
        id: groupId,
        brand: v.brand,
        model: v.model,
        variants: [],
        fuels: [],
        transmissions: [],
        carTypes: [],
        minPrice: Infinity,
        maxPrice: -Infinity,
        priceLabel: '',
        ncapRating: v.ncapRating !== '—' ? v.ncapRating : '',
        imageSrc: '', // We'll find a valid one
        isEV: false,
        seatingCapacities: [],
      });
    }

    const g = groups.get(groupId)!;
    g.variants.push(v);
    
    if (v.fuelType && !g.fuels.includes(v.fuelType)) g.fuels.push(v.fuelType);
    if (v.transmission && v.transmission !== '—' && !g.transmissions.includes(v.transmission)) g.transmissions.push(v.transmission);
    if (v.carType && !g.carTypes.includes(v.carType)) g.carTypes.push(v.carType);
    if (v.price > 0 && v.price < g.minPrice) g.minPrice = v.price;
    if (v.price > 0 && v.price > g.maxPrice) g.maxPrice = v.price;
    
    if (v.ncapRating !== '—' && !g.ncapRating) g.ncapRating = v.ncapRating;
    if (v.isEV) g.isEV = true;
    if (!g.seatingCapacities.includes(v.seatingCapacity)) g.seatingCapacities.push(v.seatingCapacity);
    
    // Pick the first valid image we encounter (fall back placeholder)
    if (!g.imageSrc && !v.imageSrc.includes('placeholder')) {
      g.imageSrc = v.imageSrc;
    }
  });

  return Array.from(groups.values()).map((g) => {
    // Post-process the group
    if (g.minPrice === Infinity) {
      g.minPrice = 0;
      g.maxPrice = 0;
      g.priceLabel = 'TBA';
    } else if (g.minPrice === g.maxPrice) {
      g.priceLabel = `₹${g.minPrice} Lakh`;
    } else {
      g.priceLabel = `₹${g.minPrice}L - ₹${g.maxPrice}L`;
    }
    
    if (!g.imageSrc) {
      g.imageSrc = '/placeholder.svg';
    }
    
    if (!g.ncapRating) {
      g.ncapRating = '—';
    }
    
    return g;
  });
}
