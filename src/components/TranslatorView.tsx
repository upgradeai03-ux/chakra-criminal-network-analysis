import React, { useState } from 'react';
import { 
  Languages, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Cpu, 
  Database, 
  Check, 
  FileText,
  AlertCircle 
} from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';
import { useAuth } from '../context/AuthContext';

const sampleTranslationBriefs = [
  {
    title: 'Mumbai Police Intercept (Hindi)',
    sourceLang: 'hi',
    targetLang: 'en',
    text: 'अर्जुन वर्मा को दिनांक 18-Aug-2024 को रात 22:30 बजे सफेद फॉर्च्यूनर MH12 AB 1234 में देखा गया। उसने मोबाइल नंबर +91 98211-44122 से रोहित देशमुख (+91 98920-11002) को कॉल किया और कहा कि शेलको लॉजिस्टिक्स के खाते में ₹42,00,000 ट्रांसफर कर दिए गए हैं।',
  },
  {
    title: 'Pune Expressway FIR (Marathi)',
    sourceLang: 'mr',
    targetLang: 'en',
    text: 'गुन्हा नोंद क्र. NDPS-118/2024 नुसार आरोपी रोहित देशमुख याने बनावट कागदपत्रांच्या आधारे Apex Pharma Trading Corp कंपनीकडून संशयित मालाची वाहतूक केली. त्याचा संपर्क क्रमांक +91 97660-33411 आहे.',
  },
  {
    title: 'Border Courier Log (Punjabi)',
    sourceLang: 'pa',
    targetLang: 'en',
    text: 'ਮਿਤੀ 15-ਅਗਸਤ-2024 ਨੂੰ ਕਰਨ ਮਲਹੋਤਰਾ ਨੇ ਵਾਹਨ DL01 CA 9988 ਰਾਹੀਂ ਖੇਪ ਪਹੁੰਚਾਈ। ਇਸ ਮਾਮਲੇ ਵਿੱਚ ਬੈਂਕ ਖਾਤਾ HDFC000192837 ਵਰਤਿਆ ਗਿਆ।',
  },
];

export const TranslatorView: React.FC = () => {
  const { activeCase, ingestIntelligence, addAuditLog } = useIntelligence();
  const { canImportIntel } = useAuth();

  const [sourceText, setSourceText] = useState(sampleTranslationBriefs[0].text);
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [preservedIdentifiers, setPreservedIdentifiers] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIngestingTranslation, setIsIngestingTranslation] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const languages = [
    { code: 'auto', name: 'Auto-Detect Language' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'ur', name: 'Urdu (اردو)' }
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setErrorMsg(null);
    setIngestSuccess(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}: Translation failed`);
      }

      const data = await response.json();
      setTranslatedText(data.translatedText || '');
      setDetectedLang(data.detectedSourceLang || null);
      setPreservedIdentifiers(data.preservedIdentifiers || []);

      addAuditLog(
        'MULTILINGUAL_TRANSLATION',
        `${data.detectedSourceLang || sourceLang} -> ${targetLang}`,
        'AUTHORIZED',
        `Translated ${sourceText.length} characters with ${data.preservedIdentifiers?.length || 0} preserved identifiers.`
      );
    } catch (err: any) {
      console.warn('Fallback translation error:', err);
      // Fallback: rule-based identifier extraction
      const ids = sourceText.match(/\+91\s?[6-9]\d{4}[\s-]?\d{5}|[A-Z]{2}\d{2}\s?[A-Z]{1,2}\s?\d{4}|₹[\d,]+|HDFC\d+|NDPS-\d+\/\d+|\d{2}-\w{3}-\d{4}/g) || [];
      setTranslatedText(`[Offline Translation Preview]: ${sourceText}`);
      setPreservedIdentifiers(Array.from(new Set(ids)));
      setErrorMsg(err.message || 'Server AI translation was unavailable; generated offline preview.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExtractIntoGraph = async () => {
    if (!translatedText && !sourceText) return;
    setIsIngestingTranslation(true);
    setIngestSuccess(null);

    try {
      const payloadText = `${sourceText}\n\n[ENGLISH TRANSLATION]:\n${translatedText}`;
      const result = await ingestIntelligence({
        fileName: `translated_intel_${Date.now().toString().slice(-4)}.txt`,
        fileType: 'TXT',
        rawText: payloadText,
      });

      setIngestSuccess(`Successfully extracted ${result.entitiesCount} entities and ${result.relationshipsCount} links into Case ${activeCase.caseNumber}!`);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to extract translated intelligence into graph.');
    } finally {
      setIsIngestingTranslation(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <Languages className="w-6 h-6 text-cyan-400" />
              <span>CHAKRA Multilingual Intelligence Translator</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Preserves legal identifiers, phone numbers, vehicle registrations, currency amounts, and timestamps.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              ACTIVE CASE: {activeCase.caseNumber}
            </span>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="mb-6 bg-[#141418] border border-white/5 rounded-xl p-3.5">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Real Investigation Intelligence Sample:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {sampleTranslationBriefs.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSourceText(sample.text);
                  setSourceLang(sample.sourceLang);
                  setTargetLang(sample.targetLang);
                  setTranslatedText('');
                  setPreservedIdentifiers([]);
                  setIngestSuccess(null);
                }}
                className="text-left p-2.5 bg-[#0F0F12] hover:bg-white/5 border border-white/5 hover:border-cyan-500/30 rounded-lg transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-white font-mono">{sample.title}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 line-clamp-1">{sample.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Translation Box */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-2xl font-mono space-y-6">
          {/* Language Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/10 text-xs">
            <div>
              <label className="text-slate-400 block mb-1.5">Source Language</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1.5">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {languages.filter(l => l.code !== 'auto').map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Input / Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="text-slate-400">Original Intelligence Note / Intercept</label>
                <span className="text-slate-500 text-[10px]">{sourceText.length} chars</span>
              </div>
              <textarea
                rows={7}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste regional language intelligence brief, FIR, or wiretap transcript..."
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <div className="flex items-center space-x-2">
                  <label className="text-slate-400">Translated Result</label>
                  {detectedLang && (
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                      Detected: {detectedLang}
                    </span>
                  )}
                </div>
                {translatedText && (
                  <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <div className="w-full bg-[#1A1A1F] border border-white/10 rounded-lg p-3 text-xs text-cyan-300 h-[152px] overflow-y-auto font-sans leading-relaxed">
                {isTranslating ? (
                  <div className="flex items-center justify-center h-full space-x-2 text-slate-400">
                    <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Processing translation with entity preservation...</span>
                  </div>
                ) : (
                  translatedText || <span className="text-slate-600">Click "TRANSLATE TEXT" to process through Gemini.</span>
                )}
              </div>
            </div>
          </div>

          {/* Preserved Identifiers Pill Tray */}
          {preservedIdentifiers.length > 0 && (
            <div className="bg-[#141418] border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-emerald-400 uppercase font-bold mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Preserved Alphanumeric & Law Enforcement Identifiers ({preservedIdentifiers.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preservedIdentifiers.map((id, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#0A0A0B] border border-white/10 rounded text-[11px] text-slate-200 font-mono">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {ingestSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{ingestSuccess}</span>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 gap-3">
            <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Zero data corruption: phone numbers, license plates, and timestamps remain verbatim.</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {translatedText && canImportIntel && (
                <button
                  type="button"
                  disabled={isIngestingTranslation}
                  onClick={handleExtractIntoGraph}
                  className="px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isIngestingTranslation ? 'EXTRACTING...' : 'EXTRACT INTEL INTO GRAPH'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 cursor-pointer font-mono"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTranslating ? 'TRANSLATING...' : 'TRANSLATE TEXT'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
