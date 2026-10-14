import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CHAKRA ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 bg-[#0A0A0B] p-8 flex items-center justify-center min-h-[400px]">
          <div className="bg-[#0F0F12] border border-red-500/30 rounded-xl p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {this.props.fallbackTitle || 'Investigation View Error'}
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed">
              An unexpected rendering issue occurred in this investigation module. The system state has been preserved.
            </p>
            {this.state.error && (
              <div className="bg-[#1A1A1F] border border-white/5 rounded p-3 text-[11px] font-mono text-red-300 text-left mb-6 overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={this.handleReset}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded text-xs flex items-center space-x-2 font-mono transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recover View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
