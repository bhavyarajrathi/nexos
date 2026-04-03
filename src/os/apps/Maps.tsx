import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const Maps: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
      <MapPin className="w-4 h-4 opacity-60" />
      <input placeholder="Search location..." className="flex-1 bg-transparent text-xs outline-none" />
      <Navigation className="w-4 h-4 opacity-60" />
    </div>
    <div className="flex-1 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a1a2a 0%, #1a2a3a 50%, #0a1a2a 100%)' }}>
      <div className="text-center space-y-2">
        <MapPin className="w-12 h-12 mx-auto opacity-20" />
        <p className="text-xs opacity-30">Map view</p>
        <p className="text-[10px] opacity-20">Connect to Maps API for live maps</p>
      </div>
    </div>
  </div>
);

export default Maps;
