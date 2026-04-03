import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer } from 'lucide-react';

const forecast = [
  { day: 'Mon', icon: Sun, temp: 28, cond: 'Sunny' },
  { day: 'Tue', icon: Cloud, temp: 24, cond: 'Cloudy' },
  { day: 'Wed', icon: CloudRain, temp: 19, cond: 'Rainy' },
  { day: 'Thu', icon: Sun, temp: 27, cond: 'Clear' },
  { day: 'Fri', icon: Cloud, temp: 22, cond: 'Overcast' },
  { day: 'Sat', icon: CloudSnow, temp: 5, cond: 'Snow' },
  { day: 'Sun', icon: Sun, temp: 30, cond: 'Sunny' },
];

const Weather: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center gap-4">
      <Sun className="w-14 h-14 text-yellow-400" />
      <div>
        <p className="text-3xl font-light">28°C</p>
        <p className="text-sm opacity-60">Sunny • New York</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
        <Wind className="w-4 h-4 opacity-60" /><div><p className="text-[10px] opacity-40">Wind</p><p className="text-xs">12 km/h</p></div>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
        <Droplets className="w-4 h-4 opacity-60" /><div><p className="text-[10px] opacity-40">Humidity</p><p className="text-xs">45%</p></div>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
        <Thermometer className="w-4 h-4 opacity-60" /><div><p className="text-[10px] opacity-40">Feels like</p><p className="text-xs">30°C</p></div>
      </div>
    </div>
    <div>
      <h3 className="text-xs font-semibold mb-2">7-Day Forecast</h3>
      <div className="space-y-1">
        {forecast.map(f => (
          <div key={f.day} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/5 text-xs">
            <span className="w-8 font-medium">{f.day}</span>
            <f.icon className="w-4 h-4 opacity-70" />
            <span className="flex-1 opacity-60">{f.cond}</span>
            <span className="font-medium">{f.temp}°</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Weather;
