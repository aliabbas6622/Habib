import { useState } from 'react';
import { 
  X, 
  Search, 
  Download, 
  Trash2, 
  Users, 
  Eye, 
  GraduationCap, 
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';
import { TeamRegistrationData, AmbassadorRegistrationData } from '../types';
import { COMPETITION_MODULES } from '../data/modulesData';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: (TeamRegistrationData | AmbassadorRegistrationData)[];
  onUpdateStatus: (id: string, newStatus: string) => void;
  onClearRegistrations: () => void;
}

export default function AdminPortalModal({
  isOpen,
  onClose,
  registrations,
  onUpdateStatus,
  onClearRegistrations
}: AdminPortalModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterModule, setSelectedFilterModule] = useState<string>('all');
  const [viewingDetailItem, setViewingDetailItem] = useState<TeamRegistrationData | AmbassadorRegistrationData | null>(null);

  if (!isOpen) return null;

  const filteredItems = registrations.filter(item => {
    const matchesSearch = 
      (item.type === 'team' && (item as TeamRegistrationData).teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === 'team' && (item as TeamRegistrationData).leader.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === 'ambassador' && (item as AmbassadorRegistrationData).fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilterModule === 'all') return true;
    if (selectedFilterModule === 'ambassador') return item.type === 'ambassador';
    if (item.type === 'team') {
      return (item as TeamRegistrationData).selectedModules.includes(selectedFilterModule);
    }
    return false;
  });

  const exportCSV = () => {
    const headers = ['Reg ID', 'Type', 'Team / Applicant Name', 'Modules / Role', 'Leader / Candidate', 'Phone', 'Email', 'University', 'City', 'Status', 'Timestamp'];
    const rows = registrations.map(item => {
      if (item.type === 'team') {
        const t = item as TeamRegistrationData;
        return [
          t.id,
          'Team',
          `"${t.teamName}"`,
          `"${t.selectedModules.join('; ')}"`,
          `"${t.leader.fullName}"`,
          `"${t.leader.phone}"`,
          `"${t.leader.email}"`,
          `"${t.leader.university}"`,
          `"${t.leader.city}"`,
          t.status,
          t.timestamp
        ].join(',');
      } else {
        const a = item as AmbassadorRegistrationData;
        return [
          a.id,
          'Ambassador',
          `"${a.fullName}"`,
          '"Campus Ambassador"',
          `"${a.fullName}"`,
          `"${a.phone}"`,
          `"${a.email}"`,
          `"${a.university}"`,
          `"${a.city}"`,
          a.status,
          a.timestamp
        ].join(',');
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HURC_2026_Registrations_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-[#180e08] border border-amber-900/60 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-amber-950/80 flex items-center justify-between bg-[#1f110a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                HURC 2026 Organizing Admin Portal
              </h2>
              <p className="text-xs text-stone-400">
                Total Registrations: <span className="text-orange-400 font-bold">{registrations.length}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#29170e] hover:bg-[#341d12] border border-amber-800/60 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-[#140b06] border-b border-amber-950/70 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team name, leader, university, or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedFilterModule}
              onChange={(e) => setSelectedFilterModule(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Modules &amp; Roles</option>
              <option value="ambassador">Campus Ambassadors</option>
              {COMPETITION_MODULES.map((m) => (
                <option key={m.id} value={m.id}>{m.shortTitle}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Body: Registrations List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-sm">No registrations match your search filter.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isTeam = item.type === 'team';
              const team = item as TeamRegistrationData;
              const amb = item as AmbassadorRegistrationData;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#1d110a] border border-amber-950/80 hover:border-orange-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl mt-0.5 ${isTeam ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'}`}>
                      {isTeam ? <Users className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-white text-base">
                          {isTeam ? team.teamName : amb.fullName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-orange-400 border border-orange-950">
                          {item.id}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          item.status === 'Verified' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="text-xs text-stone-400 mt-1 flex items-center gap-3 flex-wrap">
                        <span>Leader: <strong className="text-stone-300">{isTeam ? team.leader.fullName : amb.fullName}</strong></span>
                        <span>•</span>
                        <span>Inst: <strong className="text-stone-300">{isTeam ? team.leader.university : amb.university}</strong></span>
                        <span>•</span>
                        <span>City: <strong className="text-stone-300">{isTeam ? team.leader.city : amb.city}</strong></span>
                        {isTeam && (
                          <>
                            <span>•</span>
                            <span className="text-orange-400 font-semibold">{team.memberCount} Members</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setViewingDetailItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-[#27150c] hover:bg-[#341d11] border border-amber-800/50 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-400" />
                      <span>View Dossier</span>
                    </button>

                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#140a05] border border-amber-950 text-xs text-stone-300 focus:outline-none focus:border-orange-500"
                    >
                      <option value="Pending Review">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#140b06] border-t border-amber-950/80 flex items-center justify-between text-xs text-stone-400">
          <span>Habib University Robotics Competition • Secure Local Admin Storage</span>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear stored registrations?')) {
                onClearRegistrations();
              }
            }}
            className="text-stone-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>

      </div>

      {/* DETAILED DOSSIER MODAL */}
      {viewingDetailItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1b1009] border border-orange-500/50 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-950/80 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  Registration Dossier #{viewingDetailItem.id}
                </span>
                <h3 className="font-display text-2xl font-black text-white">
                  {viewingDetailItem.type === 'team'
                    ? (viewingDetailItem as TeamRegistrationData).teamName
                    : (viewingDetailItem as AmbassadorRegistrationData).fullName}
                </h3>
              </div>
              <button
                onClick={() => setViewingDetailItem(null)}
                className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingDetailItem.type === 'team' ? (
              <div className="space-y-4 text-xs">
                {/* Modules */}
                <div className="p-3 rounded-xl bg-[#140b06] border border-amber-950/60">
                  <span className="text-stone-400 uppercase font-semibold block mb-1">Registered Modules</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(viewingDetailItem as TeamRegistrationData).selectedModules.map(m => (
                      <span key={m} className="px-2 py-1 rounded bg-orange-950/70 border border-orange-800 text-orange-300 font-bold">
                        {COMPETITION_MODULES.find(mod => mod.id === m)?.title || m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Leader Info */}
                <div className="p-4 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-2">
                  <span className="text-orange-400 font-bold uppercase block border-b border-amber-950 pb-1">
                    Team Leader
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-stone-300">
                    <div>Name: <strong className="text-white">{(viewingDetailItem as TeamRegistrationData).leader.fullName}</strong></div>
                    <div>Father: <strong>{(viewingDetailItem as TeamRegistrationData).leader.fatherName}</strong></div>
                    <div>CNIC: <strong>{(viewingDetailItem as TeamRegistrationData).leader.cnic}</strong></div>
                    <div>Gender: <strong>{(viewingDetailItem as TeamRegistrationData).leader.gender}</strong></div>
                    <div>Email: <strong>{(viewingDetailItem as TeamRegistrationData).leader.email}</strong></div>
                    <div>Phone: <strong>{(viewingDetailItem as TeamRegistrationData).leader.phone}</strong></div>
                    <div>WhatsApp: <strong>{(viewingDetailItem as TeamRegistrationData).leader.whatsapp}</strong></div>
                    <div>City: <strong>{(viewingDetailItem as TeamRegistrationData).leader.city}</strong></div>
                    <div>Institute: <strong>{(viewingDetailItem as TeamRegistrationData).leader.university}</strong></div>
                    <div>Degree: <strong>{(viewingDetailItem as TeamRegistrationData).leader.degree} ({(viewingDetailItem as TeamRegistrationData).leader.semester})</strong></div>
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <span className="text-stone-400 uppercase font-semibold block">
                    Team Members ({(viewingDetailItem as TeamRegistrationData).members.length})
                  </span>
                  {(viewingDetailItem as TeamRegistrationData).members.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-1">
                      <div className="font-bold text-orange-400">#{idx + 2} {m.fullName} ({m.gender})</div>
                      <div className="text-stone-400 grid grid-cols-2 gap-1 text-[11px]">
                        <div>Father: {m.fatherName}</div>
                        <div>CNIC: {m.cnic}</div>
                        <div>University: {m.university}</div>
                        <div>Program: {m.degree} - {m.semester}</div>
                        <div>City: {m.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-2">
                  <span className="text-orange-400 font-bold uppercase block border-b border-amber-950 pb-1">
                    Ambassador Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-stone-300">
                    <div>Name: <strong className="text-white">{(viewingDetailItem as AmbassadorRegistrationData).fullName}</strong></div>
                    <div>CNIC: <strong>{(viewingDetailItem as AmbassadorRegistrationData).cnic}</strong></div>
                    <div>Email: <strong>{(viewingDetailItem as AmbassadorRegistrationData).email}</strong></div>
                    <div>Phone: <strong>{(viewingDetailItem as AmbassadorRegistrationData).phone}</strong></div>
                    <div>University: <strong>{(viewingDetailItem as AmbassadorRegistrationData).university}</strong></div>
                    <div>Program: <strong>{(viewingDetailItem as AmbassadorRegistrationData).degree}</strong></div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-950">
                    <span className="text-stone-400 font-semibold block">Motivation &amp; Strategy:</span>
                    <p className="text-stone-200 mt-1 italic">{(viewingDetailItem as AmbassadorRegistrationData).motivation}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => setViewingDetailItem(null)}
                className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
