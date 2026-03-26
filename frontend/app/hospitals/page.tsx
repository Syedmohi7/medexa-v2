'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Loader, 
  Plus, 
  PhoneCall, 
  Compass 
} from 'lucide-react';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        fetchNearbyHospitals(location.lat, location.lng);
      },
      () => {
        setError('Unable to get your location. Showing central Hyderabad area.');
        setLoading(false);

        const defaultLocation = { lat: 17.385044, lng: 78.486671 };
        setUserLocation(defaultLocation);
        fetchNearbyHospitals(defaultLocation.lat, defaultLocation.lng);
      }
    );
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const radius = 5000;
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          way["amenity"="clinic"](around:${radius},${lat},${lng});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      const data = await response.json();

      const hospitalsList = data.elements
        .map((element: any) => {
          const elementLat = element.lat || (element.center && element.center.lat);
          const elementLon = element.lon || (element.center && element.center.lon);
          const distance = calculateDistance(lat, lng, elementLat, elementLon);

          return {
            name: element.tags?.name || 'Medical Facility',
            address: formatAddress(element.tags),
            phone:
              element.tags?.phone ||
              element.tags?.['contact:phone'] ||
              'Contact not found',
            distance: distance.toFixed(1),
            type: element.tags?.amenity === 'hospital' ? 'Hospital' : 'Clinic',
            emergency: element.tags?.emergency === 'yes',
            hours: element.tags?.opening_hours || '24/7 Service',
            lat: elementLat,
            lon: elementLon,
          };
        })
        .sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));

      setHospitals(hospitalsList.slice(0, 12));
    } catch {
      setError('Failed to load live data. Displaying saved facilities.');
      loadSampleHospitals();
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (tags: any) => {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    return parts.length ? parts.join(', ') : 'Location details in maps';
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const loadSampleHospitals = () => {
    setHospitals([
      {
        name: 'Apollo Hospital',
        address: 'Jubilee Hills, Hyderabad',
        phone: '+91 40 2360 7777',
        distance: '2.5',
        type: 'Hospital',
        emergency: true,
        hours: '24/7',
        lat: 17.4326,
        lon: 78.4071,
      },
    ]);
  };

  const openInMaps = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]">
        <Sidebar />

        <div className="flex-1 md:ml-64 px-4 md:px-8 pt-24 md:pt-10 pb-10 overflow-y-auto h-screen">
          
          {/* GLASS HEADER */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2.5rem] p-8 mb-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <Plus className="h-7 w-7 text-[#2563eb]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                  Nearby Care
                </h1>
                <p className="text-white/90 font-bold mt-2 text-sm md:text-base">
                  Emergency & General Medical Centers 🏥
                </p>
              </div>
            </div>
            <button 
                onClick={getUserLocation} 
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-sm hover:bg-blue-50 active:scale-95 transition-all shadow-xl"
            >
              <Navigation className="h-5 w-5 fill-current" />
              REFRESH LOCATION
            </button>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <p className="text-white font-bold">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader className="h-12 w-12 animate-spin text-white" />
              <p className="text-white font-black uppercase text-xs tracking-widest">Scanning nearby area...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {hospitals.map((hospital, index) => (
                <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white/20 hover:-translate-y-2 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-blue-600 transition-colors">
                      <Plus className="text-blue-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Distance</p>
                        <p className="text-xl font-black text-[#2563eb]">{hospital.distance} KM</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight uppercase">
                    {hospital.name}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-600 leading-snug">{hospital.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneCall className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-600">{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-600">{hospital.hours}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                        href={`tel:${hospital.phone}`} 
                        className="flex-1 bg-[#2563eb] text-white py-4 rounded-2xl font-black text-center shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      CALL NOW 📞
                    </a>
                    <button
                      onClick={() => openInMaps(hospital.lat, hospital.lon)}
                      className="flex-1 bg-slate-50 text-slate-900 py-4 rounded-2xl font-black shadow-inner hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Compass size={18} /> MAPS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}