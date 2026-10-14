import React, { useState, useRef } from 'react';
import { Database, Upload, CheckCircle2, Cpu, FileText, AlertCircle, Sparkles, Table, ArrowRight, ShieldCheck } from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';
import { sampleIntelligencePacks } from '../utils/fileParser';
import { useAuth } from '../context/AuthContext';

interface DataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResolution?: () => void;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({ isOpen, onClose, onOpenResolution }) => {
  const { ingestIntelligence, activeCase, aiBackendEnabled } = useIntelligence();
  const { canImportIntel } = useAuth();

  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    fileType: 'CSV' | 'JSON' | 'TXT';
    rawText: string;
    sizeBytes: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [ingestionResult, setIngestionResult] = useState<{
    entitiesCount: number;
    relationshipsCount: number;
    summary: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toUpperCase() || 'TXT';
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSelectedFile({
        fileName: file.name,
        fileType: (fileExt === 'CSV' || fileExt === 'JSON' ? fileExt : 'TXT') as any,
        rawText: text,
        sizeBytes: file.size,
      });
      setErrorMessage(null);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toUpperCase() || 'TXT';
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSelectedFile({
        fileName: file.name,
        fileType: (fileExt === 'CSV' || fileExt === 'JSON' ? fileExt : 'TXT') as any,
        rawText: text,
        sizeBytes: file.size,
      });
      setErrorMessage(null);
    };

    reader.readAsText(file);
  };

  const handleSelectSample = (pack: typeof sampleIntelligencePacks[0]) => {
    setSelectedFile({
      fileName: pack.fileName,
      fileType: pack.fileType as any,
      rawText: pack.content,
      sizeBytes: new Blob([pack.content]).size,
    });
    setErrorMessage(null);
  };

  const handleExecuteIngestion = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus('Transmitting payload to CHAKRA AI Entity Extraction Engine...');

    try {
      setProcessingStatus('Extracting criminal entities, telecom identifiers, and relationship edges...');
      const result = await ingestIntelligence({
        fileName: selectedFile.fileName,
        fileType: selectedFile.fileType,
        rawText: selectedFile.rawText,
      });

      setIngestionResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete intelligence ingestion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetModal = () => {
    setSelectedFile(null);
    setIngestionResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-bold text-white tracking-wide">
                  INTELLIGENCE DATA INGESTION
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {activeCase.caseNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Heterogeneous feed parser: CDR logs, Hawala ledgers, police FIRs, surveillance memos
              </p>
            </div>
          </div>
          <button 
            onClick={() => { handleResetModal(); onClose(); }} 
            className="text-slate-500 hover:text-white p-1 rounded transition-colors text-xs font-mono"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {!canImportIntel && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center space-x-3 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Your current user role has Read-Only permissions. Switch officer role to Lead Investigator or Administrator to import intelligence.</span>
            </div>
          )}

          {!ingestionResult && !isProcessing && (
            <>
              {/* File Upload Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-white/10 hover:border-cyan-500/40 bg-[#1A1A1F]/50 hover:bg-[#1A1A1F]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.json,.txt,.log"
                  className="hidden"
                />
                <Upload className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-cyan-400' : 'text-slate-500'}`} />
                {selectedFile ? (
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center justify-center space-x-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>{selectedFile.fileName}</span>
                    </div>
                    <p className="text-xs text-cyan-400/80 font-mono mt-1">
                      {selectedFile.fileType} format · {(selectedFile.sizeBytes / 1024).toFixed(1)} KB · Ready for extraction
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      Drag & drop intelligence file, or <span className="text-cyan-400 underline">browse files</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      Accepts CSV (CDR logs, Bank exports), JSON (Ledgers), TXT/LOG (Surveillance memos)
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Intelligence Packs for 1-Click Demonstration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Quick-Load Synthetic Intelligence Packs (Demo):</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {sampleIntelligencePacks.map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => handleSelectSample(pack)}
                      className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                        selectedFile?.fileName === pack.fileName
                          ? 'bg-cyan-500/10 border-cyan-500 text-white'
                          : 'bg-[#141418] border-white/5 text-slate-300 hover:bg-[#1A1A1F] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-cyan-400 font-bold">
                          {pack.fileType}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 line-clamp-1">{pack.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{pack.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview of text payload */}
              {selectedFile && (
                <div className="bg-[#141418] border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/5 mb-2">
                    <span>RAW PAYLOAD PREVIEW ({selectedFile.fileName})</span>
                    <span>{selectedFile.rawText.split('\n').length} lines</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto bg-[#0A0A0B] p-2.5 rounded border border-white/5">
                    {selectedFile.rawText.slice(0, 1000)}
                    {selectedFile.rawText.length > 1000 && '\n... [content truncated for preview]'}
                  </pre>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-300 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                <Cpu className="w-7 h-7 text-cyan-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">PROCESSING INTELLIGENCE INGESTION</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{processingStatus}</p>
              </div>
              <div className="w-full bg-[#1A1A1F] h-1.5 rounded-full overflow-hidden max-w-sm mx-auto">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}

          {/* Complete Ingestion Summary */}
          {ingestionResult && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-300 font-mono">
                    INTELLIGENCE INGESTION COMPLETED
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    {ingestionResult.summary}
                  </p>
                </div>
              </div>

              {/* Extraction Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#141418] border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-mono font-bold text-cyan-400">{ingestionResult.entitiesCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">New Entities</div>
                </div>
                <div className="bg-[#141418] border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-mono font-bold text-purple-400">{ingestionResult.relationshipsCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">New Links</div>
                </div>
                <div className="bg-[#141418] border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-mono font-bold text-amber-400">100%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Audit Logged</div>
                </div>
                <div className="bg-[#141418] border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-mono font-bold text-emerald-400">Verified</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Provenance</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
          {!ingestionResult ? (
            <>
              <button
                type="button"
                onClick={() => { handleResetModal(); onClose(); }}
                className="px-4 py-2 bg-[#1A1A1F] hover:bg-white/5 text-slate-300 rounded-lg text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isProcessing || !canImportIntel}
                onClick={handleExecuteIngestion}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-lg text-xs font-mono transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PARSE & INGEST INTEL</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-end space-x-3">
              {onOpenResolution && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResolution();
                  }}
                  className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold rounded-lg text-xs font-mono transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>REVIEW CANDIDATES</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  handleResetModal();
                  onClose();
                }}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs font-mono transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <span>VIEW IN LINK GRAPH</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
