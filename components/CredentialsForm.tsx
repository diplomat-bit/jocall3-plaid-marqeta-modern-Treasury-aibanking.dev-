
import React, { useState } from 'react';
import { PlaidCredentials, MarqetaCredentials, ModernTreasuryCredentials } from '../types';
import { Shield, Eye, EyeOff, Server, Cpu, CreditCard, Landmark, ChevronRight, Lock, Code } from 'lucide-react';

interface Props {
  onSubmit: (plaid: PlaidCredentials, marqeta: MarqetaCredentials, mt: ModernTreasuryCredentials) => void;
}

export const CredentialsForm: React.FC<Props> = ({ onSubmit }) => {
  const [showPlaid, setShowPlaid] = useState(false);
  const [showMarqeta, setShowMarqeta] = useState(false);
  const [showMT, setShowMT] = useState(false);
  
  const [plaidData, setPlaidData] = useState<PlaidCredentials>({
    clientId: '',
    secret: '',
    environment: 'sandbox'
  });

  const [marqetaData, setMarqetaData] = useState<MarqetaCredentials>({
    applicationToken: '',
    adminAccessToken: ''
  });

  const [mtData, setMtData] = useState<ModernTreasuryCredentials>({
    organizationId: '',
    apiKey: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      plaidData.clientId && plaidData.secret && 
      marqetaData.applicationToken && marqetaData.adminAccessToken &&
      mtData.organizationId && mtData.apiKey
    ) {
      onSubmit(plaidData, marqetaData, mtData);
    }
  };

  const mtEncoded = mtData.organizationId && mtData.apiKey ? btoa(`${mtData.organizationId}:${mtData.apiKey}`) : null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in zoom-in-95 duration-700">
        <div className="p-10 border-b border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/30 text-white">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">Fintech Protocol Stack</h2>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.3em]">Multi-Node Node Authentication Gateway</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* Plaid Node */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <Server size={16} className="text-blue-500" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Plaid Connectivity Node</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input 
                type="text" required
                className="w-full px-5 py-4 rounded-xl border border-white/5 bg-slate-950 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="PLAID_CLIENT_ID"
                value={plaidData.clientId}
                onChange={(e) => setPlaidData(p => ({ ...p, clientId: e.target.value }))}
              />
              <div className="relative">
                <input 
                  type={showPlaid ? "text" : "password"} required
                  className="w-full px-5 py-4 rounded-xl border border-white/5 bg-slate-950 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="PLAID_SECRET"
                  value={plaidData.secret}
                  onChange={(e) => setPlaidData(p => ({ ...p, secret: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPlaid(!showPlaid)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showPlaid ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Marqeta Node */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <CreditCard size={16} className="text-emerald-500" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Marqeta Issuing Node</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input 
                type="text" required
                className="w-full px-5 py-4 rounded-xl border border-white/5 bg-slate-950 text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="MARQETA_APP_TOKEN"
                value={marqetaData.applicationToken}
                onChange={(e) => setMarqetaData(p => ({ ...p, applicationToken: e.target.value }))}
              />
              <div className="relative">
                <input 
                  type={showMarqeta ? "text" : "password"} required
                  className="w-full px-5 py-4 rounded-xl border border-white/5 bg-slate-950 text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="MARQETA_ADMIN_TOKEN"
                  value={marqetaData.adminAccessToken}
                  onChange={(e) => setMarqetaData(p => ({ ...p, adminAccessToken: e.target.value }))}
                />
                <button type="button" onClick={() => setShowMarqeta(!showMarqeta)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showMarqeta ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Modern Treasury Node */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <Landmark size={16} className="text-purple-500" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Modern Treasury Ledger Node</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input 
                type="text" required
                className="w-full px-5 py-4 rounded-xl border border-white/5 bg-slate-950 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                placeholder="MODERN_TREASURY_ORG_ID"
                value={mtData.organizationId}
                onChange={(e) => setMtData(p => ({ ...p, organizationId: e.target.value }))}
              />
              <div className="relative">
                <input 
                  type={showMT ? "text" : "password"} required
                  className="w-full px-5 py-4 rounded-xl border border-white/5 bg-slate-950 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                  placeholder="MODERN_TREASURY_API_KEY"
                  value={mtData.apiKey}
                  onChange={(e) => setMtData(p => ({ ...p, apiKey: e.target.value }))}
                />
                <button type="button" onClick={() => setShowMT(!showMT)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showMT ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {mtEncoded && (
              <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-center justify-between gap-6 animate-in slide-in-from-top-2">
                 <div className="flex items-center gap-4">
                    <Code size={20} className="text-purple-500" />
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Base64 Encoded Basic Auth</p>
                       <p className="text-[10px] font-mono text-purple-400 break-all">{mtEncoded}</p>
                    </div>
                 </div>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition-all uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-6 group"
          >
            Authenticate Core Stack
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </form>
      </div>
    </div>
  );
};
