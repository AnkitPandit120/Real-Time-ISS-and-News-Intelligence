import { calculateSpeed } from '@/src/lib/utils';
import { useDashboardStore } from '@/src/store/useDashboardStore';

export const fetchISSPosition = async (lastPos?: { lat: number, lon: number, timestamp: number }) => {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (res.status === 429) {
        console.warn("Wheretheiss rate limited, throttling.");
        return null;
    }
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    
    if (data) {
      const lat = data.latitude;
      const lon = data.longitude;
      const timestamp = data.timestamp;

      let speed = data.velocity; // wheretheiss gives velocity directly in km/h

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
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent('http://api.open-notify.org/astros.json'));
        const data = await res.json();
        if (data.message === 'success') {
            return data.people; // { name, craft }
        }
    } catch (err) {
        console.error('Failed to fetch astronauts', err);
    }
    return [];
}
