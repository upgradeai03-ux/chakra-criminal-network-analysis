import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, Database, CheckCircle2, AlertCircle, Globe, LogOut, RefreshCw, Shield } from 'lucide-react';
import { Entity, InvestigationCase } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { languageNames, LanguageCode } from '../locales/translations';
import { useAuth } from '../context/AuthContext';
import { useIntelligence } from '../context/IntelligenceContext';
import { UserProfileModal } from './UserProfileModal';

interface HeaderProps {
  activeCase: InvestigationCase;
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
  onOpenIngestion: () => void;
  onOpenResolution: () => void;
  onSelectCase: (caseNumber: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCase,
  entities,
  onSelectEntity,
  onOpenIngestion,
  onOpenResolution,
  onSelectCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { currentUser, availableOfficersList, switchOfficer, logout, canImportIntel, canResolveEntities } = useAuth();
  const { allCases, alerts } = useIntelligence();

  const filteredEntities = searchQuery.trim() === '' 
    ? [] 
    : entities.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.details.phone && e.details.phone.includes(searchQuery)) ||
        (e.details.vehicleNumber && e.details.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const userDisplayName = currentUser?.name || 'Officer';
  const userDisplayRole = currentUser?.role || 'VIEWER';
  const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <header className="bg-[#0F0F12] border-b border-white/10 text-slate-300 h-16 px-6 flex items-center justify-between sticky top-0 z-50 font-sans select-none">
        {/* Left: Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-lg text-white">
                  CHAKRA
                </span>
                <span className="text-[10px] uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                  INTEL ENGINE
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-cyan-500/80 font-medium">
                {t('login.subtitle')}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

          {/* Case Badge Selector */}
          <div className="relative">
            <button
              onClick={() => { 
                setIsCaseMenuOpen(!isCaseMenuOpen); 
                setIsLangMenuOpen(false); 
                setIsUserMenuOpen(false);
              }}
              className="hidden lg:flex items-center space-x-2 bg-[#1A1A1F] hover:bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-slate-500">{t('header.activeCase')}:</span>
              <span className="text-cyan-400 font-semibold">{activeCase.caseNumber}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
            </button>

            {isCaseMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-[#0F0F12] border border-white/10 rounded-xl shadow-2xl p-3 z-50 font-mono">
                <div className="text-[11px] text-slate-500 px-3 py-1.5 border-b border-white/10 mb-2 flex justify-between items-center">
                  <span>{t('header.selectCase')}</span>
                  <span className="text-cyan-400">{allCases.length} {t('common.active')}</span>
                </div>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {allCases.map(c => (
                    <div
                      key={c.caseNumber}
                      onClick={() => {
                        onSelectCase(c.caseNumber);
                        setIsCaseMenuOpen(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        activeCase.caseNumber === c.caseNumber
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                          : 'bg-[#1A1A1F] border-white/5 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-cyan-400">{c.caseNumber}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 line-clamp-1">{c.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                        <span>{c.category}</span>
                        <span>{c.entitiesCount} {t('network.entities')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="relative max-w-md w-full mx-4 hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={t('header.searchPlaceholder')}
              className="w-full bg-[#1A1A1F] border border-white/5 rounded-md pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                className="absolute right-3 text-xs text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
              >
                ESC
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F0F12] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto font-mono">
              <div className="px-3 py-2 bg-[#0A0A0B] text-[11px] font-mono text-slate-500 border-b border-white/10 flex justify-between">
                <span>{t('header.searchResults')}</span>
                <span>{filteredEntities.length}</span>
              </div>
              {filteredEntities.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  {t('header.noResults')}
                </div>
              ) : (
                <div>
                  {filteredEntities.map(entity => (
                    <div
                      key={entity.id}
                      onClick={() => {
                        onSelectEntity(entity.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2.5 hover:bg-white/5 border-b border-white/5 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white">{entity.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            entity.type === 'PERSON' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                            entity.type === 'PHONE' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                            entity.type === 'VEHICLE' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            entity.type === 'ORGANIZATION' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                            'bg-white/5 text-slate-300'
                          }`}>
                            {entity.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {entity.details.phone || entity.details.vehicleNumber || entity.details.address || 'No secondary identifier'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          entity.riskScore >= 80 ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
                          entity.riskScore >= 60 ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' :
                          'text-emerald-400 bg-emerald-500/10'
                        }`}>
                          {t('header.priority')}: {entity.riskScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => { 
                setIsLangMenuOpen(!isLangMenuOpen); 
                setIsCaseMenuOpen(false); 
                setIsUserMenuOpen(false);
              }}
              className="flex items-center space-x-1.5 bg-[#1A1A1F] hover:bg-white/5 text-slate-300 border border-white/10 px-2.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
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

          {canImportIntel && (
            <button
              onClick={onOpenIngestion}
              className="hidden xl:flex items-center space-x-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer font-bold"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{t('header.importIntel')}</span>
            </button>
          )}

          {canResolveEntities && (
            <button
              onClick={onOpenResolution}
              className="hidden xl:flex items-center space-x-1.5 bg-[#1A1A1F] hover:bg-white/5 text-slate-300 border border-white/5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('header.entityResolution')}</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsCaseMenuOpen(false);
                setIsLangMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="p-2 text-slate-400 hover:text-white bg-[#1A1A1F] hover:bg-white/5 rounded-md relative transition-colors border border-white/5 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                </>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0F0F12] border border-white/10 rounded-lg shadow-2xl p-4 z-50 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {t('header.intelAlerts')} ({alerts.length})
                  </span>
                  <span 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[10px] text-cyan-400 cursor-pointer hover:underline font-mono"
                  >
                    {t('header.close')}
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {alerts.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded">
                      <div className="font-semibold text-red-300 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        <span>{a.title}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 font-mono">{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Current Officer Profile & Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsCaseMenuOpen(false);
                setIsLangMenuOpen(false);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center space-x-2.5 pl-1 font-mono hover:bg-white/5 py-1 px-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 uppercase">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white truncate max-w-[130px]">{userDisplayName}</div>
                <div className="text-[10px] text-cyan-400 font-mono flex items-center space-x-1">
                  <span>{userDisplayRole}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </button>

            {/* Profile / Switch User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0F0F12] border border-white/10 rounded-xl shadow-2xl p-3 z-50 font-mono">
                <div className="pb-3 border-b border-white/10 mb-2">
                  <div className="text-xs font-bold text-white">{userDisplayName}</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">{userDisplayRole}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">ID: {currentUser?.officerId} • Badge: {currentUser?.badgeNumber}</div>
                </div>

                <div className="space-y-1 mb-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('header.userProfile')}</span>
                  </button>

                  <div className="text-[10px] text-slate-500 px-3 py-1 uppercase tracking-wider font-bold">
                    {t('profile.switchAccount')}
                  </div>

                  {availableOfficersList.map(officer => {
                    const isSelected = officer.officerId === currentUser?.officerId;
                    return (
                      <button
                        key={officer.id}
                        onClick={() => {
                          switchOfficer(officer.officerId);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <div>{officer.name}</div>
                          <div className="text-[9px] text-slate-500">{officer.role}</div>
                        </div>
                        {isSelected && <span className="text-[9px] text-cyan-400">ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Profile & Switching Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};
