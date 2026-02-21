
import React, { useState, useEffect } from 'react';
import { 
  PlaidCredentials, Account, Transaction, 
  MarqetaCredentials, MarqetaCardProduct, MarqetaCard,
  ModernTreasuryCredentials, MTLedger, MTInternalAccount
} from '../types';
import { 
  CreditCard, Wallet, Search, ExternalLink, ChevronRight, Database, Landmark,
  RefreshCcw, AlertCircle, Info, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap,
  Activity, Settings, Box, Plus, Sparkles, X, CheckCircle, Cpu, UserCheck, Code,
  Terminal, Globe, Key, FileText, Users, ShoppingCart, Repeat, Layers, Lock, FileOutput
} from 'lucide-react';
import { Dossier } from './Dossier';

interface Props {
  accessToken: string;
  credentials: PlaidCredentials;
  marqetaCreds: MarqetaCredentials;
  mtCreds: ModernTreasuryCredentials;
  proxy: string;
  addLog: (msg: any, type?: 'req' | 'res' | 'err') => void;
}

export const Dashboard: React.FC<Props> = ({ accessToken, credentials, marqetaCreds, mtCreds, proxy, addLog }) => {
  const [activeTab, setActiveTab] = useState<'banking' | 'issuing' | 'ledgering'>('banking');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cardProducts, setCardProducts] = useState<MarqetaCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [newCard, setNewCard] = useState<MarqetaCard | null>(null);
  const [showDossier, setShowDossier] = useState(false);
  
  // Modern Treasury Explorer State
  const [mtResource, setMtResource] = useState<string>('ledgers');
  const [mtData, setMtData] = useState<any>(null);
  const [mtLoading, setMtLoading] = useState(false);

  const mtAuth = btoa(`${mtCreds.organizationId}:${mtCreds.apiKey}`);
  const marqetaAuth = btoa(`${marqetaCreds.applicationToken}:${marqetaCreds.adminAccessToken}`);

  const mtFetch = async (endpoint: string, method: string = 'GET', body?: any) => {
    const targetUrl = `https://app.moderntreasury.com/api${endpoint}`;
    const finalUrl = proxy ? `${proxy}${encodeURIComponent(targetUrl)}` : targetUrl;
    
    addLog(`${method} ${endpoint} [MODERN_TREASURY]`, 'req');
    try {
      const response = await fetch(finalUrl, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${mtAuth}`
        },
        body: body ? JSON.stringify(body) : undefined
      });
      
      const data = await response.json();
      if (!response.ok) {
        addLog(data, 'err');
        return { error: true, data };
      }
      addLog(data, 'res');
      return data;
    } catch (err: any) {
      addLog(err.message, 'err');
      throw err;
    }
  };

  const marqetaFetch = async (endpoint: string, method: string = 'GET', body?: any) => {
    const targetUrl = `https://sandbox-api.marqeta.com/v3${endpoint}`;
    const finalUrl = proxy ? `${proxy}${encodeURIComponent(targetUrl)}` : targetUrl;
    
    addLog(`${method} ${endpoint} [MARQETA]`, 'req');
    const res = await fetch(finalUrl, {
      method,
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Basic ${marqetaAuth}` 
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(r => r.json());
    addLog(res, 'res');
    return res;
  };

  const fetchStack = async () => {
    setLoading(true);
    try {
      // 1. Plaid
      const plaidBase = `https://${credentials.environment}.plaid.com`;
      const pUrl = proxy ? `${proxy}${encodeURIComponent(plaidBase + '/accounts/get')}` : plaidBase + '/accounts/get';
      const pRes = await fetch(pUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: credentials.clientId, secret: credentials.secret, access_token: accessToken })
      }).then(r => r.json());
      
      if (pRes.accounts && Array.isArray(pRes.accounts)) {
        const mapped = pRes.accounts.map((a: any) => ({
          id: a.account_id,
          name: a.name || 'Untitled Account',
          mask: a.mask || '0000',
          type: a.type || 'depository',
          subtype: a.subtype || 'checking',
          balance: {
            current: a.balances?.current ?? 0,
            available: a.balances?.available ?? null,
            limit: a.balances?.limit ?? null,
            currency: a.balances?.iso_currency_code || 'USD'
          }
        }));
        setAccounts(mapped);
      }

      // 2. Marqeta
      const mRes = await marqetaFetch('/cardproducts');
      setCardProducts(mRes.data || []);

      // 3. Modern Treasury Initial Sync
      await fetchMtResource('ledgers');

    } catch (e) {
      console.error(e);
      addLog("Infrastructure handshake error", 'err');
    } finally {
      setLoading(false);
    }
  };

  const fetchMtResource = async (resource: string) => {
    setMtLoading(true);
    setMtResource(resource);
    try {
      const data = await mtFetch(`/${resource}`);
      setMtData(data);
    } catch (e: any) {
      setMtData({ error: e.message, status: 'Proxy Node Rejected' });
    } finally {
      setMtLoading(false);
    }
  };

  useEffect(() => { fetchStack(); }, [accessToken, proxy]);

  const mintCard = async () => {
    setIsMinting(true);
    try {
      const userToken = 'u_' + Math.random().toString(36).substring(7);
      await marqetaFetch('/users', 'POST', { token: userToken, first_name: 'Nexus', last_name: 'Operator' });
      
      let productToken = cardProducts[0]?.token;
      if (!productToken) {
        const prod = await marqetaFetch('/cardproducts', 'POST', { 
          token: 'cp_' + Math.random().toString(36).substring(7), 
          name: 'Nexus Elite V1', 
          active: true, 
          config: { card_life_cycle: { activate_upon_issue: true, expiration_offset: { unit: 'YEARS', value: 5 } }, payment_instrument: 'VIRTUAL_PAN' } 
        });
        productToken = prod.token;
      }

      const card = await marqetaFetch('/cards?show_pan=true&show_cvv_number=true', 'POST', { user_token: userToken, card_product_token: productToken });
      setNewCard({ 
        pan: card.pan, 
        last_four: card.last_four, 
        expiration: card.expiration, 
        cvv: card.cvv_number, 
        token: card.token, 
        user_token: card.user_token, 
        card_product_token: card.card_product_token, 
        state: card.state 
      });
      await fetchStack();
    } catch (e: any) {
      addLog(e.message, 'err');
    } finally {
      setIsMinting(false);
    }
  };

  const netBalance = accounts.reduce((acc, curr) => 
    curr.type === 'depository' ? acc + (curr.balance?.current || 0) : acc - (curr.balance?.current || 0), 0
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-10">
      <div className="relative">
         <div className="w-24 h-24 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
         <div className="absolute inset-0 flex items-center justify-center">
            <Activity size={32} className="text-blue-500 animate-pulse" />
         </div>
      </div>
      <div className="text-center space-y-2">
         <p className="text-blue-500 font-black uppercase tracking-[0.5em] italic text-xs">Calibrating Infrastructure</p>
         <p className="text-slate-600 text-[10px] font-mono uppercase">Node Aggregator | Issuing Node | Ledger Node</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      
      {/* Sovereign Dossier View */}
      {showDossier && (
        <Dossier 
          accounts={accounts} 
          products={cardProducts} 
          mtData={mtData} 
          mtResource={mtResource}
          onClose={() => setShowDossier(false)} 
        />
      )}

      {/* SUCCESS MODAL */}
      {newCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] max-w-xl w-full text-center space-y-10 shadow-[0_0_100px_rgba(37,99,235,0.2)]">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-bounce">
               <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Mint Success</h2>
            <div className="relative h-56 bg-gradient-to-br from-blue-600 via-indigo-900 to-slate-950 rounded-3xl p-8 shadow-2xl border border-white/20 text-left overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
               <div className="h-full flex flex-col justify-between relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-9 bg-yellow-400/80 rounded shadow-inner" />
                    <Zap size={24} className="text-white/40" />
                  </div>
                  <p className="text-2xl font-mono font-bold tracking-[0.2em] text-white drop-shadow-md">
                    {newCard.pan?.match(/.{1,4}/g)?.join(' ') || `**** **** **** ${newCard.last_four}`}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[8px] font-black text-white/40 uppercase">Asset Operator</p>
                       <p className="text-xs uppercase font-black text-white/80 italic">Nexus Protocol</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-white/40 uppercase font-mono tracking-tighter">EXP: {newCard.expiration} • CVV: {newCard.cvv}</p>
                    </div>
                  </div>
               </div>
            </div>
            <button onClick={() => setNewCard(null)} className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl uppercase tracking-widest text-sm hover:bg-blue-50 transition-all shadow-xl">Close visual protocol</button>
          </div>
        </div>
      )}

      {/* Navigation Nodes */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <nav className="flex flex-wrap gap-4 p-2 bg-slate-950/60 border border-white/5 rounded-[2rem] max-w-fit backdrop-blur-md">
          {[
            { id: 'banking', label: 'Aggregation', icon: Landmark, color: 'text-blue-500' },
            { id: 'issuing', label: 'Issuance', icon: CreditCard, color: 'text-emerald-500' },
            { id: 'ledgering', label: 'Treasury Explorer', icon: Terminal, color: 'text-purple-500' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl border border-white/10 ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? tab.color : ''} />
              <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
        
        <button 
          onClick={() => setShowDossier(true)}
          className="flex items-center gap-4 px-10 py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all group"
        >
          <FileOutput size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          Generate Sovereign Dossier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          
          {activeTab === 'banking' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4 px-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Institutional Connectivity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {accounts.map(acc => (
                  <div key={acc.id} className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative backdrop-blur-sm shadow-xl">
                    <Landmark className="absolute -right-4 -bottom-4 text-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-700" size={140} />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                       <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-400 border border-white/5 shadow-inner"><Landmark size={24} /></div>
                       <span className="text-[10px] font-mono text-slate-600 font-bold bg-black/40 px-3 py-1 rounded-full border border-white/5 uppercase">ID_{acc.mask}</span>
                    </div>
                    <div className="space-y-1 relative z-10">
                      <p className="text-lg font-black text-white italic uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{acc.name}</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{acc.subtype} • {acc.type}</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-end justify-between relative z-10">
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ledger_Current</p>
                          <p className="text-3xl font-black text-white italic tracking-tighter">${acc.balance?.current?.toLocaleString() || '0.00'}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Net_Available</p>
                          <p className="text-sm font-bold text-emerald-500">${acc.balance?.available?.toLocaleString() || 'N/A'}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'issuing' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="bg-slate-950/80 p-12 rounded-[3.5rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Cpu size={200} />
                 </div>
                 <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                       <Sparkles className="text-amber-400" size={24} />
                       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Nexus Mint Node</h3>
                    </div>
                    <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium">Provision authorized virtual assets on the Marqeta sandbox. Automated identity mapping protocol enabled.</p>
                 </div>
                 <button onClick={mintCard} disabled={isMinting} className="bg-blue-600 text-white px-12 py-7 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:opacity-50 relative z-10 border border-blue-400/20">
                   {isMinting ? <RefreshCcw className="animate-spin" size={20} /> : <Plus size={20} />}
                   {isMinting ? 'PROVISIONING...' : 'ISSUE NEW ASSET'}
                 </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {cardProducts.map(prod => (
                  <div key={prod.token} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between hover:border-emerald-500/30 transition-all group shadow-lg">
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Box size={24} /></div>
                      <div>
                        <p className="text-xl font-black text-white uppercase italic tracking-tight">{prod.name}</p>
                        <p className="text-[10px] font-mono text-slate-600 tracking-tighter uppercase font-bold">NODE_REF: {prod.token}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-inner">Operational</span>
                       <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest font-mono">Status_Check: 200 OK</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'ledgering' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
               <div className="bg-slate-950/60 p-8 rounded-[3.5rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex flex-wrap gap-3">
                     {[
                       { id: 'ledgers', label: 'Ledgers', icon: Database },
                       { id: 'ledger_accounts', label: 'Accounts', icon: Landmark },
                       { id: 'ledger_transactions', label: 'Transactions', icon: ShoppingCart },
                       { id: 'counterparties', label: 'Parties', icon: Users },
                       { id: 'payment_orders', label: 'Pay Orders', icon: Repeat },
                       { id: 'expected_payments', label: 'Expected', icon: FileText }
                     ].map(res => (
                       <button 
                        key={res.id}
                        onClick={() => fetchMtResource(res.id)}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${mtResource === res.id ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}
                       >
                         <res.icon size={14} />
                         {res.label}
                       </button>
                     ))}
                  </div>

                  <div className="bg-black/40 rounded-[2.5rem] p-10 border border-white/5 font-mono text-xs overflow-hidden relative group">
                     <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                           <span className="text-[11px] font-black uppercase text-purple-400 tracking-[0.4em]">MT_API_GATEWAY: /{mtResource}</span>
                        </div>
                        {mtLoading && <RefreshCcw size={16} className="animate-spin text-slate-600" />}
                     </div>
                     <div className="max-h-[500px] overflow-y-auto scrollbar-thin text-slate-400 leading-relaxed whitespace-pre-wrap relative z-10">
                        {mtLoading ? (
                          <div className="flex items-center gap-4 animate-pulse">
                             <div className="w-4 h-4 bg-slate-800 rounded" />
                             <span>Intercepting packets from Modern Treasury node...</span>
                          </div>
                        ) : JSON.stringify(mtData, null, 2)}
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
                  </div>
               </div>
            </section>
          )}
        </div>

        {/* System Monitor & Vault Panel */}
        <aside className="space-y-10">
          <div className="bg-slate-950/80 p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl backdrop-blur-xl sticky top-32">
             <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 flex items-center gap-3">
                  <Activity size={18} className="text-blue-500" /> Infrastructure
                </h4>
                <div className="space-y-3">
                  {[
                    { node: 'AGGREGATOR', status: 'ACTIVE', color: 'text-blue-500', val: `$${netBalance.toLocaleString()}` },
                    { node: 'ISSUER', status: 'STABLE', color: 'text-emerald-500', val: cardProducts.length.toString() + ' ACTIVE' },
                    { node: 'LEDGER', status: 'SYNCED', color: 'text-purple-500', val: '200 OK' }
                  ].map(n => (
                    <div key={n.node} className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:bg-slate-900/60 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{n.node}</span>
                        <span className={`text-[10px] font-bold ${n.color}`}>{n.status}</span>
                      </div>
                      <span className="text-2xl font-black text-white italic tracking-tighter">{n.val}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* AUTH VAULT */}
             <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 flex items-center gap-3">
                  <Lock size={18} className="text-emerald-500" /> Encoded Vault
                </h4>
                <div className="space-y-4">
                   <div className="p-6 bg-slate-900/80 rounded-2xl border border-white/5 space-y-3 group hover:border-emerald-500/20 transition-all">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">MT_BASIC_AUTH_HEADER</span>
                         <Code size={12} className="text-slate-700" />
                      </div>
                      <div className="font-mono text-[9px] text-slate-600 break-all p-4 bg-black/60 rounded-xl select-all cursor-copy hover:text-slate-300 transition-colors border border-white/5">
                        Basic {mtAuth}
                      </div>
                   </div>

                   <div className="p-6 bg-slate-900/80 rounded-2xl border border-white/5 space-y-3 group hover:border-blue-500/20 transition-all">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">MARQETA_BASIC_AUTH_HEADER</span>
                         <Code size={12} className="text-slate-700" />
                      </div>
                      <div className="font-mono text-[9px] text-slate-600 break-all p-4 bg-black/60 rounded-xl select-all cursor-copy hover:text-slate-300 transition-colors border border-white/5">
                        Basic {marqetaAuth}
                      </div>
                   </div>
                </div>
             </div>

             <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-4 py-6 rounded-2xl border border-white/10 text-slate-600 hover:text-white hover:bg-red-500/5 hover:border-red-500/20 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-lg">
                <RefreshCcw size={16} /> RESET TERMINAL SESSION
             </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
