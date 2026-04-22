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
  vehicleCategory: string; // 'Cars' | 'Bikes' | 'Scooters'
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
  vehicleCategory: string; // the overarching category
}

// Resolve image path – images are in /assets/vehicle_images/{Brand}/
function resolveImage(rawFilename: string, brand: string): string {
  if (!rawFilename || rawFilename === '—' || rawFilename.trim() === '') {
    return '/placeholder.svg';
  }
  const name = rawFilename.trim();
  if (name.startsWith('/') || name.startsWith('http')) {
    return name;
  }
  return `/assets/vehicle_images/${brand}/${name}`;
}

function toBool(val: string): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  if (v === 'yes' || v === 'true' || v === '1') return true;
  if (v.includes('abs') || v.includes('cbs') || v.includes('disc')) return true; // generic match for 2 wheelers
  return false;
}

function toNum(val: string, fallback = 0): number {
  if (!val) return fallback;
  const n = parseFloat(val.toString().trim().replace(/[^\d.]/g, ''));
  return isNaN(n) ? fallback : n;
}

// Normalizes price uniformly to Lakhs
function normalizePriceRaw(rawStr: string): number {
    const rawVal = toNum(rawStr);
    if (rawVal > 1000) return +(rawVal / 100000).toFixed(2);
    return rawVal;
}

function toInt(val: string, fallback = 0): number {
  const n = parseInt(val?.trim(), 10);
  return isNaN(n) ? fallback : n;
}

let cachedVehicles: Vehicle[] | null = null;

function parseCSV(url: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  if (cachedVehicles) return cachedVehicles;

  try {
      const [carsRaw, bikesRaw, scootersRaw] = await Promise.all([
          parseCSV('/final_vehicle_dataset.csv'),
          parseCSV('/bikes_dataset.csv'),
          parseCSV('/scooters_dataset.csv')
      ]);

      const carsList: Vehicle[] = carsRaw.filter(row => row['Company'] && row['Model Name']).map((row, idx) => {
          const brand = row['Company']?.trim() || '';
          const model = row['Model Name']?.trim() || '';
          const variant = row['Variant']?.trim() || '';
          const priceRaw = row['Price']?.trim() || '0';
          const price = toNum(priceRaw);
          const priceLabel = row['Ex-showroom price']?.trim() || `${price} Lakh`;
          const fuelType = row['Fuel type']?.trim() || 'Petrol';
          const imageFile = row['Car images']?.trim() || '';

          return {
            id: `car-${brand}-${model}-${variant}-${idx}`.replace(/\s+/g, '-').toLowerCase(),
            brand, model, variant, price, priceLabel,
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
            imageSrc: resolveImage(imageFile, brand),
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
            vehicleCategory: 'Cars'
          };
      });

      const bikesList: Vehicle[] = bikesRaw.filter(row => row['Brand'] && row['Model']).map((row, idx) => {
          const brand = row['Brand']?.trim() || '';
          const model = row['Model']?.trim() || '';
          const variant = row['Variant']?.trim() || '';
          const rawPriceOutput = row['Price (Ex-Showroom)']?.toString().trim() || '0';
          const price = normalizePriceRaw(rawPriceOutput);
          const priceLabel = `₹${price} Lakh`;
          const fuelType = row['Fuel Type']?.trim() || 'Petrol';
          const imageFile = row['Images']?.trim() || '';

          return {
              id: `bike-${brand}-${model}-${variant}-${idx}`.replace(/\s+/g, '-').toLowerCase(),
              brand, model, variant, price, priceLabel, 
              launchYear: toInt(row['Launch Year']),
              carType: 'Motorcycle',
              engine: row['Engine Capacity (cc)']?.toString().trim() || '',
              mileage: row['Mileage (km/l)']?.toString().trim() || '—',
              range: row['Mileage (km/l)']?.toString().trim() || '—', // Sometimes EV range is here
              transmission: row['Transmission (Gears)']?.toString().trim() || 'Manual',
              fuelType,
              batteryCapacity: '—',
              topSpeed: row['Top Speed (km/h)']?.toString().trim() || '—',
              airbags: 0,
              abs: toBool(row['ABS/CBS Type']),
              adas: false,
              ncapRating: '—',
              parkingSensors: '—',
              infotainment: '—',
              touchscreenSize: row['Console Type']?.toString().trim() || '—',
              sunroof: false,
              acType: '—',
              seatMaterial: '—',
              connectivity: row['Bluetooth']?.toString().trim() || '—',
              imageFile,
              imageSrc: resolveImage(imageFile, brand),
              chargingTimeDC: '—', chargingTimeAC: '—', motorPower: '—',
              seatingCapacity: 2,
              engineCC: row['Engine Capacity (cc)']?.toString().trim() || '—',
              turbo: false,
              horsepower: row['Power (bhp)']?.toString().trim() || '—',
              warranty: '—',
              headlight: '—',
              power: row['Power (bhp)']?.toString().trim() || '—',
              torque: row['Torque (Nm)']?.toString().trim() || '—',
              fuelTankCapacity: row['Fuel Tank (L)']?.toString().trim() || '—',
              isEV: fuelType.toLowerCase().includes('electric'),
              vehicleCategory: 'Bikes'
          };
      });

      const scootersList: Vehicle[] = scootersRaw.filter(row => row['Brand'] && row['Model']).map((row, idx) => {
          const brand = row['Brand']?.trim() || '';
          const model = row['Model']?.trim() || '';
          const variant = row['Variant']?.trim() || '';
          const rawPriceOutput = row['Price ()']?.toString().trim() || '0';
          const price = normalizePriceRaw(rawPriceOutput);
          const priceLabel = `₹${price} Lakh`;
          const fuelType = row['Fuel Type']?.trim() || 'Petrol';
          const imageFile = row['Images']?.toString().trim() || '';

          return {
              id: `scooter-${brand}-${model}-${variant}-${idx}`.replace(/\s+/g, '-').toLowerCase(),
              brand, model, variant, price, priceLabel, 
              launchYear: toInt(row['Launch Year']),
              carType: 'Scooter',
              engine: row['Engine Capacity (cc)']?.toString().trim() || '',
              mileage: row['Mileage (km/l)']?.toString().trim() || '—',
              range: row['Mileage (km/l)']?.toString().trim() || '—', 
              transmission: row['Transmission']?.toString().trim() || 'Automatic',
              fuelType,
              batteryCapacity: '—',
              topSpeed: row['Top Speed (km/h)']?.toString().trim() || '—',
              airbags: 0,
              abs: toBool(row['Braking System']),
              adas: false,
              ncapRating: '—',
              parkingSensors: '—',
              infotainment: '—',
              touchscreenSize: row['Features']?.toString().trim() || '—',
              sunroof: false,
              acType: '—',
              seatMaterial: '—',
              connectivity: '—',
              imageFile,
              imageSrc: resolveImage(imageFile, brand),
              chargingTimeDC: '—', chargingTimeAC: '—', motorPower: '—',
              seatingCapacity: 2,
              engineCC: row['Engine Capacity (cc)']?.toString().trim() || '—',
              turbo: false,
              horsepower: row['Power (bhp)']?.toString().trim() || '—',
              warranty: '—',
              headlight: '—',
              power: row['Power (bhp)']?.toString().trim() || '—',
              torque: row['Torque (Nm)']?.toString().trim() || '—',
              fuelTankCapacity: row['Fuel Tank (L)']?.toString().trim() || '—',
              isEV: fuelType.toLowerCase().includes('electric'),
              vehicleCategory: 'Scooters'
          };
      });

      const masterList = [...carsList, ...bikesList, ...scootersList];
      cachedVehicles = masterList;
      return masterList;

  } catch (error) {
      console.error("Error fetching multi-csv vehicles:", error);
      throw error;
  }
}

// Get unique brands/types from all vehicles
export function getFilterOptions(items: any[]) {
  const isGroup = items.length > 0 && 'variants' in items[0];
  const brands = [...new Set(items.map((v) => v.brand))].sort();
  let carTypes, fuelTypes, transmissions, categories, minPrice, maxPrice;
  if (isGroup) {
      carTypes = [...new Set(items.flatMap((v) => v.carTypes))].sort();
      fuelTypes = [...new Set(items.flatMap((v) => v.fuels))].sort();
      transmissions = [...new Set(items.flatMap((v) => v.transmissions))].sort();
      categories = [...new Set(items.map((v) => v.vehicleCategory))].sort();
      const prices = items.map((v) => v.minPrice).filter((p) => p > 0);
      minPrice = prices.length ? Math.floor(Math.min(...prices)) : 0;
      maxPrice = prices.length ? Math.ceil(Math.max(...items.map(v => v.maxPrice))) : 0;
  } else {
      carTypes = [...new Set(items.map((v) => v.carType).filter(Boolean))].sort();
      fuelTypes = [...new Set(items.map((v) => v.fuelType).filter(Boolean))].sort();
      transmissions = [...new Set(items.map((v) => v.transmission).filter(Boolean))].sort();
      categories = [...new Set(items.map((v) => v.vehicleCategory).filter(Boolean))].sort();
      const prices = items.map((v) => v.price).filter((p) => p > 0);
      minPrice = prices.length ? Math.floor(Math.min(...prices)) : 0;
      maxPrice = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  }
  return { brands, carTypes, fuelTypes, transmissions, categories, minPrice, maxPrice };
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
        vehicleCategory: v.vehicleCategory,
      });
    }

    const g = groups.get(groupId)!;
    g.variants.push(v);
    
    if (v.fuelType) {
      const parts = v.fuelType.split(/[,/]/).map(s => s.trim()).filter(Boolean);
      parts.forEach(p => { if (!g.fuels.includes(p)) g.fuels.push(p); });
    }
    if (v.transmission && v.transmission !== '—') {
      const parts = v.transmission.split(/[,/]/).map(s => s.trim()).filter(Boolean);
      parts.forEach(p => { if (!g.transmissions.includes(p)) g.transmissions.push(p); });
    }
    if (v.carType) {
      const parts = v.carType.split(/[,/]/).map(s => s.trim()).filter(Boolean);
      parts.forEach(p => { if (!g.carTypes.includes(p)) g.carTypes.push(p); });
    }
    
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
      g.priceLabel = `₹${g.minPrice.toFixed(2)} Lakh`;
    } else {
      g.priceLabel = `₹${g.minPrice.toFixed(2)}L - ₹${g.maxPrice.toFixed(2)}L`;
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
