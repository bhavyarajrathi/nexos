import React, { useEffect, useMemo, useState } from 'react';
import {
  Shield,
  Lock,
  Globe,
  Activity,
  RefreshCw,
  Zap,
  Radio,
  Power,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type VpnServer = {
  id: string;
  name: string;
  region: string;
  latencyMs: number;
  loadPercent: number;
};

type NetworkIntel = {
  publicIp: string;
  city: string;
  country: string;
  isp: string;
  latencyMs: number;
  riskScore: number;
};

const vpnServers: VpnServer[] = [
  { id: 'sg-1', name: 'NexVpn Shield Node', region: 'Singapore', latencyMs: 58, loadPercent: 32 },
  { id: 'de-1', name: 'NexVpn Core Node', region: 'Frankfurt', latencyMs: 121, loadPercent: 44 },
  { id: 'us-1', name: 'NexVpn Edge Node', region: 'Virginia', latencyMs: 196, loadPercent: 27 },
  { id: 'in-1', name: 'NexVpn Quantum Node', region: 'Mumbai', latencyMs: 74, loadPercent: 38 },
];

const initialIntel: NetworkIntel = {
  publicIp: 'Unknown',
  city: 'Unknown',
  country: 'Unknown',
  isp: 'Unknown',
  latencyMs: 0,
  riskScore: 42,
};

const safeParseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const NexVpn: React.FC = () => {
  const [isConnected, setIsConnected] = useState(localStorage.getItem('nexvpn:state') === 'on');
  const [isConnecting, setIsConnecting] = useState(false);
  const [serverId, setServerId] = useState(vpnServers[3].id);
  const [killSwitch, setKillSwitch] = useState(true);
  const [smartRouting, setSmartRouting] = useState(true);
  const [quantumShield, setQuantumShield] = useState(true);
  const [intel, setIntel] = useState<NetworkIntel>(initialIntel);
  const [statusMsg, setStatusMsg] = useState('NexVpn AI is monitoring your network posture.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedServer = useMemo(
    () => vpnServers.find(server => server.id === serverId) || vpnServers[0],
    [serverId],
  );

  const fetchNetworkIntel = async () => {
    setErrorMsg(null);
    const start = performance.now();

    try {
      const [ipRes, geoRes] = await Promise.all([
        fetch('https://api64.ipify.org?format=json', { cache: 'no-store' }),
        fetch('https://ipapi.co/json/', { cache: 'no-store' }),
      ]);

      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      const ipData = await safeParseJson(ipRes);
      const geoData = await safeParseJson(geoRes);

      const baseRisk = latencyMs > 220 ? 64 : latencyMs > 120 ? 48 : 28;
      const riskScore = Math.max(8, Math.min(92, baseRisk + (geoData?.country_name ? 0 : 12)));

      setIntel({
        publicIp: ipData?.ip || 'Unknown',
        city: geoData?.city || 'Unknown',
        country: geoData?.country_name || 'Unknown',
        isp: geoData?.org || 'Unknown',
        latencyMs,
        riskScore,
      });

      setStatusMsg('Live network telemetry refreshed. NexVpn AI updated your security profile.');
    } catch {
      setErrorMsg('Unable to reach VPN intelligence APIs right now. Retrying is safe.');
      setStatusMsg('NexVpn AI switched to resilient offline posture mode.');
    }
  };

  useEffect(() => {
    fetchNetworkIntel();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexvpn:state', isConnected ? 'on' : 'off');
  }, [isConnected]);

  useEffect(() => {
    const onCommand = (event: Event) => {
      const customEvent = event as CustomEvent<{ action?: string }>;
      const action = customEvent.detail?.action;

      if (action === 'connect') {
        if (isConnected || isConnecting) return;
        setIsConnecting(true);
        setStatusMsg(`Connecting to ${selectedServer.region} via ${selectedServer.name}...`);
        window.setTimeout(() => {
          setIsConnecting(false);
          setIsConnected(true);
          setStatusMsg(`Secure tunnel established through ${selectedServer.region}. Zero-leak guard active.`);
        }, 900);
      }

      if (action === 'disconnect') {
        if (!isConnected && !isConnecting) return;
        setIsConnecting(false);
        setIsConnected(false);
        setStatusMsg('VPN disconnected. Traffic returned to standard route profile.');
      }
    };

    window.addEventListener('nexvpn-command', onCommand);
    return () => window.removeEventListener('nexvpn-command', onCommand);
  }, [isConnected, isConnecting, selectedServer.region, selectedServer.name]);

  const handleConnectionToggle = () => {
    if (isConnected) {
      setIsConnected(false);
      setStatusMsg('VPN disconnected. Traffic returned to standard route profile.');
      return;
    }

    setIsConnecting(true);
    setStatusMsg(`Connecting to ${selectedServer.region} via ${selectedServer.name}...`);

    window.setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setStatusMsg(`Secure tunnel established through ${selectedServer.region}. Zero-leak guard active.`);
    }, 1300);
  };

  const riskTone = intel.riskScore <= 30 ? 'text-emerald-300' : intel.riskScore <= 55 ? 'text-amber-300' : 'text-rose-300';

  return (
    <div className="h-full p-4 md:p-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4 h-full">
        <section className="rounded-2xl border border-violet-300/20 bg-black/35 backdrop-blur-xl p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-violet-200/80">NexVpn</p>
              <h2 className="text-2xl font-semibold mt-1">Smart VPN Security Core</h2>
              <p className="text-sm text-violet-100/70 mt-1">AI-assisted routing, threat scoring, and encrypted tunnel orchestration.</p>
            </div>
            <button
              onClick={fetchNetworkIntel}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Intel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Public IP</p>
              <p className="text-sm font-medium mt-1 break-all">{isConnected ? '10.77.0.21 (Tunnel)' : intel.publicIp}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Location</p>
              <p className="text-sm font-medium mt-1">{isConnected ? selectedServer.region : `${intel.city}, ${intel.country}`}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Network Latency</p>
              <p className="text-sm font-medium mt-1">{intel.latencyMs} ms</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/60">Threat Risk Score</p>
              <p className={`text-3xl font-bold mt-1 ${riskTone}`}>{intel.riskScore}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">Current ISP</p>
              <p className="text-sm font-medium mt-1 max-w-[220px] truncate">{intel.isp}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/60">Secure Tunnel Status</p>
                <p className="text-sm mt-1 inline-flex items-center gap-2">
                  {isConnected ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertTriangle className="w-4 h-4 text-amber-300" />}
                  {isConnecting ? 'Negotiating secure handshake...' : isConnected ? 'Connected and encrypted' : 'Disconnected'}
                </p>
              </div>
              <button
                onClick={handleConnectionToggle}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-300/30 bg-violet-500/20 hover:bg-violet-500/30 disabled:opacity-50"
              >
                <Power className="w-4 h-4" />
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
            <p className="text-xs text-violet-100/75 mt-3">{statusMsg}</p>
            {errorMsg && <p className="text-xs text-amber-300 mt-2">{errorMsg}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-300/20 bg-black/30 backdrop-blur-xl p-4 flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Smart Routing Node</p>
            <select
              value={serverId}
              onChange={e => setServerId(e.target.value)}
              className="w-full mt-2 rounded-lg bg-black/45 border border-white/15 px-3 py-2 text-sm"
              disabled={isConnecting}
            >
              {vpnServers.map(server => (
                <option key={server.id} value={server.id}>
                  {server.region} - {server.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/60 mt-2">{selectedServer.latencyMs} ms route latency • {selectedServer.loadPercent}% node load</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-emerald-300" /> Kill Switch</span>
              <button onClick={() => setKillSwitch(v => !v)} className={`text-xs px-2 py-1 rounded ${killSwitch ? 'bg-emerald-500/25 text-emerald-200' : 'bg-white/10 text-white/70'}`}>{killSwitch ? 'Enabled' : 'Disabled'}</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm"><Radio className="w-4 h-4 text-cyan-300" /> Smart Routing</span>
              <button onClick={() => setSmartRouting(v => !v)} className={`text-xs px-2 py-1 rounded ${smartRouting ? 'bg-cyan-500/25 text-cyan-200' : 'bg-white/10 text-white/70'}`}>{smartRouting ? 'Adaptive' : 'Manual'}</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-violet-300" /> Quantum Shield</span>
              <button onClick={() => setQuantumShield(v => !v)} className={`text-xs px-2 py-1 rounded ${quantumShield ? 'bg-violet-500/25 text-violet-200' : 'bg-white/10 text-white/70'}`}>{quantumShield ? 'Active' : 'Off'}</button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm text-white/80">
            <p className="inline-flex items-center gap-2"><Lock className="w-4 h-4 text-violet-300" /> AES-256 + ChaCha20 hybrid tunnel mode</p>
            <p className="inline-flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-300" /> DNS leak defense: {isConnected ? 'Shielded' : 'Monitoring'}</p>
            <p className="inline-flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-300" /> Session integrity score: {Math.max(70, 100 - intel.riskScore)}%</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NexVpn;
