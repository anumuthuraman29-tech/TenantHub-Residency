import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PageId } from '../types';

export interface AuthSession {
  role: 'Admin' | 'Customer';
  tenantNumber?: string;
  username?: string;
  loggedInAt: number;
}

export interface RouteState {
  page: PageId;
  tab?: string;
  param?: string;
}

const SESSION_STORAGE_KEY = 'TENANT_HUB_AUTH_SESSION_V2';

/**
 * Public routes that do NOT require authentication
 */
const PUBLIC_PAGES: PageId[] = ['login', 'customerloginpage', 'adminloginpage'];

/**
 * Admin-only pages
 */
const ADMIN_ONLY_PAGES: PageId[] = [
  'adminmainpage',
  'adminpaymentverify',
  'adminmaintenance',
  'adminannouncements',
  'adminnotifications',
  'admincontactrequests',
  'infoallpage',
  'infoeditpage',
  'rentallpage',
  'rentedit',
  'waterallpage',
  'wateredit',
  'passwordallpage',
];

/**
 * Maps a URL pathname to an internal application route state
 */
export function pathToRoute(pathname: string): RouteState {
  // Normalize pathname: remove trailing slash, lowercase
  const clean = pathname.replace(/\/$/, '').toLowerCase() || '/';

  switch (clean) {
    case '/':
    case '/login':
      return { page: 'login' };
    case '/login/tenant':
    case '/customerloginpage':
      return { page: 'customerloginpage' };
    case '/login/admin':
    case '/adminloginpage':
      return { page: 'adminloginpage' };

    // Tenant routes
    case '/dashboard':
    case '/customermainpage':
    case '/mainpage':
      return { page: 'customermainpage', tab: 'dashboard' };
    case '/payments':
    case '/payment':
    case '/paymentpage':
      return { page: 'customermainpage', tab: 'payments' };
    case '/maintenance':
    case '/complaints':
    case '/complaintspage':
      return { page: 'customermainpage', tab: 'complaints' };
    case '/announcements':
    case '/notices':
    case '/noticespage':
      return { page: 'customermainpage', tab: 'notices' };
    case '/residency':
    case '/residencypage':
      return { page: 'customermainpage', tab: 'residency' };
    case '/profile':
    case '/profilepage':
      return { page: 'customermainpage', tab: 'profile' };
    case '/contact':
    case '/contact-admin':
    case '/contactadmin':
    case '/help':
      return { page: 'contactadmin', tab: 'contact' };
    case '/sendpayment':
      return { page: 'sendpayment' };
    case '/customerinfo':
      return { page: 'customerinfo' };
    case '/rentpage':
      return { page: 'rentpage' };
    case '/waterbillpage':
      return { page: 'waterbillpage' };

    // Admin routes
    case '/admin':
    case '/admin/dashboard':
    case '/adminmainpage':
      return { page: 'adminmainpage' };
    case '/admin/payments':
    case '/adminpaymentverify':
      return { page: 'adminpaymentverify' };
    case '/admin/maintenance':
    case '/adminmaintenance':
      return { page: 'adminmaintenance' };
    case '/admin/announcements':
    case '/adminannouncements':
      return { page: 'adminannouncements' };
    case '/admin/notifications':
    case '/adminnotifications':
      return { page: 'adminnotifications' };
    case '/admin/contact-requests':
    case '/admin/contactrequests':
    case '/admincontactrequests':
      return { page: 'admincontactrequests' };
    case '/admin/tenants':
    case '/admin/info-all':
    case '/infoallpage':
      return { page: 'infoallpage' };
    case '/admin/info-edit':
    case '/infoeditpage':
      return { page: 'infoeditpage' };
    case '/admin/rent':
    case '/admin/rent-all':
    case '/rentallpage':
      return { page: 'rentallpage' };
    case '/admin/rent-edit':
    case '/rentedit':
      return { page: 'rentedit' };
    case '/admin/water':
    case '/admin/water-all':
    case '/waterallpage':
      return { page: 'waterallpage' };
    case '/admin/water-edit':
    case '/wateredit':
      return { page: 'wateredit' };
    case '/admin/passwords':
    case '/passwordallpage':
      return { page: 'passwordallpage' };

    default:
      return { page: 'login' };
  }
}

/**
 * Maps a PageId and optional tab to a clean browser URL pathname
 */
export function routeToPath(page: PageId, tab?: string): string {
  switch (page) {
    case 'login':
      return '/login';
    case 'customerloginpage':
      return '/login/tenant';
    case 'adminloginpage':
      return '/login/admin';

    case 'customermainpage':
      if (tab === 'payments') return '/payment';
      if (tab === 'complaints') return '/maintenance';
      if (tab === 'notices') return '/announcements';
      if (tab === 'residency') return '/residency';
      if (tab === 'profile') return '/profile';
      if (tab === 'contact') return '/contact-admin';
      return '/dashboard';

    case 'contactadmin':
      return '/contact-admin';
    case 'sendpayment':
      return '/sendpayment';
    case 'customerinfo':
      return '/customerinfo';
    case 'rentpage':
      return '/rentpage';
    case 'waterbillpage':
      return '/waterbillpage';

    case 'adminmainpage':
      return '/admin';
    case 'adminpaymentverify':
      return '/admin/payments';
    case 'adminmaintenance':
      return '/admin/maintenance';
    case 'adminannouncements':
      return '/admin/announcements';
    case 'adminnotifications':
      return '/admin/notifications';
    case 'admincontactrequests':
      return '/admin/contact-requests';
    case 'infoallpage':
      return '/admin/tenants';
    case 'infoeditpage':
      return '/admin/info-edit';
    case 'rentallpage':
      return '/admin/rent';
    case 'rentedit':
      return '/admin/rent-edit';
    case 'waterallpage':
      return '/admin/water';
    case 'wateredit':
      return '/admin/water-edit';
    case 'passwordallpage':
      return '/admin/passwords';

    default:
      return `/${page}`;
  }
}

export class SessionRouter {
  /**
   * Save session to persistent storage
   */
  public static saveSession(session: AuthSession): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // storage unavailable
    }
  }

  /**
   * Clear active session
   */
  public static async clearSession(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  /**
   * Restore existing session from storage or Supabase Auth
   */
  public static async restoreSession(): Promise<AuthSession | null> {
    if (typeof window === 'undefined') return null;

    // 1. Check local session storage first
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (parsed && (parsed.role === 'Admin' || parsed.role === 'Customer')) {
          // If customer, ensure valid tenant number
          if (parsed.role === 'Customer' && !parsed.tenantNumber) {
            parsed.tenantNumber = '11';
          }
          return parsed;
        }
      }
    } catch {
      // invalid JSON
    }

    // 2. Check Supabase Auth persistent session
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session && data.session.user) {
          const userMeta = data.session.user.user_metadata || {};
          const role = userMeta.role === 'Admin' ? 'Admin' : 'Customer';
          const tenantNumber = userMeta.tenant_number || '11';
          const session: AuthSession = {
            role,
            tenantNumber,
            username: data.session.user.email || 'Resident',
            loggedInAt: Date.now(),
          };
          this.saveSession(session);
          return session;
        }
      } catch (err) {
        console.warn('[SessionRouter] Error checking Supabase session:', err);
      }
    }

    return null;
  }

  /**
   * Validates if a route is permitted for the given session.
   * If not, returns the safe fallback route.
   */
  public static guardRoute(target: RouteState, session: AuthSession | null): RouteState {
    const isPublic = PUBLIC_PAGES.includes(target.page);

    // If unauthenticated:
    if (!session) {
      if (isPublic) return target;
      // Protect all tenant and admin pages from unauthenticated access
      return { page: 'login' };
    }

    // If authenticated:
    // If user is trying to visit /login while already logged in, redirect them to their home page
    if (isPublic) {
      if (session.role === 'Admin') {
        return { page: 'adminmainpage' };
      } else {
        return { page: 'customermainpage', tab: 'dashboard' };
      }
    }

    // Role-based authorization
    if (session.role === 'Customer') {
      // Prevent customer from accessing admin pages
      if (ADMIN_ONLY_PAGES.includes(target.page)) {
        return { page: 'customermainpage', tab: 'dashboard' };
      }
    }

    return target;
  }

  /**
   * Synchronize the browser URL with history pushState
   */
  public static pushUrl(page: PageId, tab?: string): void {
    if (typeof window === 'undefined') return;
    const path = routeToPath(page, tab);
    if (window.location.pathname !== path) {
      window.history.pushState({ page, tab }, '', path);
    }
  }

  /**
   * Replace the current browser URL with history replaceState
   */
  public static replaceUrl(page: PageId, tab?: string): void {
    if (typeof window === 'undefined') return;
    const path = routeToPath(page, tab);
    if (window.location.pathname !== path) {
      window.history.replaceState({ page, tab }, '', path);
    }
  }
}
