import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, ArrowRight, ShieldAlert, CheckCircle2, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { languageNames, LanguageCode } from '../locales/translations';

export const LoginPortal: React.FC = () => {
  const { login, loginAsDemo, availableOfficersList } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [username, setUsername] = useState('cmdr.sharma');
  const [password, setPassword] = useState('chakra123');
  const [error, setError] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(username, password);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleQuickLogin = (officerId: string) => {
    setUsername(officerId);
    setPassword('chakra123');
    loginAsDemo(officerId);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0A0A0B] text-slate-300 flex flex-col justify-between p-6 sm:p-10 font-sans relative overflow-x-hidden select-none">
      {/* Background Tech Grid / Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/15 via-[#0A0A0B] to-[#0A0A0B] pointer-events-none" />
      
      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-xl text-white">CHAKRA</span>
              <span className="text-[10px] uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                SIH PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-cyan-500/80 font-mono tracking-wider">
              {t('login.subtitle')}
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center space-x-1.5 bg-[#141418] hover:bg-white/5 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer shadow-lg"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{languageNames[language]?.name}</span>
            <span className="text-[10px] text-slate-500">({languageNames[language]?.native})</span>
            <ChevronDown className="w-3 h-3 text-slate-500 ml-1" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#0F0F12] border border-white/10 rounded-xl shadow-2xl p-2 z-50 font-mono">
              <div className="text-[10px] text-slate-500 px-2.5 py-1 border-b border-white/10 mb-1">
                {t('header.language')}
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {(Object.keys(languageNames) as LanguageCode[]).map(code => (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      language === code ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{languageNames[code].name}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{languageNames[code].native}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Login Card & Demo Switcher */}
      <div className="w-full max-w-5xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Form: Officer Authentication */}
        <div className="lg:col-span-7 bg-[#0F0F12] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-[11px] font-mono text-cyan-400 font-bold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>{t('login.lawEnforcement')}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {t('login.title')} — Link Analysis Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono leading-relaxed">
              {t('login.demoNotice')}
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 font-mono flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                {t('login.officerId')}
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cmdr.sharma, insp.nair, dr.joshi..."
                  className="w-full bg-[#1A1A1F] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                {t('login.password')}
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="chakra123"
                  className="w-full bg-[#1A1A1F] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>Demo Password: <strong className="text-cyan-400">chakra123</strong></span>
                <span>Protected by local sandbox session</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>{t('login.submit')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Synthetic Demo Accounts 1-Click Picker */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0F0F12] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  {t('login.demoAccounts')}
                </span>
                <h2 className="text-sm font-bold text-white mt-0.5">
                  {t('login.selectDemo')}
                </h2>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                1-CLICK AUTH
              </span>
            </div>

            <div className="space-y-2.5">
              {availableOfficersList.map(officer => (
                <button
                  key={officer.id}
                  onClick={() => handleQuickLogin(officer.officerId)}
                  className="w-full text-left bg-[#1A1A1F] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 p-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-cyan-500/20 border border-white/10 group-hover:border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 font-mono">
                      {officer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {officer.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1.5">
                        <span className="text-cyan-400 font-semibold">{officer.role}</span>
                        <span>•</span>
                        <span className="text-slate-500">ID: {officer.officerId}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#141418] border border-white/5 rounded-xl p-4 text-[11px] font-mono text-slate-500">
            <div className="flex items-center space-x-2 text-slate-400 mb-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">Role-Based Access Control (RBAC)</span>
            </div>
            <p className="leading-relaxed">
              Login role enforces granular permissions across investigations, entity ingestion, graph resolution, and administrative diagnostic views.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="w-full max-w-6xl mx-auto text-center z-10 pt-4 border-t border-white/5">
        <p className="text-[11px] font-mono text-slate-500">
          CHAKRA Intelligence Engine • SIH 2024–2026 Innovation Architecture • Secured Offline-Capable Link Analysis System
        </p>
      </div>
    </div>
  );
};
