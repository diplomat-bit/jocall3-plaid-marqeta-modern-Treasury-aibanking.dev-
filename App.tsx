
import React, { useState, useEffect } from 'react';
import { 
  Terminal, Shield, Key, Link as LinkIcon, Database, 
  LayoutDashboard, Activity, AlertCircle, RefreshCcw, 
  ArrowRight, Globe, Settings2, ChevronRight, Terminal as TerminalIcon
} from 'lucide-react';
import { FlowStep, PlaidCredentials, PlaidTokenState, MarqetaCredentials, ModernTreasuryCredentials } from './types';
import { CredentialsForm } from './components/CredentialsForm';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [step, setStep] = useState<FlowStep>(FlowStep.CREDENTIALS);
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [credentials, setCredentials] = useState<PlaidCredentials | null>(null);
  const [marqetaCreds, setMarqetaCreds] = useState<MarqetaCredentials | null>(null);
  const [mtCreds, setMtCreds] = useState<ModernTreasuryCredentials | null>(null);
  const [tokens, setTokens] = useState<PlaidTokenState>({
    linkToken: null,
    publicToken: null,
    accessToken: null
  });
  const [logs, setLogs] = useState<{msg: string, type: 'req' | 'res' | 'err', timestamp: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [proxyUrl, setProxyUrl] = useState('https://corsproxy.io/?url=');
  const [useProxy, setUseProxy] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let checkInterval: number;
    const checkPlaid = () => {
      if ((window as any).Plaid) {
        setSdkStatus('ready');
        clearInterval(checkInterval);
      } else if ((window as any).PLAID_LOAD_ERROR) {
        setSdkStatus('error');
        clearInterval(checkInterval);
      }
    };
    checkInterval = window.setInterval(checkPlaid, 500);
    return () => clearInterval(checkInterval);
  }, []);

  const addLog = (msg: any, type: 'req' | 'res' | 'err' = 'res') => {
    const stringified = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 } as any);
    setLogs(prev => [{ msg: stringified, type, timestamp }, ...prev].slice(0, 50));
  };

  const handleCredentialsSubmit = (plaid: PlaidCredentials, marqeta: MarqetaCredentials, mt: ModernTreasuryCredentials) => {
    setCredentials(plaid);
    setMarqetaCreds(marqeta);
    setMtCreds(mt);
    setStep(FlowStep.LINK_TOKEN);
    addLog("Stack credentials initialized.", 'res');
  };

  const createLinkToken = async () => {
    setIsLoading(true);
    try {
      const targetUrl = `https://${credentials?.environment}.plaid.com/link/token/create`;
      const finalUrl = useProxy ? `${proxyUrl}${encodeURIComponent(targetUrl)}` : targetUrl;
      const res = await fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: credentials?.clientId,
          secret: credentials?.secret,
          user: { client_user_id: 'nexus_' + Date.now() },
          client_name: 'Nexus Terminal',
          products: ['auth', 'transactions'],
          country_codes: ['US'],
          language: 'en'
        })
      }).then(r => r.json());
      
      if (res.error_message) throw new Error(res.error_message);
      setTokens(prev => ({ ...prev, linkToken: res.link_token }));
      setStep(FlowStep.LINK_UI);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openLink = () => {
    if (!tokens.linkToken) return;
    (window as any).Plaid.create({
      token: tokens.linkToken,
      onSuccess: (public_token: string) => {
        setTokens(prev => ({ ...prev, publicToken: public_token }));
        setStep(FlowStep.EXCHANGE);
      },
      onExit: (err: any) => err && setError(err.message)
    }).open();
  };

  const exchangeToken = async () => {
    setIsLoading(true);
    try {
      const targetUrl = `https://${credentials?.environment}.plaid.com/item/public_token/exchange`;
      const finalUrl = useProxy ? `${proxyUrl}${encodeURIComponent(targetUrl)}` : targetUrl;
      const res = await fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: credentials?.clientId,
          secret: credentials?.secret,
          public_token: tokens.publicToken
        })
      }).then(r => r.json());
      
      if (res.error_message) throw new Error(res.error_message);
      setTokens(prev => ({ ...prev, accessToken: res.access_token }));
      setStep(FlowStep.DASHBOARD);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50 h-24 flex items-center">
        <div className="max-w-[1600px] mx-auto px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Activity className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">Nexus<span className="text-blue-500">Terminal</span></h1>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-3.5 rounded-2xl border border-white/5 text-slate-400">
            <Settings2 size={22} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="bg-blue-600 p-[1px] z-40">
           <div className="bg-[#020617] p-8 flex items-center gap-6">
              <input type="text" value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)} className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-blue-400" />
           </div>
        </div>
      )}

      <main className="flex-1 flex flex-col xl:flex-row max-w-[1600px] mx-auto w-full p-8 lg:p-12 gap-12 relative z-10">
        <div className="flex-1 space-y-12">
          {step === FlowStep.CREDENTIALS && <CredentialsForm onSubmit={handleCredentialsSubmit} />}
          {step === FlowStep.LINK_TOKEN && (
            <div className="text-center p-20 bg-slate-900/30 rounded-[3rem] border border-white/5 space-y-8">
              <Key size={56} className="mx-auto text-blue-500" />
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Plaid Handshake</h2>
              <button onClick={createLinkToken} disabled={isLoading} className="bg-blue-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm">
                {isLoading ? <RefreshCcw className="animate-spin" /> : 'Request Link Token'}
              </button>
            </div>
          )}
          {step === FlowStep.LINK_UI && (
            <div className="text-center p-20 bg-slate-900/30 rounded-[3rem] border border-white/5 space-y-8">
              <LinkIcon size={56} className="mx-auto text-emerald-500" />
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Bank Linkage</h2>
              <button onClick={openLink} className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm">Launch Link UI</button>
            </div>
          )}
          {step === FlowStep.EXCHANGE && (
            <div className="text-center p-20 bg-slate-900/30 rounded-[3rem] border border-white/5 space-y-8">
              <Database size={56} className="mx-auto text-purple-500" />
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Auth Exchange</h2>
              <button onClick={exchangeToken} disabled={isLoading} className="bg-purple-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm">Finalize Node</button>
            </div>
          )}
          {step === FlowStep.DASHBOARD && credentials && tokens.accessToken && marqetaCreds && mtCreds && (
            <Dashboard 
              accessToken={tokens.accessToken} 
              credentials={credentials} 
              marqetaCreds={marqetaCreds}
              mtCreds={mtCreds}
              proxy={useProxy ? proxyUrl : ''}
              addLog={addLog}
            />
          )}
        </div>

        <aside className="w-full xl:w-[450px]">
          <div className="bg-slate-950/80 rounded-[2.5rem] border border-white/5 flex flex-col h-[700px] overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-7 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">System_Traffic</span>
              <button onClick={() => setLogs([])} className="text-[10px] font-black text-slate-600">Flush</button>
            </div>
            <div className="flex-1 overflow-y-auto p-7 space-y-5 font-mono text-[11px]">
              {logs.map((log, i) => (
                <div key={i} className={`p-4 rounded-xl border ${log.type === 'req' ? 'bg-blue-600/5 border-blue-500/20 text-blue-400' : log.type === 'err' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-slate-900/60 border-white/5 text-slate-400'}`}>
                  <div className="flex justify-between mb-2 opacity-50 text-[9px]">
                    <span className="uppercase">{log.type}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-all">{log.msg}</pre>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
