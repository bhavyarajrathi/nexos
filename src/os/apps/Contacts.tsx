import React, { useState } from 'react';
import { User, AtSign, Phone, MapPin, Plus, Search } from 'lucide-react';

const sampleContacts = [
  { id: '1', name: 'Admin', email: 'admin@nexos.com', phone: '+1 555-0100', location: 'System' },
  { id: '2', name: 'NexOS Support', email: 'support@nexos.com', phone: '+1 555-0200', location: 'Cloud' },
  { id: '3', name: 'AI Assistant', email: 'ai@nexos.com', phone: 'N/A', location: 'Neural Net' },
  { id: '4', name: 'Security Team', email: 'security@nexos.com', phone: '+1 555-0300', location: 'Firewall' },
  { id: '5', name: 'Dev Team', email: 'dev@nexos.com', phone: '+1 555-0400', location: 'Lab' },
];

const Contacts: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const filtered = sampleContacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const active = sampleContacts.find(c => c.id === selected);

  return (
    <div className="flex h-full">
      <div className="w-48 border-r border-white/10 flex flex-col">
        <div className="p-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-white/5 border border-white/10">
            <Search className="w-3 h-3 opacity-40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="flex-1 bg-transparent text-[10px] outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(c.id)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-xs border-b border-white/5 ${
                selected === c.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}>
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4">
        {active ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-medium">{active.name}</h3>
                <p className="text-[10px] opacity-40">Contact</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { icon: AtSign, label: 'Email', value: active.email },
                { icon: Phone, label: 'Phone', value: active.phone },
                { icon: MapPin, label: 'Location', value: active.location },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5 text-xs">
                  <f.icon className="w-4 h-4 opacity-40" />
                  <div>
                    <p className="text-[10px] opacity-40">{f.label}</p>
                    <p>{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full opacity-30 text-xs">
            Select a contact
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
