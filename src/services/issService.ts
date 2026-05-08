import { calculateSpeed } from '@/src/lib/utils';
import { useDashboardStore } from '@/src/store/useDashboardStore';

export const fetchISSPosition = async (lastPos?: { lat: number, lon: number, timestamp: number }) => {
  try {
    const res = await fetch('/api/iss-position');
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data && data.message === 'success') {
      const lat = parseFloat(data.iss_position.latitude);
      const lon = parseFloat(data.iss_position.longitude);
      const timestamp = data.timestamp;

      let speed = 27600; // default approximate speed
      if (lastPos && lastPos.timestamp < timestamp) {
        speed = calculateSpeed(lastPos.lat, lastPos.lon, lat, lon, timestamp - lastPos.timestamp);
      }

      // Try to get location name using free nominatim API via our proxy
      let locationName = 'Over Ocean';
      try {
        const geoRes = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        if (geoRes.ok) {
           const geoData = await geoRes.json();
           if (geoData && geoData.address) {
             locationName = geoData.address.country || geoData.address.ocean || geoData.name || 'Over Ocean';
           }
        }
      } catch (err) {
        // Silent catch for geocode
      }

      return { lat, lon, timestamp, speed, locationName };
    }
  } catch (error) {
    // Silent catch if proxy server is unavailable
  }
  return null;
};

export const fetchAstronauts = async () => {
    try {
        const res = await fetch('/api/astronauts');
        if (!res.ok) return [];
        const data = await res.json();
        if (data.message === 'success') {
            return data.people; // { name, craft }
        }
    } catch (err) {
        // Silent catch
    }
    return [];
}
