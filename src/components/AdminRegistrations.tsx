import { useMemo, useState } from 'react';
import {
  Users,
  GraduationCap,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  Layers,
  CheckCheck,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { CompetitionModule, TeamRegistrationData, AmbassadorRegistrationData } from '../types';
import { getModuleIcon } from './Navbar';

type RegistrationItem = TeamRegistrationData | AmbassadorRegistrationData;

interface AdminRegistrationsProps {
  registrations: RegistrationItem[];
  modules: CompetitionModule[];
  onUpdateStatus: (id: string, status: string) => void;
  onResendEmail: (id: string) => void;
  onInspect: (item: RegistrationItem) => void;
  onExportCSV: () => void;
  onClearAll: () => void;
  isClearing: boolean;
}

const STATUS_OPTIONS = ['Pending Review', 'Verified', 'Approved', 'Rejected'];

const STATUS_STYLES: Record<string, string> = {
  Approved: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  Verified: 'bg-blue-950 text-blue-300 border-blue-800',
  Shortlisted: 'bg-blue-950 text-blue-300 border-blue-800',
  Selected: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  Rejected: 'bg-red-950 text-red-300 border-red-800',
  'Pending Review': 'bg-amber-950 text-amber-300 border-amber-800'
};

export function getRegistrationName(item: RegistrationItem) {
  return item.type === 'team' ? (item as TeamRegistrationData).teamName : (item as AmbassadorRegistrationData).fullName;
}

export function getRegistrationInstitution(item: RegistrationItem) {
  return item.type === 'team' ? (item as TeamRegistrationData).leader.university : (item as AmbassadorRegistrationData).university;
}

export function getRegistrationEmail(item: RegistrationItem) {
  return item.type === 'team' ? (item as TeamRegistrationData).leader.email : (item as AmbassadorRegistrationData).email;
}

export function getRegistrationPhone(item: RegistrationItem) {
  return item.type === 'team' ? (item as TeamRegistrationData).leader.phone : (item as AmbassadorRegistrationData).phone;
}

function normalizeInstitution(value: string) {
  const trimmed = (value || '').trim().replace(/\s+/g, ' ');
  return trimmed || 'Not specified';
}

export default function AdminRegistrations({
  registrations,
  modules,
  onUpdateStatus,
  onResendEmail,
  onInspect,
  onExportCSV,
  onClearAll,
  isClearing
}: AdminRegistrationsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  /* ------------------------------------------------------------------ *
   * Analytics: how many registrations arrived, split by module and by
   * institution, plus what still needs an organizer's approval.
   * ------------------------------------------------------------------ */
  const analysis = useMemo(() => {
    const moduleRows = modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      shortTitle: mod.shortTitle,
      iconName: mod.iconName,
      teams: 0,
      participants: 0,
      pending: 0,
      approved: 0
    }));
    const moduleIndex = new Map(moduleRows.map(row => [row.id, row]));

    const universities = new Map<string, {
      name: string;
      teams: number;
      ambassadors: number;
      participants: number;
      modules: Set<string>;
    }>();

    const touchUniversity = (rawName: string) => {
      const name = normalizeInstitution(rawName);
      const key = name.toLowerCase();
      if (!universities.has(key)) {
        universities.set(key, { name, teams: 0, ambassadors: 0, participants: 0, modules: new Set() });
      }
      return universities.get(key)!;
    };

    let teams = 0;
    let ambassadors = 0;
    let approved = 0;
    let rejected = 0;
    let pending = 0;
    let participants = 0;

    registrations.forEach(item => {
      const isApproved = item.status === 'Approved' || item.status === 'Selected';
      const isRejected = item.status === 'Rejected';
      if (isApproved) approved += 1;
      else if (isRejected) rejected += 1;
      else pending += 1;

      if (item.type === 'team') {
        const team = item as TeamRegistrationData;
        teams += 1;
        participants += 1 + (team.members?.length || 0);

        const leaderUni = touchUniversity(team.leader.university);
        leaderUni.teams += 1;
        leaderUni.participants += 1;

        (team.members || []).forEach(member => {
          const memberUni = touchUniversity(member.university);
          memberUni.participants += 1;
        });

        (team.selectedModules || []).forEach(moduleId => {
          const row = moduleIndex.get(moduleId);
          const uniKey = leaderUni.name.toLowerCase();
          if (row) {
            row.teams += 1;
            row.participants += 1 + (team.members?.length || 0);
            if (isApproved) row.approved += 1;
            else if (!isRejected) row.pending += 1;
          }
          leaderUni.modules.add(moduleId);
          const uniRow = universities.get(uniKey);
          if (uniRow) uniRow.modules.add(moduleId);
        });
      } else {
        const ambassador = item as AmbassadorRegistrationData;
        ambassadors += 1;
        participants += 1;
        const uni = touchUniversity(ambassador.university);
        uni.ambassadors += 1;
        uni.participants += 1;
      }
    });

    const universityRows = Array.from(universities.values())
      .sort((a, b) => (b.teams + b.ambassadors) - (a.teams + a.ambassadors) || a.name.localeCompare(b.name));

    return {
      moduleRows,
      universityRows,
      totals: {
        all: registrations.length,
        teams,
        ambassadors,
        participants,
        approved,
        rejected,
        pending
      }
    };
  }, [registrations, modules]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return registrations.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      if (universityFilter !== 'all' && normalizeInstitution(getRegistrationInstitution(item)).toLowerCase() !== universityFilter) {
        return false;
      }

      if (moduleFilter === 'ambassador' && item.type !== 'ambassador') return false;
      if (moduleFilter !== 'all' && moduleFilter !== 'ambassador') {
        if (item.type !== 'team') return false;
        if (!(item as TeamRegistrationData).selectedModules.includes(moduleFilter)) return false;
      }

      if (!q) return true;
      const haystack = [
        getRegistrationName(item),
        getRegistrationEmail(item),
        getRegistrationPhone(item),
        getRegistrationInstitution(item),
        item.id,
        item.type === 'team' ? (item as TeamRegistrationData).leader.fullName : '',
        item.type === 'team' ? (item as TeamRegistrationData).leader.city : (item as AmbassadorRegistrationData).city
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [registrations, searchQuery, moduleFilter, universityFilter, statusFilter]);

  const pendingItems = filtered.filter(item => item.status !== 'Approved' && item.status !== 'Rejected' && item.status !== 'Selected');
  const decidedItems = filtered.filter(item => !(item.status !== 'Approved' && item.status !== 'Rejected' && item.status !== 'Selected'));

  const activeFilterCount = [moduleFilter, universityFilter, statusFilter].filter(value => value !== 'all').length;

  const resetFilters = () => {
    setModuleFilter('all');
    setUniversityFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const approveAllPending = () => {
    if (!pendingItems.length) return;
    if (!confirm(`Approve all ${pendingItems.length} registration(s) awaiting review?`)) return;
    pendingItems.forEach(item => onUpdateStatus(item.id, 'Approved'));
  };

  const renderItem = (item: RegistrationItem) => {
    const isTeam = item.type === 'team';
    const team = item as TeamRegistrationData;
    const amb = item as AmbassadorRegistrationData;
    const modulesForTeam = isTeam
      ? team.selectedModules.map(id => modules.find(m => m.id === id)?.shortTitle || id)
      : [];

    return (
      <div
        key={item.id}
        className="p-4 rounded-2xl bg-[#190f09] border border-amber-950/80 hover:border-orange-500/40 transition-all flex flex-col gap-3"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${isTeam ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'}`}>
            {isTeam ? <Users className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-white text-base break-words">
                {isTeam ? team.teamName : amb.fullName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-orange-400 border border-amber-950">
                {item.id}
              </span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[item.status] || 'bg-stone-900 text-stone-300 border-stone-700'}`}>
                {item.status}
              </span>
            </div>

            <div className="text-xs text-stone-400 mt-1.5 flex items-center gap-x-3 gap-y-1 flex-wrap">
              <span className="break-all">Contact: <strong className="text-stone-200">{getRegistrationEmail(item)}</strong> ({getRegistrationPhone(item)})</span>
              <span className="break-words">Inst: <strong className="text-stone-300">{getRegistrationInstitution(item)}</strong></span>
              {isTeam && (
                <span className="text-orange-400 font-semibold">{team.memberCount} Members</span>
              )}
              {isTeam && modulesForTeam.length > 0 && (
                <span className="text-stone-300">Modules: <strong className="text-orange-300">{modulesForTeam.join(', ')}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {(item.status !== 'Approved' && item.status !== 'Selected') && (
            <button
              onClick={() => onUpdateStatus(item.id, 'Approved')}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-xs font-semibold text-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approve</span>
            </button>
          )}

          {(item.status !== 'Rejected') && (
            <button
              onClick={() => onUpdateStatus(item.id, 'Rejected')}
              className="px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800/60 text-xs font-semibold text-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Reject</span>
            </button>
          )}

          <button
            onClick={() => onResendEmail(item.id)}
            className="px-3 py-1.5 rounded-xl bg-orange-950/80 hover:bg-orange-900 border border-orange-700/60 text-xs font-semibold text-orange-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Resend official confirmation email to candidate"
          >
            <Send className="w-3.5 h-3.5 text-orange-400" />
            <span>Resend Email</span>
          </button>

          <button
            onClick={() => onInspect(item)}
            className="px-3 py-1.5 rounded-xl bg-[#27150c] hover:bg-[#341d11] border border-amber-800/50 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-orange-400" />
            <span>Dossier</span>
          </button>

          <select
            value={item.status}
            onChange={(e) => onUpdateStatus(item.id, e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#140a05] border border-amber-950 text-xs text-stone-300 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option === 'Pending Review' ? 'Pending' : option}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold uppercase text-white">
            Registration Overview &amp; Approvals
          </h3>
          <p className="text-xs text-stone-400">
            Every entry that arrived in the cloud database, split by module and institution. Approval is required before a team is confirmed.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onExportCSV}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#28150c] hover:bg-[#361c10] border border-amber-800/60 text-xs font-bold text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearAll}
            disabled={isClearing}
            className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/50 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isClearing ? 'Clearing…' : 'Clear Database'}</span>
            <span className="sm:hidden">{isClearing ? '…' : 'Clear'}</span>
          </button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { label: 'Total Registrations', value: analysis.totals.all, accent: 'text-white', Icon: Layers },
          { label: 'Teams', value: analysis.totals.teams, accent: 'text-orange-400', Icon: Users },
          { label: 'Ambassadors', value: analysis.totals.ambassadors, accent: 'text-amber-400', Icon: GraduationCap },
          { label: 'Awaiting Approval', value: analysis.totals.pending, accent: 'text-amber-300', Icon: Clock },
          { label: 'Approved', value: analysis.totals.approved, accent: 'text-emerald-400', Icon: CheckCircle2 }
        ].map(({ label, value, accent, Icon }) => (
          <div key={label} className="p-4 rounded-2xl bg-[#170e08] border border-amber-950/80">
            <div className="flex items-center gap-2 text-stone-400">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className={`mt-1.5 font-display text-2xl sm:text-3xl font-black ${accent}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Pending approval queue */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1108] border border-amber-700/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-sm sm:text-base">
                Awaiting Admin Approval
              </h4>
              <p className="text-xs text-stone-400">
                {analysis.totals.pending === 0
                  ? 'Nothing pending — every registration has been reviewed.'
                  : `${analysis.totals.pending} registration(s) still need an approval decision.`}
              </p>
            </div>
          </div>

          {analysis.totals.pending > 0 && (
            <button
              onClick={approveAllPending}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Approve All Pending ({analysis.totals.pending})</span>
            </button>
          )}
        </div>

        {pendingItems.length > 0 && (
          <div className="space-y-3">
            {pendingItems.slice(0, 6).map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-[#140b06] border border-amber-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white break-words">{getRegistrationName(item)}</div>
                  <div className="text-[11px] text-stone-400 break-words">
                    {item.type === 'team' ? 'Team' : 'Ambassador'} • {getRegistrationInstitution(item)} • {getRegistrationEmail(item)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateStatus(item.id, 'Approved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-xs font-bold text-emerald-200 cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onUpdateStatus(item.id, 'Rejected')}
                    className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-800/60 text-xs font-bold text-red-200 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingItems.length > 6 && (
              <p className="text-[11px] text-stone-500">
                …and {pendingItems.length - 6} more — use the roster below for the full list.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Breakdown by module and university */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* By module */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#170e08] border border-amber-950/80">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-orange-400" />
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Registrations by Module
            </h4>
          </div>

          <div className="space-y-2.5">
            {analysis.moduleRows.map(row => (
              <button
                key={row.id}
                onClick={() => {
                  setModuleFilter(moduleFilter === row.id ? 'all' : row.id);
                  setUniversityFilter('all');
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  moduleFilter === row.id
                    ? 'bg-[#29160c] border-orange-500/70'
                    : 'bg-[#140b06] border-amber-950/70 hover:border-amber-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[#22130b] border border-amber-900/40 shrink-0">
                      {getModuleIcon(row.iconName, 'w-3.5 h-3.5')}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-stone-200 truncate">
                      {row.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-orange-950/80 border border-orange-800/60 text-[11px] font-bold text-orange-300">
                      {row.teams} {row.teams === 1 ? 'team' : 'teams'}
                    </span>
                    {row.pending > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/60 text-[11px] font-bold text-amber-300">
                        {row.pending} pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1.5 text-[11px] text-stone-400">
                  {row.participants} participant(s) • {row.approved} approved
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setModuleFilter(moduleFilter === 'ambassador' ? 'all' : 'ambassador')}
            className={`w-full mt-3 text-left p-3 rounded-xl border transition-all cursor-pointer ${
              moduleFilter === 'ambassador'
                ? 'bg-[#29160c] border-orange-500/70'
                : 'bg-[#140b06] border-amber-950/70 hover:border-amber-800/80'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#22130b] border border-amber-900/40 shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-stone-200">Campus Ambassadors</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/60 text-[11px] font-bold text-amber-300">
                {analysis.totals.ambassadors}
              </span>
            </div>
          </button>
        </div>

        {/* By university */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#170e08] border border-amber-950/80">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
                Institutions Participating
              </h4>
            </div>
            <span className="text-[11px] font-bold text-stone-400">
              {analysis.universityRows.length} total
            </span>
          </div>

          {analysis.universityRows.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">No institutions recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {analysis.universityRows.map(uni => {
                const moduleLabels = Array.from(uni.modules)
                  .map(id => modules.find(m => m.id === id)?.shortTitle || id)
                  .join(', ');

                return (
                  <button
                    key={uni.name}
                    onClick={() => {
                      setUniversityFilter(universityFilter === uni.name.toLowerCase() ? 'all' : uni.name.toLowerCase());
                      setModuleFilter('all');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      universityFilter === uni.name.toLowerCase()
                        ? 'bg-[#29160c] border-orange-500/70'
                        : 'bg-[#140b06] border-amber-950/70 hover:border-amber-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs sm:text-sm font-semibold text-stone-200 break-words min-w-0">
                        {uni.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {uni.teams > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-950/80 border border-orange-800/60 text-[11px] font-bold text-orange-300">
                            {uni.teams}T
                          </span>
                        )}
                        {uni.ambassadors > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/60 text-[11px] font-bold text-amber-300">
                            {uni.ambassadors}A
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-stone-400 break-words">
                      {uni.participants} participant(s)
                      {moduleLabels ? ` • ${moduleLabels}` : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-[#140b06] rounded-2xl border border-amber-950/70 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, leader, email, phone, university or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Modules &amp; Roles</option>
              <option value="ambassador">Campus Ambassadors</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.shortTitle}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all">All Universities &amp; Colleges</option>
            {analysis.universityRows.map(uni => (
              <option key={uni.name} value={uni.name.toLowerCase()}>{uni.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all">Any Status</option>
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option === 'Pending Review' ? 'Pending Review' : option}</option>
            ))}
          </select>

          {activeFilterCount > 0 || searchQuery ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-[#28150c] hover:bg-[#361c10] border border-amber-800/60 text-xs font-bold text-stone-200 cursor-pointer"
            >
              Reset Filters
            </button>
          ) : null}
        </div>

        <p className="text-[11px] text-stone-500">
          Showing <strong className="text-stone-300">{filtered.length}</strong> of {registrations.length} registration(s).
        </p>
      </div>

      {/* Roster */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400 bg-[#160c07] rounded-2xl border border-amber-950">
            <AlertTriangle className="w-6 h-6 text-amber-500/70 mx-auto mb-2" />
            <p className="text-sm">
              {registrations.length === 0
                ? 'No registrations recorded yet.'
                : 'No registrations match your search criteria.'}
            </p>
          </div>
        ) : (
          <>
            {pendingItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Pending Review ({pendingItems.length})
                </h4>
                {pendingItems.map(renderItem)}
              </div>
            )}

            {decidedItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Reviewed ({decidedItems.length})
                </h4>
                {decidedItems.map(renderItem)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
