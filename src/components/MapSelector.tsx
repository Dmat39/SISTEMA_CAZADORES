import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom hook to handle map events and fixes
const useMapFix = (mapRef) => {
  useEffect(() => {
    const fixMap = () => {
      if (mapRef.current) {
        const map = mapRef.current;
        // Force map to recalculate its size
        setTimeout(() => {
          map.invalidateSize(true);
          // Force tiles to reload
          map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
              layer.redraw();
            }
          });
        }, 200);
      }
    };

    // Fix map on mount and when window resizes
    fixMap();
    window.addEventListener('resize', fixMap);

    return () => {
      window.removeEventListener('resize', fixMap);
    };
  }, [mapRef]);
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const MapSelector = ({
  latitude,
  longitude,
  onLocationSelect,
  height = '300px',
  isDark = false
}) => {
  const [position, setPosition] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef();

  // Default center (Lima, Peru)
  const defaultCenter = [-12.0464, -77.0428];
  const center = (latitude && longitude) ? [latitude, longitude] : defaultCenter;

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Use the custom map fix hook
  useMapFix(mapRef);

  const handleLocationSelect = (lat, lng) => {
    // Asegurar que las coordenadas sean números válidos
    const validLat = parseFloat(lat.toFixed(6));
    const validLng = parseFloat(lng.toFixed(6));

    const newPosition = [validLat, validLng];
    setPosition(newPosition);
    onLocationSelect(validLat, validLng);
  };

  return (
    <div className={`w-full rounded-lg overflow-hidden border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={13}
        style={{ height, width: '100%' }}
        ref={mapRef}
        whenReady={() => {
          // Force invalidate size when map is ready
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          tileSize={256}
          zoomOffset={0}
        />

        <MapClickHandler onLocationSelect={handleLocationSelect} />

        {position && (
          <Marker position={position} />
        )}
      </MapContainer>

      {position && (
        <div className={`p-2 text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
          📍 Coordenadas seleccionadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapSelector;