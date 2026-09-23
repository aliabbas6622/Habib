import { useState, FormEvent, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  CheckSquare, 
  Square, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Download,
  Info,
  Mail,
  Eye,
  DollarSign
} from 'lucide-react';
import { TeamRegistrationData, AmbassadorRegistrationData } from '../types';
import { useCompetition } from '../context/CompetitionContext';
import { useAuth } from '../context/AuthContext';
import EmailPreviewModal from './EmailPreviewModal';
import { DispatchedEmail } from '../lib/emailService';

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Sukkur', 'Bahawalpur', 'Sargodha', 'Abbottabad',
  'Other'
];

interface RegistrationPageProps {
  onBackToHome: () => void;
  initialSelectedModuleId?: string;
  onSaveRegistration: (reg: TeamRegistrationData | AmbassadorRegistrationData) => void;
}

export default function RegistrationPage({
  onBackToHome,
  initialSelectedModuleId,
  onSaveRegistration
}: RegistrationPageProps) {
  const { modules, settings, saveRegistration, lastDispatchedEmail, logoUrl } = useCompetition();
  const { currentUser, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'team' | 'ambassador'>('team');
  const [submittedData, setSubmittedData] = useState<TeamRegistrationData | AmbassadorRegistrationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewEmailModal, setPreviewEmailModal] = useState<DispatchedEmail | null>(null);

  // Selected Modules
  const [selectedModules, setSelectedModules] = useState<string[]>(
    initialSelectedModuleId ? [initialSelectedModuleId] : ['robowars']
  );

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [memberCount, setMemberCount] = useState<number>(3); // 3, 4, or 5
  const [promoCode, setPromoCode] = useState('');

  // Team Leader State (Pre-filled with logged-in user if available)
  const [leaderFullName, setLeaderFullName] = useState(userProfile?.displayName || '');
  const [leaderFatherName, setLeaderFatherName] = useState('');
  const [leaderGender, setLeaderGender] = useState('Male');
  const [leaderCnic, setLeaderCnic] = useState('');
  const [leaderStudentId, setLeaderStudentId] = useState('');
  const [leaderEmail, setLeaderEmail] = useState(currentUser?.email || '');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderWhatsapp, setLeaderWhatsapp] = useState('');
  const [leaderCity, setLeaderCity] = useState('');
  const [leaderCityOther, setLeaderCityOther] = useState('');
  const [leaderUniversity, setLeaderUniversity] = useState('');
  const [leaderDegree, setLeaderDegree] = useState('');
  const [leaderSemester, setLeaderSemester] = useState('');

  useEffect(() => {
    if (currentUser?.email && !leaderEmail) {
      setLeaderEmail(currentUser.email);
    }
    if (userProfile?.displayName && !leaderFullName) {
      setLeaderFullName(userProfile.displayName);
    }
  }, [currentUser, userProfile]);

  // Additional Members State (index 0 is Member 2, index 1 is Member 3, etc.)
  const [members, setMembers] = useState([
    {
      fullName: '',
      fatherName: '',
      gender: 'Male',
      cnic: '',
      city: '',
      otherCity: '',
      university: '',
      degree: '',
      semester: ''
    },
    {
      fullName: '',
      fatherName: '',
      gender: 'Male',
      cnic: '',
      city: '',
      otherCity: '',
      university: '',
      degree: '',
      semester: ''
    },
    {
      fullName: '',
      fatherName: '',
      gender: 'Male',
      cnic: '',
      city: '',
      otherCity: '',
      university: '',
      degree: '',
      semester: ''
    },
    {
      fullName: '',
      fatherName: '',
      gender: 'Male',
      cnic: '',
      city: '',
      otherCity: '',
      university: '',
      degree: '',
      semester: ''
    }
  ]);

  // Ambassador Form State
  const [ambFullName, setAmbFullName] = useState('');
  const [ambFatherName, setAmbFatherName] = useState('');
  const [ambGender, setAmbGender] = useState('Male');
  const [ambCnic, setAmbCnic] = useState('');
  const [ambEmail, setAmbEmail] = useState('');
  const [ambPhone, setAmbPhone] = useState('');
  const [ambWhatsapp, setAmbWhatsapp] = useState('');
  const [ambCity, setAmbCity] = useState('');
  const [ambCityOther, setAmbCityOther] = useState('');
  const [ambUniversity, setAmbUniversity] = useState('');
  const [ambDegree, setAmbDegree] = useState('');
  const [ambSemester, setAmbSemester] = useState('');
  const [ambSocialLink, setAmbSocialLink] = useState('');
  const [ambMotivation, setAmbMotivation] = useState('');
  const [ambPastExperience, setAmbPastExperience] = useState('');

  // Truthfulness Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [submittedData, activeTab]);

  useEffect(() => {
    if (!submittedData) return;

    const isTeam = submittedData.type === 'team';
    const teamData = submittedData as TeamRegistrationData;
    const ambData = submittedData as AmbassadorRegistrationData;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    // ── Dark header band ────────────────────────────────────────────────────────
    doc.setFillColor(13, 7, 4);
    doc.rect(0, 0, pageW, 42, 'F');

    // Orange accent stripe
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 42, pageW, 2, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('HURC 2026', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(161, 101, 60);
    doc.text('Habib University Robotics Competition', margin, 26);

    // Badge top-right
    doc.setFillColor(234, 88, 12);
    doc.roundedRect(pageW - margin - 48, 10, 48, 12, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      isTeam ? 'TEAM REGISTRATION' : 'AMBASSADOR APPLICATION',
      pageW - margin - 24, 17.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 80, 50);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 36);

    y = 54;

    // ── Helper functions ─────────────────────────────────────────────────────────
    const addSection = (title: string) => {
      if (y > pageH - 30) { doc.addPage(); y = 20; }
      doc.setFillColor(234, 88, 12);
      doc.rect(margin, y, 4, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 15, 8);
      doc.text(title.toUpperCase(), margin + 8, y + 5.5);
      y += 13;
    };

    const addRow = (label: string, value: string) => {
      if (y > pageH - 20) { doc.addPage(); y = 20; }
      // Subtle row background
      doc.setFillColor(250, 245, 240);
      doc.rect(margin, y, contentW, 8, 'F');
      // Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(120, 80, 50);
      doc.text(label, margin + 3, y + 5.5);
      // Value
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 10, 5);
      const lines = doc.splitTextToSize(value || '—', contentW - 65);
      doc.text(lines, margin + 62, y + 5.5);
      y += 8 + (lines.length - 1) * 5;
    };

    const addDivider = () => {
      doc.setDrawColor(230, 210, 190);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
    };

    // ── Reference block ──────────────────────────────────────────────────────────
    doc.setFillColor(255, 245, 235);
    doc.roundedRect(margin, y, contentW, 16, 3, 3, 'F');
    doc.setDrawColor(234, 88, 12);
    doc.roundedRect(margin, y, contentW, 16, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(120, 80, 50);
    doc.text('REGISTRATION REFERENCE CODE', margin + 4, y + 6);

    doc.setFontSize(16);
    doc.setTextColor(234, 88, 12);
    doc.text(submittedData.id, margin + 4, y + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 80, 50);
    doc.text('Keep this code for event check-in & scrutineering.', pageW - margin - 4, y + 13.5, { align: 'right' });
    y += 22;

    // ── Content ──────────────────────────────────────────────────────────────────
    if (isTeam) {
      addSection('Team Details');
      addRow('Team Name', teamData.teamName);
      addRow('Member Count', `${teamData.memberCount} Members`);
      addRow('Timestamp', teamData.timestamp);
      addRow('Modules Selected',
        teamData.selectedModules
          .map(m => modules.find(mod => mod.id === m)?.title || m)
          .join(', ')
      );
      if (teamData.promoCode) {
        addRow('Promo Code', teamData.promoCode);
      }
      y += 4;
      addDivider();

      addSection('Team Leader Information');
      addRow('Full Name', teamData.leader.fullName);
      addRow("Father's Name", teamData.leader.fatherName);
      addRow('Gender', teamData.leader.gender);
      addRow('CNIC / B-Form', teamData.leader.cnic);
      addRow('Student ID', teamData.leader.studentId || '—');
      addRow('Email', teamData.leader.email);
      addRow('Phone', teamData.leader.phone);
      addRow('WhatsApp', teamData.leader.whatsapp);
      addRow('City', teamData.leader.city);
      addRow('University / Institution', teamData.leader.university);
      addRow('Degree Program', teamData.leader.degree);
      addRow('Semester', teamData.leader.semester);
      y += 4;
      addDivider();

      // Additional members
      teamData.members.forEach((m, i) => {
        addSection(`Team Member ${i + 2}`);
        addRow('Full Name', m.fullName);
        addRow("Father's Name", m.fatherName);
        addRow('Gender', m.gender);
        addRow('CNIC / B-Form', m.cnic);
        addRow('City', m.city);
        addRow('University / Institution', m.university);
        addRow('Degree Program', m.degree);
        addRow('Semester', m.semester);
        y += 4;
        if (i < teamData.members.length - 1) addDivider();
      });
    } else {
      addSection('Ambassador Information');
      addRow('Full Name', ambData.fullName);
      addRow("Father's Name", ambData.fatherName);
      addRow('Gender', ambData.gender);
      addRow('CNIC / B-Form', ambData.cnic);
      addRow('Email', ambData.email);
      addRow('Phone', ambData.phone);
      addRow('WhatsApp', ambData.whatsapp);
      addRow('City', ambData.city);
      addRow('University / Institution', ambData.university);
      addRow('Degree Program', ambData.degree);
      addRow('Semester', ambData.semester);
      y += 4;
      addDivider();

      addSection('Additional Details');
      addRow('Social/LinkedIn Link', ambData.socialLink || '—');
      addRow('Motivation', ambData.motivation || '—');
      addRow('Past Experience', ambData.pastExperience || '—');
    }

    // ── Footer ──────────────────────────────────────────────────────────────────
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(13, 7, 4);
      doc.rect(0, pageH - 12, pageW, 12, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 80, 50);
      doc.text('HURC 2026 • Habib University Robotics Competition • Official Registration Slip', margin, pageH - 4);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 4, { align: 'right' });
    }

    doc.save(`HURC_Registration_${submittedData.id}.pdf`);
  }, [submittedData]);

  // Handle Module Toggle with standalone constraint
  const handleToggleModule = (modId: string) => {
    setErrorMessage(null);
    if (modId === 'drone-workshop') {
      if (selectedModules.includes('drone-workshop')) {
        setSelectedModules([]);
      } else {
        // Drone workshop is standalone, replace other selections
        setSelectedModules(['drone-workshop']);
      }
      return;
    }

    // If Drone Workshop was selected and user clicks another module, remove drone workshop
    if (selectedModules.includes('drone-workshop')) {
      setSelectedModules([modId]);
      return;
    }

    if (selectedModules.includes(modId)) {
      setSelectedModules(selectedModules.filter(id => id !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
    }
  };

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const isDroneWorkshop = selectedModules.includes('drone-workshop');

  const handleTeamSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedModules.length === 0) {
      setErrorMessage('Please select at least one competition module or workshop.');
      return;
    }

    if (!isDroneWorkshop && !teamName.trim()) {
      setErrorMessage('Please enter your Team Name.');
      return;
    }

    if (!leaderFullName.trim() || !leaderEmail.trim() || !leaderPhone.trim() || !leaderUniversity.trim()) {
      setErrorMessage(isDroneWorkshop ? 'Please complete all required fields.' : 'Please complete all required fields for the Team Leader.');
      return;
    }

    if (leaderCnic.length !== 13) {
      setErrorMessage(isDroneWorkshop ? 'CNIC must be exactly 13 digits without dashes.' : 'Leader CNIC must be exactly 13 digits without dashes.');
      return;
    }
    if (leaderPhone.length !== 11 || !leaderPhone.startsWith('03')) {
      setErrorMessage(isDroneWorkshop ? 'Phone Number must start with 03 and be exactly 11 digits.' : 'Leader Phone Number must start with 03 and be exactly 11 digits.');
      return;
    }
    if (leaderWhatsapp && (leaderWhatsapp.length !== 11 || !leaderWhatsapp.startsWith('03'))) {
      setErrorMessage(isDroneWorkshop ? 'WhatsApp Number must start with 03 and be exactly 11 digits.' : 'Leader WhatsApp Number must start with 03 and be exactly 11 digits.');
      return;
    }

    // Check required additional members
    const actualMemberCount = isDroneWorkshop ? 1 : memberCount;
    const requiredMemberCount = actualMemberCount - 1; // e.g. 3 members total = 2 additional
    for (let i = 0; i < requiredMemberCount; i++) {
      const m = members[i];
      if (!m.fullName.trim() || !m.cnic.trim() || !m.university.trim()) {
        setErrorMessage(`Please fill out required fields for Team Member #${i + 2}.`);
        return;
      }
      if (m.cnic.length !== 13) {
        setErrorMessage(`Team Member #${i + 2} CNIC must be exactly 13 digits without dashes.`);
        return;
      }
    }

    if (!declarationAccepted) {
      setErrorMessage('Please check and accept the Participant Declaration & Truthfulness.');
      return;
    }

    const regId = `HURC-2026-TEAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newRegistration: TeamRegistrationData = {
      id: regId,
      timestamp: now,
      type: 'team',
      selectedModules,
      teamName,
      memberCount: actualMemberCount,
      promoCode: promoCode.trim() || undefined,
      leader: {
        fullName: leaderFullName,
        fatherName: leaderFatherName,
        gender: leaderGender,
        cnic: leaderCnic,
        studentId: leaderStudentId,
        email: leaderEmail,
        phone: leaderPhone,
        whatsapp: leaderWhatsapp || leaderPhone,
        city: leaderCity === 'Other' ? leaderCityOther : leaderCity,
        university: leaderUniversity,
        degree: leaderDegree,
        semester: leaderSemester
      },
      members: members.slice(0, requiredMemberCount).map(m => ({
        fullName: m.fullName,
        fatherName: m.fatherName,
        gender: m.gender,
        cnic: m.cnic,
        city: m.city === 'Other' ? m.otherCity : m.city,
        university: m.university,
        degree: m.degree,
        semester: m.semester
      })),
      declarationAccepted: true,
      status: 'Pending Review'
    };

    setIsSubmitting(true);
    try {
      const dispatched = await saveRegistration(newRegistration);
      onSaveRegistration(newRegistration);
      setSubmittedData(newRegistration);
      setPreviewEmailModal(dispatched);
    } catch (e) {
      console.error(e);
      onSaveRegistration(newRegistration);
      setSubmittedData(newRegistration);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmbassadorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!ambFullName.trim() || !ambEmail.trim() || !ambPhone.trim() || !ambUniversity.trim()) {
      setErrorMessage('Please fill out all required fields for Ambassador Application.');
      return;
    }

    if (ambCnic.length !== 13) {
      setErrorMessage('CNIC must be exactly 13 digits without dashes.');
      return;
    }
    if (ambPhone.length !== 11 || !ambPhone.startsWith('03')) {
      setErrorMessage('Phone Number must start with 03 and be exactly 11 digits.');
      return;
    }
    if (ambWhatsapp && (ambWhatsapp.length !== 11 || !ambWhatsapp.startsWith('03'))) {
      setErrorMessage('WhatsApp Number must start with 03 and be exactly 11 digits.');
      return;
    }

    if (!declarationAccepted) {
      setErrorMessage('Please accept the Participant Declaration & Truthfulness.');
      return;
    }

    const regId = `HURC-2026-AMB-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newAmbassador: AmbassadorRegistrationData = {
      id: regId,
      timestamp: now,
      type: 'ambassador',
      fullName: ambFullName,
      fatherName: ambFatherName,
      gender: ambGender,
      cnic: ambCnic,
      email: ambEmail,
      phone: ambPhone,
      whatsapp: ambWhatsapp || ambPhone,
      city: ambCity === 'Other' ? ambCityOther : ambCity,
      university: ambUniversity,
      degree: ambDegree,
      semester: ambSemester,
      socialLink: ambSocialLink,
      motivation: ambMotivation,
      pastExperience: ambPastExperience,
      declarationAccepted: true,
      status: 'Pending Review'
    };

    setIsSubmitting(true);
    try {
      const dispatched = await saveRegistration(newAmbassador);
      onSaveRegistration(newAmbassador);
      setSubmittedData(newAmbassador);
      setPreviewEmailModal(dispatched);
    } catch (e) {
      console.error(e);
      onSaveRegistration(newAmbassador);
      setSubmittedData(newAmbassador);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedData) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex items-center justify-center animate-in fade-in">
        <div className="text-center p-8 sm:p-12 rounded-3xl bg-[#1a0f09] border border-orange-500/40 shadow-[0_0_50px_rgba(249,115,22,0.2)] w-full space-y-6">
          <CheckCircle2 className="w-20 h-20 text-orange-500 mx-auto" />
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-wide mb-3">
              The form has been submitted
            </h1>
            <p className="text-stone-300 text-sm sm:text-base">
              Your registration details have been automatically downloaded to your device.
            </p>
          </div>

          {/* Fee Payment Notice */}
          {submittedData.type === 'team' && (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-700/50 text-left flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-amber-300 text-sm mb-1">Important — Fee Payment Required to Confirm Registration</h3>
                <p className="text-amber-200/80 text-xs leading-relaxed">
                  Your registration is recorded but <strong className="text-amber-300">not yet confirmed</strong>. The Team Leader will be contacted by the HURC organizing team and a <strong className="text-amber-300">fee challan will be shared</strong>. To complete and confirm your registration, the team must pay the required fee within the given deadline.
                </p>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="p-5 rounded-2xl bg-[#1f1109] border border-orange-900/50 text-left flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">For Further Queries</h3>
              <p className="text-stone-400 text-xs mb-1">Contact our organizing team directly:</p>
              <a
                href="tel:03218268445"
                className="text-orange-400 font-bold text-base hover:text-orange-300 transition-colors"
              >
                0321-826-8445
              </a>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md mx-auto cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }


  // MAIN REGISTRATION FORM (Matches Screenshot 2)
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Back to Home Button */}
      <div className="mb-6">
        <button
          id="reg-back-home-btn"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-900/40 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header with Circular Badge */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-[#1b1009] border-2 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.25)] mb-3">
          <img 
            src={logoUrl} 
            alt="HURC Logo" 
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>

        <span className="text-[11px] font-bold tracking-widest uppercase text-orange-400 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-900/60 mb-2">
          HURC 2026 Registration Portal
        </span>

        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-wide leading-tight">
          {activeTab === 'team' ? 'COMPETITION TEAM REGISTRATION' : 'CAMPUS AMBASSADOR REGISTRATION'}
        </h1>

        <p className="mt-2 text-stone-400 text-xs sm:text-sm max-w-xl">
          {activeTab === 'team'
            ? 'Register your competition team (3 to 5 members including leader) to battle in the Habib University Robotics Competition.'
            : 'Apply to become an official HURC 2026 Campus Ambassador for your institute, college, or university.'}
        </p>

        {/* Tab Switcher — full width and never wider than the viewport, with the
            long "3-5 Members" hint dropped on the narrowest screens. */}
        <div className="mt-6 w-full sm:w-auto grid grid-cols-2 sm:flex rounded-xl bg-[#180e08] p-1.5 border border-amber-950/80 shadow-inner">
          <button
            type="button"
            id="tab-team-btn"
            onClick={() => setActiveTab('team')}
            className={`min-w-0 px-2.5 sm:px-5 py-2.5 rounded-lg text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Competition Team
              <span className="hidden sm:inline"> (3-5 Members)</span>
            </span>
          </button>

          <button
            type="button"
            id="tab-ambassador-btn"
            onClick={() => setActiveTab('ambassador')}
            className={`min-w-0 px-2.5 sm:px-5 py-2.5 rounded-lg text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'ambassador'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">Campus Ambassador</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ================= TEAM REGISTRATION FORM ================= */}
      {activeTab === 'team' ? (
        <form onSubmit={handleTeamSubmit} className="space-y-8">
          
          {/* STEP 1: Select Competition Modules */}
          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase">
                  Select Competition Modules / Workshop <span className="text-orange-500">*</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Select one or more competition modules. <strong className="text-orange-400">Note:</strong> If you select the <em>Drone Workshop</em>, it is a standalone session and cannot be combined with other arena competitions.
                </p>
              </div>
            </div>

            {/* Checkbox Grid (6 modules) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              {modules.map((mod) => {
                const isSelected = selectedModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    id={`checkbox-mod-${mod.id}`}
                    onClick={() => handleToggleModule(mod.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#29160c] border-orange-500/70 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                        : 'bg-[#150c07] border-amber-950/70 hover:border-amber-800/80 hover:bg-[#1d1009]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-orange-500 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-600 shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-stone-200 leading-snug">
                          {mod.title}
                        </span>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs font-bold text-orange-400 whitespace-nowrap">
                            PKR {mod.registrationFeePKR.toLocaleString()}
                          </span>
                          {mod.isStandalone && (
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50">
                              STANDALONE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!mod.isOpen && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900 shrink-0">
                        WAITLIST
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Team Details */}
          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase">
                  {isDroneWorkshop ? 'Participant Details' : 'Team Details'}
                </h2>
              </div>
            </div>

            {isDroneWorkshop ? (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Team Name <span className="text-stone-500 text-xs font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="input-team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Team Alpha (optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Team Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="input-team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Mecha Warriors"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Total Team Members (Leader + Members: 3 to 5) <span className="text-orange-500">*</span>
                  </label>
                  <select
                    id="select-member-count"
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  >
                    <option value={3}>3 Members (Leader + 2 Members)</option>
                    <option value={4}>4 Members (Leader + 3 Members)</option>
                    <option value={5}>5 Members (Leader + 4 Members)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Promo Code <span className="text-stone-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="input-promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. HURC50"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Team Leader - Personal Information */}
          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase">
                  {isDroneWorkshop ? 'Participant - Personal Information' : 'Team Leader - Personal Information'}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    {isDroneWorkshop ? 'Full Name' : 'Leader Full Name'} <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="input-leader-fullname"
                    value={leaderFullName}
                    onChange={(e) => setLeaderFullName(e.target.value)}
                    placeholder="e.g. Ali Khan"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Father / Guardian Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="input-leader-father"
                    value={leaderFatherName}
                    onChange={(e) => setLeaderFatherName(e.target.value)}
                    placeholder="e.g. Tariq Khan"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Gender <span className="text-orange-500">*</span>
                  </label>
                  <select
                    id="select-leader-gender"
                    value={leaderGender}
                    onChange={(e) => setLeaderGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    CNIC / B-Form Number <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="input-leader-cnic"
                    value={leaderCnic}
                    onChange={(e) => setLeaderCnic(e.target.value.replace(/\D/g, '').slice(0, 13))}
                    placeholder="13 digits, no dashes"
                    maxLength={13}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  University / School ID (Optional)
                </label>
                <input
                  type="text"
                  id="input-leader-studentid"
                  value={leaderStudentId}
                  onChange={(e) => setLeaderStudentId(e.target.value)}
                  placeholder="e.g. 2025-ST-001 (if applicable)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Team Leader - Contact Information */}
          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase">
                  {isDroneWorkshop ? 'Participant - Contact Information' : 'Team Leader - Contact Information'}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Email Address <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    id="input-leader-email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    placeholder="leader@email.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Phone Number <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    id="input-leader-phone"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="03XXXXXXXXX (11 digits)"
                    maxLength={11}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    WhatsApp Number <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    id="input-leader-whatsapp"
                    value={leaderWhatsapp}
                    onChange={(e) => setLeaderWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="03XXXXXXXXX (11 digits)"
                    maxLength={11}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    City <span className="text-orange-500">*</span>
                  </label>
                  <select
                    required
                    id="input-leader-city"
                    value={leaderCity}
                    onChange={(e) => setLeaderCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  >
                    <option value="" disabled>Select City</option>
                    {PAKISTAN_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {leaderCity === 'Other' && (
                    <input
                      type="text"
                      required
                      value={leaderCityOther}
                      onChange={(e) => setLeaderCityOther(e.target.value)}
                      placeholder="Please specify your city"
                      className="w-full px-4 py-2.5 mt-3 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5: Team Leader - Academic Information */}
          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0">
                5
              </span>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase">
                  {isDroneWorkshop ? 'Participant - Academic Information' : 'Team Leader - Academic Information'}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  {isDroneWorkshop ? 'University / Institution' : 'Leader University / Institution'} <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="input-leader-university"
                  value={leaderUniversity}
                  onChange={(e) => setLeaderUniversity(e.target.value)}
                  placeholder="e.g. Habib University / FAST / NUST / GIKI"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Degree / Program <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="input-leader-degree"
                    value={leaderDegree}
                    onChange={(e) => setLeaderDegree(e.target.value)}
                    placeholder="e.g. BS Computer Science / BE Robotics"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Current Semester / Class <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="input-leader-semester"
                    value={leaderSemester}
                    onChange={(e) => setLeaderSemester(e.target.value)}
                    placeholder="e.g. 4th Semester / A Level"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC ADDITIONAL TEAM MEMBERS SECTION */}
          {!isDroneWorkshop && (
            <div className="space-y-6">
              <div className="border-l-4 border-orange-500 pl-4 py-1">
                <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  ADDITIONAL TEAM MEMBERS ({memberCount - 1} MEMBERS)
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Enter details for each team member. Members can belong to different universities or colleges.
                </p>
              </div>

              {/* Render Member Cards according to memberCount */}
              {Array.from({ length: memberCount - 1 }).map((_, idx) => {
                const memberNumber = idx + 2;
                const memData = members[idx];

                return (
                  <div 
                    key={idx} 
                    id={`card-team-member-${memberNumber}`}
                    className="rounded-2xl bg-[#1c100a] border border-amber-950/80 p-5 sm:p-7 shadow-lg"
                  >
                    {/* Member Badge */}
                    <div className="flex items-center gap-2 mb-5">
                      <span className="px-2.5 py-1 rounded-md bg-orange-600 text-white font-display font-black text-xs">
                        #{memberNumber}
                      </span>
                      <div>
                        <h3 className="font-display text-base font-bold text-white tracking-wide">
                          Team Member {memberNumber}
                        </h3>
                        <span className="text-[10px] text-orange-400 uppercase tracking-wider font-semibold">
                          Participant of Team
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                            Member Full Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={memData.fullName}
                            onChange={(e) => updateMember(idx, 'fullName', e.target.value)}
                            placeholder="Full name"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                            Father / Guardian Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={memData.fatherName}
                            onChange={(e) => updateMember(idx, 'fatherName', e.target.value)}
                            placeholder="Guardian name"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                            Gender <span className="text-orange-500">*</span>
                          </label>
                          <select
                            value={memData.gender}
                            onChange={(e) => updateMember(idx, 'gender', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other / Prefer not to say</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                            CNIC / B-Form Number <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={memData.cnic}
                            onChange={(e) => updateMember(idx, 'cnic', e.target.value.replace(/\D/g, '').slice(0, 13))}
                            placeholder="13 digits, no dashes"
                            maxLength={13}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          City <span className="text-orange-500">*</span>
                        </label>
                        <select
                          required
                          value={memData.city}
                          onChange={(e) => updateMember(idx, 'city', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                        >
                          <option value="" disabled>Select City</option>
                          {PAKISTAN_CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {memData.city === 'Other' && (
                          <input
                            type="text"
                            required
                            value={memData.otherCity || ''}
                            onChange={(e) => updateMember(idx, 'otherCity', e.target.value)}
                            placeholder="Please specify your city"
                            className="w-full px-4 py-2.5 mt-3 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          University / Institution Name <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={memData.university}
                          onChange={(e) => updateMember(idx, 'university', e.target.value)}
                          placeholder="e.g. University / College name"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                            Degree / Program <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={memData.degree}
                            onChange={(e) => updateMember(idx, 'degree', e.target.value)}
                            placeholder="e.g. BS Electrical Engineering"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                            Current Semester / Class <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={memData.semester}
                            onChange={(e) => updateMember(idx, 'semester', e.target.value)}
                            placeholder="e.g. 4th Semester / A Level"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DECLARATION & TRUTHFULNESS */}
          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5 sm:p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                id="checkbox-declaration"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 bg-[#120804] border-amber-900 cursor-pointer"
              />
              <div className="text-xs text-stone-300 leading-relaxed">
                <span className="font-bold text-white block mb-0.5">
                  Participant Declaration &amp; Truthfulness:
                </span>
                I understand and declare that all the information provided in this registration is accurate, legitimate, and truthful to the best of my knowledge. I agree to abide by all the rules, guidelines, and decisions of the HURC 2026 Organizing Committee.
              </div>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            id="submit-team-registration-btn"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-display text-base sm:text-lg font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all shadow-[0_0_30px_rgba(249,115,22,0.45)] hover:shadow-[0_0_40px_rgba(249,115,22,0.65)] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-98"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>SUBMITTING…</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-white" />
                <span>{isDroneWorkshop ? 'SUBMIT REGISTRATION' : `SUBMIT TEAM REGISTRATION (${memberCount})`}</span>
              </>
            )}
          </button>

        </form>
      ) : (
        /* ================= AMBASSADOR REGISTRATION FORM ================= */
        <form onSubmit={handleAmbassadorSubmit} className="space-y-6">
          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5 sm:p-7 shadow-lg space-y-4">
            <h2 className="font-display text-xl font-bold text-white uppercase border-b border-amber-950/60 pb-3">
              Ambassador Candidate Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ambFullName}
                  onChange={(e) => setAmbFullName(e.target.value)}
                  placeholder="e.g. Sara Tariq"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Father / Guardian Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ambFatherName}
                  onChange={(e) => setAmbFatherName(e.target.value)}
                  placeholder="Guardian name"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Gender <span className="text-orange-500">*</span>
                </label>
                <select
                  value={ambGender}
                  onChange={(e) => setAmbGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  CNIC / B-Form <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ambCnic}
                  onChange={(e) => setAmbCnic(e.target.value.replace(/\D/g, '').slice(0, 13))}
                  placeholder="13 digits, no dashes"
                  maxLength={13}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={ambEmail}
                  onChange={(e) => setAmbEmail(e.target.value)}
                  placeholder="ambassador@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Phone / WhatsApp <span className="text-orange-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={ambPhone}
                  onChange={(e) => setAmbPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="03XXXXXXXXX (11 digits)"
                  maxLength={11}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  University / College Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ambUniversity}
                  onChange={(e) => setAmbUniversity(e.target.value)}
                  placeholder="e.g. Habib University / IBA / GIKI / NED"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  City <span className="text-orange-500">*</span>
                </label>
                <select
                  required
                  value={ambCity}
                  onChange={(e) => setAmbCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                >
                  <option value="" disabled>Select City</option>
                  {PAKISTAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {ambCity === 'Other' && (
                  <input
                    type="text"
                    required
                    value={ambCityOther}
                    onChange={(e) => setAmbCityOther(e.target.value)}
                    placeholder="Please specify your city"
                    className="w-full px-4 py-2.5 mt-3 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Degree / Program <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ambDegree}
                  onChange={(e) => setAmbDegree(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Current Semester / Class <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ambSemester}
                  onChange={(e) => setAmbSemester(e.target.value)}
                  placeholder="e.g. 4th Semester / A Level"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                LinkedIn / Social Profile Link
              </label>
              <input
                type="url"
                value={ambSocialLink}
                onChange={(e) => setAmbSocialLink(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Why do you want to represent HURC 2026? <span className="text-orange-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={ambMotivation}
                onChange={(e) => setAmbMotivation(e.target.value)}
                placeholder="Share your outreach ideas, student network, and passion for robotics..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 focus:border-orange-500 focus:outline-none text-stone-100 text-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#1a0f09] border border-amber-950/90 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 bg-[#120804] border-amber-900 cursor-pointer"
              />
              <span className="text-xs text-stone-300 leading-relaxed">
                I agree to actively promote HURC 2026, adhere to the code of conduct, and facilitate team registrations in my institution.
              </span>
            </label>
          </div>

          <button
            type="submit"
            id="submit-ambassador-btn"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-display text-base font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all shadow-[0_0_30px_rgba(249,115,22,0.45)] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>SUBMITTING…</span>
              </>
            ) : (
              <span>SUBMIT AMBASSADOR APPLICATION</span>
            )}
          </button>
        </form>
      )}

    </div>
  );
}
