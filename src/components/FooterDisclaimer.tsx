import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="bg-[#070708] border-t border-white/5 text-slate-500 text-[10px] font-mono py-2 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-2">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        <span>DISCLAIMER: AI-generated insights are analytical investigative leads and must be independently verified.</span>
      </div>
      <div>CHAKRA ENGINE v2.4.1 // CORE_ANALYSIS_ENABLED</div>
    </footer>
  );
};
