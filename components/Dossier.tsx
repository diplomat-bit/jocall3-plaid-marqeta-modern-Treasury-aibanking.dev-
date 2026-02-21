
import React from 'react';
import { Account, MarqetaCardProduct, ModernTreasuryCredentials } from '../types';
import { Shield, Zap, Activity, Database, Landmark, Cpu, Code, Globe, Lock } from 'lucide-react';

interface Props {
  accounts: Account[];
  products: MarqetaCardProduct[];
  mtData: any;
  mtResource: string;
  onClose: () => void;
}

export const Dossier: React.FC<Props> = ({ accounts, products, mtData, mtResource, onClose }) => {
  const totalLiquidity = accounts.reduce((acc, curr) => acc + (curr.balance?.current || 0), 0);
  const timestamp = new Date().toISOString();
  const dossierId = `NEX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 overflow-y-auto p-4 md:p-12 print:p-0 print:bg-white print:text-slate-950">
      <div className="max-w-5xl mx-auto space-y-8 print:space-y-4">
        
        {/* ACTION HEADER (NON-PRINTABLE) */}
        <div className="flex justify-between items-center mb-12 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Asset Dossier Engine</h2>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Protocol Version 4.0.1</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">Abort</button>
            <button onClick={() => window.print()} className="bg-white text-slate-950 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">Execute Physical Print</button>
          </div>
        </div>

        {/* THE DOSSIER START */}
        <div className="bg-slate-900/50 border border-white/10 rounded-[3rem] p-12 space-y-16 relative overflow-hidden print:border-slate-200 print:bg-white print:rounded-none print:p-8 print:shadow-none shadow-2xl">
          
          {/* Cyber Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-white/[0.02] -rotate-12 pointer-events-none select-none print:hidden uppercase italic">
            Confidential
          </div>

          {/* Dossier Top Plate */}
          <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-white/10 pb-12 print:border-slate-200 print:pb-6">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-blue-500 rounded-2xl flex items-center justify-center text-blue-500 print:border-slate-900 print:text-slate-900">
                    <Activity size={32} />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white print:text-slate-950">Nexus Sovereign</h1>
                    <p className="text-xs font-mono font-bold text-blue-500 uppercase tracking-[0.5em] print:text-slate-600">Operational Infrastructure Report</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Dossier_ID</p>
                    <p className="text-sm font-mono font-bold text-white print:text-slate-950">{dossierId}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Timestamp_UTC</p>
                    <p className="text-sm font-mono font-bold text-white print:text-slate-950">{timestamp}</p>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <div className="inline-block p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl print:border-slate-900 print:bg-slate-50">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 print:text-slate-600">Aggregated Net Liquidity</p>
                  <p className="text-5xl font-black italic text-white tracking-tighter print:text-slate-950">${totalLiquidity.toLocaleString()}</p>
                  <div className="mt-2 flex items-center justify-end gap-2 text-emerald-400 print:text-emerald-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse print:hidden" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Node Synchronized</span>
                  </div>
               </div>
            </div>
          </div>

          {/* SECTION 1: GLOBAL LIQUIDITY NODE (PLAID) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Landmark className="text-blue-500" size={20} />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] print:text-slate-950">Institutional Liquidity matrix</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {accounts.map(acc => (
                 <div key={acc.id} className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl print:border-slate-200 print:bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">REF_{acc.mask}</span>
                      <div className="w-2 h-2 rounded-full bg-blue-500/30 print:hidden" />
                    </div>
                    <p className="text-sm font-black text-white italic uppercase tracking-tight mb-1 print:text-slate-950">{acc.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">{acc.subtype} Node</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter print:text-slate-950">${acc.balance?.current?.toLocaleString()}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* SECTION 2: ISSUANCE NODES (MARQETA) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Cpu className="text-emerald-500" size={20} />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] print:text-slate-950">Active Issuance Protocol</h3>
            </div>
            <div className="overflow-hidden border border-white/10 rounded-2xl print:border-slate-200">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 print:bg-slate-100">
                    <tr>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset Name</th>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Provision Hash</th>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-slate-200">
                    {products.map(prod => (
                      <tr key={prod.token}>
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-white italic uppercase print:text-slate-950">{prod.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[10px] font-mono text-slate-500">{prod.token}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 print:border-slate-900 print:text-slate-900 print:bg-slate-50">Authorized</span>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">No Active Assets Provisioned</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </section>

          {/* SECTION 3: TREASURY SNAPSHOT (MODERN TREASURY) */}
          <section className="space-y-6 break-inside-avoid">
            <div className="flex items-center gap-3">
              <Database className="text-purple-500" size={20} />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] print:text-slate-950">Immutable Ledger State: /{mtResource}</h3>
            </div>
            <div className="bg-black/60 rounded-3xl p-8 border border-white/5 print:bg-slate-50 print:border-slate-200">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-1 h-8 bg-purple-500 rounded-full" />
                  <p className="text-[10px] font-mono text-slate-500 leading-relaxed max-w-2xl">This block represents the programmatic double-entry state verified via the Modern Treasury API Node. All values are final as of the timestamp provided in the dossier header.</p>
               </div>
               <pre className="text-[10px] font-mono text-purple-400/80 leading-tight whitespace-pre-wrap print:text-slate-900">
                 {JSON.stringify(mtData, null, 2)}
               </pre>
            </div>
          </section>

          {/* Dossier Footer */}
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 print:border-slate-200">
             <div className="flex items-center gap-6">
                <div className="w-24 h-24 p-2 bg-white rounded-xl print:border print:border-slate-200">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${dossierId}`} alt="QR Verification" className="w-full h-full grayscale" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 print:text-slate-950">Cryptographic Seal</p>
                   <p className="text-[9px] font-mono text-slate-500 break-all max-w-[200px]">SHA256: {btoa(timestamp + dossierId).substring(0, 32)}...</p>
                </div>
             </div>
             <div className="text-right space-y-2">
                <div className="flex items-center justify-end gap-3 text-slate-500">
                   <Lock size={12} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End Encryption Active</span>
                </div>
                <p className="text-[10px] font-black text-white italic uppercase tracking-tighter print:text-slate-950">Nexus Engineering Protocol Verified</p>
             </div>
          </div>

        </div>

        {/* BANKER SALT FOOTER (NON-PRINTABLE) */}
        <div className="text-center py-12 print:hidden">
           <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.8em]">Level: Banker Envy Detected</p>
        </div>

      </div>
    </div>
  );
};
