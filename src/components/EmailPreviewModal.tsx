import { X, Mail, CheckCircle2, Printer, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { DispatchedEmail } from '../lib/emailService';

interface EmailPreviewModalProps {
  email: DispatchedEmail | null;
  onClose: () => void;
}

export default function EmailPreviewModal({ email, onClose }: EmailPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!email) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(email.htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(email.htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#180e08] border border-orange-500/50 shadow-2xl overflow-hidden">
        
        {/* Email Header */}
        <div className="p-4 sm:p-5 bg-[#20110a] border-b border-amber-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Dispatched to Registrant</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-stone-400 border border-amber-950">
                  {email.id}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-display font-bold text-white mt-0.5 truncate max-w-md">
                {email.subject}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#2a170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Email HTML"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-orange-400" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#2a170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print / Save E-Ticket"
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recipient & Metadata bar */}
        <div className="px-5 py-2.5 bg-[#140a05] border-b border-amber-950/70 text-xs text-stone-400 flex flex-wrap items-center justify-between gap-2">
          <div>
            To: <strong className="text-stone-200">{email.recipientName}</strong> &lt;{email.recipientEmail}&gt;
          </div>
          <div>
            Sent at: <span className="text-stone-300">{email.sentAt}</span>
          </div>
        </div>

        {/* Rendered Email Body (Iframe preview for clean styling) */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0d0704]">
          <div className="max-w-2xl mx-auto rounded-xl overflow-hidden border border-amber-950 shadow-lg">
            <iframe
              srcDoc={email.htmlContent}
              title="Dispatched Email Preview"
              className="w-full h-[520px] bg-[#1a0f0a] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#160b06] border-t border-amber-950/80 text-center text-xs text-stone-400">
          This automated confirmation receipt has been recorded in the Firebase cloud database.
        </div>

      </div>
    </div>
  );
}
