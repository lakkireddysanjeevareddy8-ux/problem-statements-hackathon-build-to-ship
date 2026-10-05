import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast() {
  const { toastMessage, clearToast } = useSocket();

  if (!toastMessage) return null;

  const bgStyles = {
    info: 'bg-slate-900/95 border-indigo-500/50 text-indigo-200 shadow-indigo-500/10',
    success: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-500/10',
    warning: 'bg-amber-950/95 border-amber-500/50 text-amber-200 shadow-amber-500/10',
    error: 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-500/10'
  };

  const icons = {
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-in transition-all">
      <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${bgStyles[toastMessage.type] || bgStyles.info}`}>
        {icons[toastMessage.type] || icons.info}
        <div className="flex-1 text-sm font-medium leading-relaxed pr-2">
          {toastMessage.message}
        </div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
