import React, { useState } from 'react';
import { User, Shield, KeyRound, LogOut, CheckCircle2, X, RefreshCw, Briefcase, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, availableOfficersList, switchOfficer, logout } = useAuth();
  const { t } = useLanguage();
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSelectOfficer = (officer: UserProfile) => {
    switchOfficer(officer.officerId || officer.id);
    setIsSwitching(false);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="bg-[#0F0F12] border border-cyan-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-black font-bold text-base shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center space-x-2">
                <span>{currentUser.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {currentUser.role}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {currentUser.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1A1A1F] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1 text-xs">
          {/* User Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-[#1A1A1F] border border-white/5 p-3 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase">{t('profile.officerId')}</div>
              <div className="text-sm font-bold text-cyan-400 mt-1 font-mono">{currentUser.officerId || 'N/A'}</div>
            </div>
            <div className="bg-[#1A1A1F] border border-white/5 p-3 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase">{t('profile.badge')}</div>
              <div className="text-sm font-bold text-white mt-1 font-mono">{currentUser.badgeNumber || 'N/A'}</div>
            </div>
            <div className="bg-[#1A1A1F] border border-white/5 p-3 rounded-lg col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-500 uppercase">{t('common.status')}</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 font-mono flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentUser.status || 'ACTIVE'}</span>
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="bg-[#141418] border border-white/5 rounded-xl p-4 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('profile.permissions')} ({currentUser.role})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {(currentUser.permissions || [
                'Graph Query & Centrality Inspection',
                'Case Intelligence Dossier Review',
                'Audit Surveillance Access'
              ]).map((perm, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Switch User Section */}
          <div className="border border-white/10 rounded-xl p-4 bg-[#0A0A0B]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-white font-bold">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>{t('profile.switchAccount')}</span>
              </div>
              <span className="text-[10px] text-slate-500">SYNTHETIC DEMO</span>
            </div>
            
            <div className="space-y-2">
              {availableOfficersList.map(officer => {
                const isCurrent = officer.officerId === currentUser.officerId || officer.id === currentUser.id;
                return (
                  <button
                    key={officer.id}
                    onClick={() => handleSelectOfficer(officer)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-[#1A1A1F] border-white/5 text-slate-300 hover:bg-white/5 hover:border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center font-bold text-xs">
                        {officer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{officer.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {officer.role} • ID: {officer.officerId}
                        </div>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-cyan-400 font-bold hover:underline">
                        Switch →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('profile.logout')}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A1A1F] hover:bg-white/10 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            {t('profile.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
