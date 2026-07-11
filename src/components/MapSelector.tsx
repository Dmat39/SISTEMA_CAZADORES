import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Centro y límites de San Juan de Lurigancho (a partir del bounding box de las jurisdicciones)
const SJL_CENTER = [-11.9771, -76.9905];
const JURISDICTIONS_GEOJSON_URL = '/geojson/juridicciones-sjl.geojson';

// Ray-casting sobre un anillo [ [lng,lat], ... ]
const pointInRing = (lat, lng, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lngI, latI] = ring[i];
    const [lngJ, latJ] = ring[j];
    const intersects = ((latI > lat) !== (latJ > lat)) &&
      (lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI);
    if (intersects) inside = !inside;
  }
  return inside;
};

// rings[0] es el contorno exterior, el resto son huecos
const pointInPolygonRings = (lat, lng, rings) => {
  if (!pointInRing(lat, lng, rings[0])) return false;
  for (let h = 1; h < rings.length; h++) {
    if (pointInRing(lat, lng, rings[h])) return false;
  }
  return true;
};

const findJurisdictionAt = (lat, lng, geojson) => {
  if (!geojson?.features) return null;
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    if (geom.type === 'Polygon' && pointInPolygonRings(lat, lng, geom.coordinates)) {
      return feature.properties;
    }
    if (geom.type === 'MultiPolygon') {
      const hit = geom.coordinates.some((polygon) => pointInPolygonRings(lat, lng, polygon));
      if (hit) return feature.properties;
    }
  }
  return null;
};

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
  const [jurisdictions, setJurisdictions] = useState(null);
  const mapRef = useRef();

  // Centrado por defecto en San Juan de Lurigancho
  const center = (latitude && longitude) ? [latitude, longitude] : SJL_CENTER;

  useEffect(() => {
    fetch(JURISDICTIONS_GEOJSON_URL)
      .then((res) => res.json())
      .then(setJurisdictions)
      .catch(() => {/* mapa sigue funcionando sin las jurisdicciones */});
  }, []);

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

    const jurisdiction = findJurisdictionAt(validLat, validLng, jurisdictions);
    onLocationSelect(validLat, validLng, jurisdiction?.name ?? null);
  };

  return (
    <div className={`w-full rounded-lg overflow-hidden border ${isDark ? 'border-gray-600' : 'border-[#e8dfc8]'}`}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={13}
        className="outline-none"
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

        {jurisdictions && (
          <GeoJSON
            data={jurisdictions}
            style={(feature) => ({
              color: feature.properties?.color || '#f97316',
              weight: 1.5,
              fillColor: feature.properties?.color || '#f97316',
              fillOpacity: 0.15,
            })}
            onEachFeature={(feature, layer) => {
              if (feature.properties?.name) {
                layer.bindTooltip(feature.properties.name, { sticky: true });
              }
            }}
          />
        )}

        <MapClickHandler onLocationSelect={handleLocationSelect} />

        {position && (
          <Marker position={position} />
        )}
      </MapContainer>

      {position && (
        <div className={`p-2 text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-[#fdfbf5] text-[#7a6a52]'}`}>
          📍 Coordenadas seleccionadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapSelector;