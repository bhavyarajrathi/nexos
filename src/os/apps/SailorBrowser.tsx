import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  ArrowLeft,
  ArrowRight,
  Globe,
  RefreshCw,
  ExternalLink,
  Radar,
} from 'lucide-react';

type ThreatReport = {
  score: number;
  verdict: 'Low' | 'Medium' | 'High';
  reasons: string[];
  dnsStatus: string;
  dnsSecValidated: boolean;
};

const quickSites = [
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'MDN', url: 'https://developer.mozilla.org' },
];

const normalizeInputToUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 'https://duckduckgo.com';

  const looksLikeUrl = trimmed.includes('.') && !trimmed.includes(' ');
  if (!looksLikeUrl) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const analyzeLocalRisk = (targetUrl: URL) => {
  let score = 90;
  const reasons: string[] = [];

  if (targetUrl.protocol !== 'https:') {
    score -= 30;
    reasons.push('Connection is not HTTPS.');
  }

  if (targetUrl.hostname.length > 40) {
    score -= 8;
    reasons.push('Hostname is unusually long.');
  }

  if (/xn--|\d{3,}/i.test(targetUrl.hostname)) {
    score -= 12;
    reasons.push('Hostname has patterns often used in spoofed domains.');
  }

  if (/\.zip$|\.xyz$|\.top$/i.test(targetUrl.hostname)) {
    score -= 14;
    reasons.push('Domain TLD is frequently abused by phishing campaigns.');
  }

  return { score: Math.max(6, score), reasons };
};

const SailorBrowser: React.FC = () => {
  const [url, setUrl] = useState('https://duckduckgo.com');
  const [input, setInput] = useState('https://duckduckgo.com');
  const [history, setHistory] = useState<string[]>(['https://duckduckgo.com']);
  const [histIdx, setHistIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<ThreatReport>({
    score: 82,
    verdict: 'Low',
    reasons: ['No active threat signals from local heuristics.'],
    dnsStatus: 'Resolved',
    dnsSecValidated: true,
  });

  const verdictColor = useMemo(() => {
    if (report.verdict === 'Low') return 'text-emerald-300';
    if (report.verdict === 'Medium') return 'text-amber-300';
    return 'text-rose-300';
  }, [report.verdict]);

  const runThreatScan = async (nextUrl: string) => {
    setIsScanning(true);

    try {
      const parsed = new URL(nextUrl);
      const local = analyzeLocalRisk(parsed);

      let dnsStatus = 'Resolved';
      let dnsSecValidated = false;
      let score = local.score;
      const reasons = [...local.reasons];

      try {
        const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(parsed.hostname)}&type=A`, {
          cache: 'no-store',
        });
        const dnsData = await dnsRes.json();
        dnsSecValidated = Boolean(dnsData.AD);

        if (dnsData.Status !== 0) {
          dnsStatus = 'Unresolved';
          score -= 20;
          reasons.push('Domain DNS resolution failed in real-time check.');
        } else {
          dnsStatus = 'Resolved';
        }

        if (!dnsSecValidated) {
          score -= 8;
          reasons.push('DNSSEC could not be validated by resolver response.');
        }
      } catch {
        score -= 6;
        dnsStatus = 'Check unavailable';
        reasons.push('Live DNS intelligence endpoint is temporarily unavailable.');
      }

      const normalized = Math.max(4, Math.min(98, score));
      const verdict: ThreatReport['verdict'] = normalized >= 70 ? 'Low' : normalized >= 45 ? 'Medium' : 'High';

      setReport({
        score: normalized,
        verdict,
        reasons: reasons.length ? reasons : ['No active threat signals from local heuristics.'],
        dnsStatus,
        dnsSecValidated,
      });
    } catch {
      setReport({
        score: 35,
        verdict: 'High',
        reasons: ['Invalid URL format detected.'],
        dnsStatus: 'Invalid URL',
        dnsSecValidated: false,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const navigate = (value: string) => {
    const next = normalizeInputToUrl(value);
    setUrl(next);
    setInput(next);
    setHistory(prev => [...prev.slice(0, histIdx + 1), next]);
    setHistIdx(prev => prev + 1);
    runThreatScan(next);
  };

  const goBack = () => {
    if (histIdx <= 0) return;
    const i = histIdx - 1;
    setHistIdx(i);
    setUrl(history[i]);
    setInput(history[i]);
    runThreatScan(history[i]);
  };

  const goForward = () => {
    if (histIdx >= history.length - 1) return;
    const i = histIdx + 1;
    setHistIdx(i);
    setUrl(history[i]);
    setInput(history[i]);
    runThreatScan(history[i]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      <div className="flex items-center gap-1.5 px-2 py-2 border-b border-white/10 bg-gradient-to-r from-slate-900 to-indigo-900/70">
        <button onClick={goBack} className="p-1.5 rounded hover:bg-white/10" disabled={histIdx <= 0}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={goForward} className="p-1.5 rounded hover:bg-white/10" disabled={histIdx >= history.length - 1}>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => navigate(url)} className="p-1.5 rounded hover:bg-white/10">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <form onSubmit={e => { e.preventDefault(); navigate(input); }} className="flex-1 flex">
          <div className="flex items-center flex-1 h-8 px-2.5 rounded-xl bg-black/35 border border-cyan-300/20 gap-1.5">
            <Globe className="w-3 h-3 opacity-50" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none"
              placeholder="Search or enter secure URL"
            />
            <Search className="w-3 h-3 opacity-50" />
          </div>
        </form>

        <button onClick={() => runThreatScan(url)} className="px-2.5 h-8 rounded-xl bg-cyan-500/20 border border-cyan-300/25 text-xs inline-flex items-center gap-1.5">
          <Radar className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} /> Scan
        </button>
      </div>

      <div className="flex gap-1.5 px-2.5 py-1.5 border-b border-white/10">
        {quickSites.map(site => (
          <button key={site.name} onClick={() => navigate(site.url)} className="px-2 py-0.5 text-[10px] rounded bg-white/5 hover:bg-white/10">
            {site.name}
          </button>
        ))}
        <button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} className="ml-auto px-2 py-0.5 text-[10px] rounded bg-white/5 hover:bg-white/10 inline-flex items-center gap-1">
          Open external <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] flex-1 min-h-0">
        <div className="bg-white min-h-0">
          <iframe
            src={url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Sailor Browser"
          />
        </div>

        <aside className="border-l border-white/10 bg-slate-900/95 p-3 space-y-3 overflow-auto">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">Sailor Secure Shield</p>
            <p className={`text-2xl font-semibold mt-2 ${verdictColor}`}>{report.score}/100</p>
            <p className="text-xs mt-1 inline-flex items-center gap-1.5">
              {report.verdict === 'Low' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />}
              Threat level: {report.verdict}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/70">DNS Status</p>
            <p className="text-sm mt-1">{report.dnsStatus}</p>
            <p className="text-xs text-white/60 mt-1">DNSSEC: {report.dnsSecValidated ? 'Validated' : 'Not validated'}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/70 mb-2">Real-time security findings</p>
            <ul className="space-y-1.5 text-xs text-white/85">
              {report.reasons.map(reason => (
                <li key={reason} className="leading-relaxed">• {reason}</li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-white/45 leading-relaxed">
            Sailor uses live DNS intelligence from Google Public DNS API and local anti-phishing heuristics.
            Some websites block iframe embedding; use Open external for those pages.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default SailorBrowser;
