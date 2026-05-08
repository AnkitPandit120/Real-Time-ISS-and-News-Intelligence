import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useDashboardStore } from '@/src/store/useDashboardStore';

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Component to recenter map when ISS moves (optional, maybe too jumpy. Let's just center on first load or manual click)
function RecenterAutomatically({lat, lon}: {lat: number, lon: number}) {
  const map = useMap();
  const initialized = useRef(false);
  
  useEffect(() => {
     if (!initialized.current) {
         map.setView([lat, lon], map.getZoom());
         initialized.current = true;
     }
  }, [lat, lon, map]);
  return null;
}

export const IssMap = () => {
  const { currentIss, issPath, theme } = useDashboardStore();

  const mapRef = useRef<L.Map>(null);

  const handleCenter = () => {
      if (currentIss && mapRef.current) {
          mapRef.current.setView([currentIss.lat, currentIss.lon], mapRef.current.getZoom());
      }
  }

  if (!currentIss) {
    return <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-xl">
        <span className="text-slate-500 animate-pulse">Waiting for satellite data...</span>
    </div>;
  }

  // Convert to Leaflet LatLng expression array
  const pathPositions: [number, number][] = issPath.map(pos => [pos.lat, pos.lon]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden bg-black">
      <MapContainer 
        center={[currentIss.lat, currentIss.lon]} 
        zoom={4} 
        className="h-full w-full bg-black"
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />
        
        <Polyline positions={pathPositions} color="#3b82f6" weight={2} dashArray="4, 4" opacity={0.6} />
        
        <Marker position={[currentIss.lat, currentIss.lon]} icon={issIcon}>
          <Popup className="custom-popup">
            <div className="font-bold text-[10px] uppercase mono text-gray-800">ISS Target</div>
            <div className="text-[10px] mono text-gray-600 mt-1">
              LAT: {currentIss.lat.toFixed(4)}&deg;<br />
              LON: {currentIss.lon.toFixed(4)}&deg;
            </div>
          </Popup>
        </Marker>
        <RecenterAutomatically lat={currentIss.lat} lon={currentIss.lon} />
      </MapContainer>

      <button 
        onClick={handleCenter}
        className="absolute bottom-4 left-4 z-[400] bg-white/10 hover:bg-white/20 border border-technical text-white p-2 rounded transition-colors backdrop-blur-sm"
        title="Center on ISS"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4 12H2"/><path d="M22 12h-2"/></svg>
      </button>
    </div>
  );
};
