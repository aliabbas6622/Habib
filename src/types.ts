export interface CompetitionModule {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  iconName: string;
  badge: string;
  image: string;
  description: string;
  tagline: string;
  isStandalone?: boolean;
  specs: {
    teamSize: string;
    robotWeight: string;
    dimensions: string;
    arenaSize: string;
    powerLimit: string;
    controlType: string;
  };
  rulebook: {
    overview: string[];
    arenaDetails: string[];
    robotConstraints: string[];
    matchFormat: string[];
    scoringSystem: string[];
    penaltiesAndDisqualifications: string[];
  };
  prizePool: {
    firstPlace: string;
    secondPlace: string;
    thirdPlace?: string;
    bestDesign?: string;
  };
}

export interface StudentBodyMember {
  id: string;
  role: string;
  name: string;
  imageUrl?: string | null;
}

export interface TeamMember {
  fullName: string;
  fatherName: string;
  gender: string;
  cnic: string;
  city: string;
  university: string;
  degree: string;
  semester: string;
}

export interface TeamLeader extends TeamMember {
  email: string;
  phone: string;
  whatsapp: string;
  studentId?: string;
}

export interface TeamRegistrationData {
  id: string;
  timestamp: string;
  type: 'team' | 'ambassador';
  selectedModules: string[];
  teamName: string;
  memberCount: number;
  leader: TeamLeader;
  members: TeamMember[];
  declarationAccepted: boolean;
  status: 'Pending Review' | 'Verified' | 'Approved' | 'Rejected';
}

export interface AmbassadorRegistrationData {
  id: string;
  timestamp: string;
  type: 'ambassador';
  fullName: string;
  fatherName?: string;
  gender: string;
  cnic: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  university: string;
  degree: string;
  semester: string;
  socialLink: string;
  motivation: string;
  pastExperience: string;
  declarationAccepted: boolean;
  status: 'Pending Review' | 'Shortlisted' | 'Selected';
}
