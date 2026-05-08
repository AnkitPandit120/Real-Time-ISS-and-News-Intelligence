import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert degrees to radians
export function toRad(Value: number) {
  return Value * Math.PI / 180;
}

// Haversine formula to calculate distance in km
export function calculateSpeed(lat1: number, lon1: number, lat2: number, lon2: number, timeDiffSeconds: number): number {
  if (timeDiffSeconds === 0) return 0;
  
  const R = 6371; // Earth's radius in km 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1); 
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // distance in km 
  const speedKmh = (distance / timeDiffSeconds) * 3600;
  return speedKmh;
}
