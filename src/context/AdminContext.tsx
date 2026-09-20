import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isEmailAdminAllowlisted } from '../admin/adminAllowlist';
import { hydrateAdminProfileOverrides } from '../admin/adminProfileStore';
import { hydrateAdminRoles, resolveAdminRoleForEmail } from '../admin/adminRolesStore';
import {
  adminHasPermission,
  type AdminPermission,
  type AdminRole,
  parseAdminRole,
} from '../admin/rbac';
import { getSupabaseClient, getSupabaseSession } from '../services/supabase';

const SESSION_KEY = '@spark/admin_session_v1';

type AdminSession = {
  email: string;
  role: AdminRole;
};

type AdminContextValue = {
  adminSession: AdminSession | null;
  isAdminHydrated: boolean;
  signInAdmin: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOutAdmin: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
  showInternalProfileLabels: boolean;
  showDemoBillingHints: boolean;
  refreshAdminRole: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

async function resolveRoleForEmail(email: string): Promise<AdminRole | null> {
  const normalized = email.trim().toLowerCase();
  if (!isEmailAdminAllowlisted(normalized)) {
    return null;
  }

  await hydrateAdminRoles();
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    const metaRole = parseAdminRole(data.user?.app_metadata?.admin_role);
    if (metaRole && data.user?.email?.toLowerCase() === normalized) {
      return metaRole;
    }
  }

  return resolveAdminRoleForEmail(normalized);
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isAdminHydrated, setIsAdminHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.all([hydrateAdminProfileOverrides(), hydrateAdminRoles()]);
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as AdminSession;
          const role = await resolveRoleForEmail(parsed.email);
          if (role) {
            setAdminSession({ email: parsed.email.toLowerCase(), role });
          } else {
            await AsyncStorage.removeItem(SESSION_KEY);
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) {
        setIsAdminHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signInAdmin = useCallback(async (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) {
      return { ok: false, error: 'Enter a valid email' };
    }
    const role = await resolveRoleForEmail(normalized);
    if (!role) {
      return { ok: false, error: 'Not authorized for admin access' };
    }
    const session = { email: normalized, role };
    setAdminSession(session);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true };
  }, []);

  const signOutAdmin = useCallback(async () => {
    setAdminSession(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const refreshAdminRole = useCallback(async () => {
    if (!adminSession) {
      return;
    }
    const role = await resolveRoleForEmail(adminSession.email);
    if (!role) {
      await signOutAdmin();
      return;
    }
    if (role !== adminSession.role) {
      const next = { ...adminSession, role };
      setAdminSession(next);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }
  }, [adminSession, signOutAdmin]);

  useEffect(() => {
    void (async () => {
      const session = await getSupabaseSession();
      if (!session || !adminSession) {
        return;
      }
      const supabase = getSupabaseClient();
      const { data } = await supabase?.auth.getUser() ?? { data: { user: null } };
      const email = data.user?.email?.toLowerCase();
      if (email && email === adminSession.email) {
        await refreshAdminRole();
      }
    })();
  }, [adminSession, refreshAdminRole]);

  const hasPermission = useCallback(
    (permission: AdminPermission) => {
      if (!adminSession) {
        return false;
      }
      return adminHasPermission(adminSession.role, permission);
    },
    [adminSession],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      adminSession,
      isAdminHydrated,
      signInAdmin,
      signOutAdmin,
      hasPermission,
      showInternalProfileLabels: hasPermission('canViewInternalProfileMetadata'),
      showDemoBillingHints: hasPermission('canViewDemoBillingHints'),
      refreshAdminRole,
    }),
    [adminSession, hasPermission, isAdminHydrated, refreshAdminRole, signInAdmin, signOutAdmin],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
}

export function useOptionalAdmin(): AdminContextValue | null {
  return useContext(AdminContext);
}
