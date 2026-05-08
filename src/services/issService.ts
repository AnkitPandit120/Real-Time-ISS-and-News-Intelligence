import { calculateSpeed } from '@/src/lib/utils';
import { useDashboardStore } from '@/src/store/useDashboardStore';

export const fetchISSPosition = async (lastPos?: { lat: number, lon: number, timestamp: number }) => {
  try {
    const res = await fetch('/api/iss-position');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    
    if (data && data.message === 'success') {
      const lat = parseFloat(data.iss_position.latitude);
      const lon = parseFloat(data.iss_position.longitude);
      const timestamp = data.timestamp;

      let speed = 27600; // default approximate speed
      if (lastPos && lastPos.timestamp < timestamp) {
        speed = calculateSpeed(lastPos.lat, lastPos.lon, lat, lon, timestamp - lastPos.timestamp);
      }

      // Try to get location name using free nominatim API
      let locationName = 'Over Ocean';
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=3`, {
            headers: {
                'Accept-Language': 'en'
            }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.address) {
            locationName = geoData.address.country || geoData.address.ocean || geoData.name || 'Over Ocean';
          }
        }
      } catch (err) {
        console.error('Failed to reverse geocode', err);
      }

      return { lat, lon, timestamp, speed, locationName };
    }
  } catch (error) {
    console.error('Failed to fetch ISS position', error);
  }
  return null;
};

export const fetchAstronauts = async () => {
    try {
        const res = await fetch('/api/astronauts');
        const data = await res.json();
        if (data.message === 'success') {
            return data.people; // { name, craft }
        }
    } catch (err) {
        console.error('Failed to fetch astronauts', err);
    }
    return [];
}
