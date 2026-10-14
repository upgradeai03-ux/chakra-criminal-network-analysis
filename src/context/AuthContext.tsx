import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

export const availableOfficers: UserProfile[] = [
  {
    id: 'user-1',
    officerId: 'cmdr.sharma',
    name: 'Cmdr. V. R. Sharma',
    badgeNumber: 'IO-4091',
    role: 'LEAD_INVESTIGATOR',
    department: 'Special Narcotics & Organised Crime Branch',
    status: 'ACTIVE',
    permissions: ['Full Investigation Control', 'Intel Ingestion', 'Entity Resolution', 'AI Graph Analysis', 'Task Assignment'],
  },
  {
    id: 'user-2',
    officerId: 'insp.nair',
    name: 'Insp. Priya Nair',
    badgeNumber: 'IO-3021',
    role: 'INVESTIGATOR',
    department: 'Economic Offences Wing (EOW)',
    status: 'ACTIVE',
    permissions: ['Field Investigations', 'Intel Ingestion', 'Entity Resolution', 'AI Graph Analysis', 'Task Operations'],
  },
  {
    id: 'user-3',
    officerId: 'dr.joshi',
    name: 'Dr. Vikram Joshi',
    badgeNumber: 'IO-5092',
    role: 'ANALYST',
    department: 'Cyber Intelligence & Link Analysis Unit',
    status: 'ACTIVE',
    permissions: ['AI Centrality Analysis', 'Network Diagnostics', 'Intelligence Dossier Generation', 'Link Graph Querying'],
  },
  {
    id: 'user-4',
    officerId: 'admin.sen',
    name: 'Director General A. Sen',
    badgeNumber: 'HQ-001',
    role: 'ADMIN',
    department: 'Central Intelligence Directorate',
    status: 'ACTIVE',
    permissions: ['Master System Administration', 'Audit Surveillance', 'Topology Validation', 'Full Case Access'],
  },
  {
    id: 'user-5',
    officerId: 'viewer.demo',
    name: 'Demo Viewer',
    badgeNumber: 'VR-1001',
    role: 'VIEWER',
    department: 'Field Intelligence Division',
    status: 'ACTIVE',
    permissions: ['Read-Only Investigation Workspace', 'Intelligence Feed Inspection', 'Audit Log Access'],
  },
];

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  availableOfficersList: UserProfile[];
  login: (officerId: string, password: string) => { success: boolean; error?: string };
  loginAsDemo: (officerId: string) => void;
  logout: () => void;
  switchOfficer: (officerIdOrId: string) => void;
  setUserRole: (role: UserRole) => void;
  canImportIntel: boolean;
  canResolveEntities: boolean;
  canRunAiAnalysis: boolean;
  canManageTasks: boolean;
  canGenerateReports: boolean;
  canAdmin: boolean;
  canViewAuditLog: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'chakra_auth_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Find matching officer or use stored object
        const match = availableOfficers.find(o => o.officerId === parsed.officerId || o.id === parsed.id);
        return match || parsed;
      } catch (e) {
        // fallback
      }
    }
    // Default demo session for immediate SIH exploration if no previous session
    return availableOfficers[0];
  });

  const isAuthenticated = currentUser !== null;

  useEffect(() => {
    if (currentUser) {
      const safeData = {
        id: currentUser.id,
        officerId: currentUser.officerId,
        name: currentUser.name,
        badgeNumber: currentUser.badgeNumber,
        role: currentUser.role,
        department: currentUser.department,
        status: currentUser.status,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (officerIdInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const cleanId = officerIdInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanId) {
      return { success: false, error: 'Officer ID / Username is required.' };
    }

    if (cleanPass !== 'chakra123') {
      return { success: false, error: 'Invalid password. For demo environment, use password "chakra123".' };
    }

    const matchedOfficer = availableOfficers.find(
      o => o.officerId.toLowerCase() === cleanId || o.id.toLowerCase() === cleanId
    );

    if (!matchedOfficer) {
      return { 
        success: false, 
        error: `Officer ID "${cleanId}" not found. Please select from available demo accounts (e.g. cmdr.sharma, insp.nair, dr.joshi, admin.sen, viewer.demo).` 
      };
    }

    setCurrentUser(matchedOfficer);
    return { success: true };
  };

  const loginAsDemo = (officerId: string) => {
    const matched = availableOfficers.find(
      o => o.officerId.toLowerCase() === officerId.toLowerCase() || o.id.toLowerCase() === officerId.toLowerCase()
    );
    if (matched) {
      setCurrentUser(matched);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchOfficer = (officerIdOrId: string) => {
    const officer = availableOfficers.find(
      o => o.officerId.toLowerCase() === officerIdOrId.toLowerCase() || o.id.toLowerCase() === officerIdOrId.toLowerCase()
    );
    if (officer) {
      setCurrentUser(officer);
    }
  };

  const setUserRole = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  // Compute RBAC permissions based on active role
  const role = currentUser?.role || 'VIEWER';
  const canImportIntel = ['ADMIN', 'LEAD_INVESTIGATOR', 'INVESTIGATOR'].includes(role);
  const canResolveEntities = ['ADMIN', 'LEAD_INVESTIGATOR', 'INVESTIGATOR'].includes(role);
  const canRunAiAnalysis = ['ADMIN', 'LEAD_INVESTIGATOR', 'INVESTIGATOR', 'ANALYST'].includes(role);
  const canManageTasks = ['ADMIN', 'LEAD_INVESTIGATOR', 'INVESTIGATOR'].includes(role);
  const canGenerateReports = ['ADMIN', 'LEAD_INVESTIGATOR', 'INVESTIGATOR', 'ANALYST'].includes(role);
  const canAdmin = role === 'ADMIN';
  const canViewAuditLog = isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        availableOfficersList: availableOfficers,
        login,
        loginAsDemo,
        logout,
        switchOfficer,
        setUserRole,
        canImportIntel,
        canResolveEntities,
        canRunAiAnalysis,
        canManageTasks,
        canGenerateReports,
        canAdmin,
        canViewAuditLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
