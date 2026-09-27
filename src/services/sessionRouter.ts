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
  id?: string;
}

const SESSION_STORAGE_KEY = 'TENANT_HUB_AUTH_SESSION_V2';
const ACTIVE_ROUTE_STORAGE_KEY = 'TENANT_HUB_ACTIVE_ROUTE_V2';

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
 * Maps a URL pathname and search query to an internal application route state
 */
export function pathToRoute(pathname: string, search: string = ''): RouteState {
  // Normalize pathname: remove trailing slash, lowercase
  const clean = pathname.replace(/\/$/, '').toLowerCase() || '/';

  // Parse search params if present
  let queryParam: string | undefined;
  let queryId: string | undefined;
  let queryTab: string | undefined;

  try {
    const searchParams = new URLSearchParams(search);
    queryParam = searchParams.get('tenant') || searchParams.get('tenantNumber') || undefined;
    queryId = searchParams.get('id') || searchParams.get('recordId') || undefined;
    queryTab = searchParams.get('tab') || undefined;
  } catch {
    // ignore search param parse issues
  }

  // Exact static routes
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
      return { page: 'customermainpage', tab: queryTab || 'dashboard' };
    case '/payments':
    case '/payment':
    case '/paymentpage':
      return { page: 'customermainpage', tab: 'payments' };
    case '/paypage':
      return { page: 'paypage', param: queryParam };
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
      return { page: 'contactadmin', tab: 'contact', param: queryParam };
    case '/sendpayment':
      return { page: 'sendpayment' };
    case '/customerinfo':
      return { page: 'customerinfo', param: queryParam };
    case '/rentpage':
      return { page: 'rentpage', param: queryParam };
    case '/waterbillpage':
      return { page: 'waterbillpage', param: queryParam };

    // Admin routes (exact)
    case '/admin':
    case '/admin/dashboard':
    case '/adminmainpage':
      return { page: 'adminmainpage' };
    case '/admin/payments':
    case '/adminpaymentverify':
      return { page: 'adminpaymentverify' };
    case '/admin/maintenance':
    case '/adminmaintenance':
      return { page: 'adminmaintenance', id: queryId };
    case '/admin/announcements':
    case '/adminannouncements':
      return { page: 'adminannouncements', id: queryId };
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
    case '/tenants':
      return { page: 'infoallpage' };
    case '/admin/info-edit':
    case '/infoeditpage':
    case '/tenants/edit':
      return { page: 'infoeditpage', param: queryParam };
    case '/admin/rent':
    case '/admin/rent-all':
    case '/rentallpage':
    case '/rent':
      return { page: 'rentallpage' };
    case '/admin/rent-edit':
    case '/rentedit':
    case '/rent/edit':
      return { page: 'rentedit', param: queryParam, id: queryId };
    case '/admin/water':
    case '/admin/water-all':
    case '/waterallpage':
    case '/water':
      return { page: 'waterallpage' };
    case '/admin/water-edit':
    case '/wateredit':
    case '/water/edit':
      return { page: 'wateredit', param: queryParam, id: queryId };
    case '/admin/passwords':
    case '/passwordallpage':
      return { page: 'passwordallpage' };
  }

  // Dynamic / nested segments parsing
  // 1. Rent Edit: /admin/rent-edit/:tenant/:id? or /rent/edit/:tenant/:id? or /rent/edit/:id
  const rentEditMatch =
    clean.match(/^\/admin\/rent-edit\/([^/]+)(?:\/([^/]+))?$/) ||
    clean.match(/^\/rent\/edit\/([^/]+)(?:\/([^/]+))?$/) ||
    clean.match(/^\/rentedit\/([^/]+)(?:\/([^/]+))?$/);
  if (rentEditMatch) {
    const p1 = decodeURIComponent(rentEditMatch[1]);
    const p2 = rentEditMatch[2] ? decodeURIComponent(rentEditMatch[2]) : undefined;
    return {
      page: 'rentedit',
      param: p1,
      id: p2 || queryId,
    };
  }

  // 2. Water Edit: /admin/water-edit/:tenant/:id? or /water/edit/:tenant/:id?
  const waterEditMatch =
    clean.match(/^\/admin\/water-edit\/([^/]+)(?:\/([^/]+))?$/) ||
    clean.match(/^\/water\/edit\/([^/]+)(?:\/([^/]+))?$/) ||
    clean.match(/^\/wateredit\/([^/]+)(?:\/([^/]+))?$/);
  if (waterEditMatch) {
    const p1 = decodeURIComponent(waterEditMatch[1]);
    const p2 = waterEditMatch[2] ? decodeURIComponent(waterEditMatch[2]) : undefined;
    return {
      page: 'wateredit',
      param: p1,
      id: p2 || queryId,
    };
  }

  // 3. Info / Tenant Edit: /admin/info-edit/:tenant or /tenants/edit/:tenant
  const infoEditMatch =
    clean.match(/^\/admin\/info-edit\/([^/]+)$/) ||
    clean.match(/^\/tenants\/edit\/([^/]+)$/) ||
    clean.match(/^\/infoeditpage\/([^/]+)$/);
  if (infoEditMatch) {
    return {
      page: 'infoeditpage',
      param: decodeURIComponent(infoEditMatch[1]),
    };
  }

  // 4. Maintenance detail: /admin/maintenance/:id or /maintenance/:id
  const maintMatch =
    clean.match(/^\/admin\/maintenance\/([^/]+)$/) ||
    clean.match(/^\/maintenance\/([^/]+)$/) ||
    clean.match(/^\/adminmaintenance\/([^/]+)$/);
  if (maintMatch) {
    return {
      page: 'adminmaintenance',
      id: decodeURIComponent(maintMatch[1]),
    };
  }

  // 5. Announcements detail: /admin/announcements/:id or /announcements/:id
  const announceMatch =
    clean.match(/^\/admin\/announcements\/([^/]+)$/) ||
    clean.match(/^\/announcements\/([^/]+)$/) ||
    clean.match(/^\/adminannouncements\/([^/]+)$/);
  if (announceMatch) {
    return {
      page: 'adminannouncements',
      id: decodeURIComponent(announceMatch[1]),
    };
  }

  return { page: 'login' };
}

/**
 * Maps a RouteState to a clean browser URL pathname
 */
export function routeToPath(page: PageId, tab?: string, param?: string, id?: string): string {
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
      return param ? `/customerinfo?tenant=${encodeURIComponent(param)}` : '/customerinfo';
    case 'rentpage':
      return param ? `/rentpage?tenant=${encodeURIComponent(param)}` : '/rentpage';
    case 'waterbillpage':
      return param ? `/waterbillpage?tenant=${encodeURIComponent(param)}` : '/waterbillpage';
    case 'paypage':
      return param ? `/paypage?tenant=${encodeURIComponent(param)}` : '/paypage';

    case 'adminmainpage':
      return '/admin';
    case 'adminpaymentverify':
      return '/admin/payments';
    case 'adminmaintenance':
      return id ? `/admin/maintenance/${encodeURIComponent(id)}` : '/admin/maintenance';
    case 'adminannouncements':
      return id ? `/admin/announcements/${encodeURIComponent(id)}` : '/admin/announcements';
    case 'adminnotifications':
      return '/admin/notifications';
    case 'admincontactrequests':
      return '/admin/contact-requests';
    case 'infoallpage':
      return '/tenants';
    case 'infoeditpage':
      return param ? `/tenants/edit/${encodeURIComponent(param)}` : '/tenants/edit';
    case 'rentallpage':
      return '/rent';
    case 'rentedit':
      if (param && id) {
        return `/rent/edit/${encodeURIComponent(param)}/${encodeURIComponent(id)}`;
      }
      if (param) {
        return `/rent/edit/${encodeURIComponent(param)}`;
      }
      return '/rent/edit';
    case 'waterallpage':
      return '/water';
    case 'wateredit':
      if (param && id) {
        return `/water/edit/${encodeURIComponent(param)}/${encodeURIComponent(id)}`;
      }
      if (param) {
        return `/water/edit/${encodeURIComponent(param)}`;
      }
      return '/water/edit';
    case 'passwordallpage':
      return '/admin/passwords';

    default:
      return `/${page}`;
  }
}

export class SessionRouter {
  /**
   * Synchronously get the active auth session from localStorage
   */
  public static getStoredSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (parsed && (parsed.role === 'Admin' || parsed.role === 'Customer')) {
          if (parsed.role === 'Customer' && !parsed.tenantNumber) {
            parsed.tenantNumber = '11';
          }
          return parsed;
        }
      }
    } catch {
      // invalid JSON
    }
    return null;
  }

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
   * Clear active session and saved route
   */
  public static async clearSession(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_ROUTE_STORAGE_KEY);
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
    // 1. Check local session storage first (instant synchronous)
    const local = this.getStoredSession();
    if (local) return local;

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
   * Get the current active route from URL with localStorage fallback
   */
  public static getCurrentRoute(): RouteState {
    if (typeof window === 'undefined') {
      return { page: 'login' };
    }

    const path = window.location.pathname;
    const search = window.location.search;

    // If on a specific path other than root
    if (path && path !== '/') {
      const parsed = pathToRoute(path, search);
      if (parsed.page !== 'login' || path === '/login') {
        return parsed;
      }
    }

    // Check saved route in localStorage
    try {
      const saved = localStorage.getItem(ACTIVE_ROUTE_STORAGE_KEY);
      if (saved) {
        const parsed: RouteState = JSON.parse(saved);
        if (parsed && parsed.page) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Fallback: check pathname
    return pathToRoute(path, search);
  }

  /**
   * Save the active route to localStorage
   */
  public static saveActiveRoute(route: RouteState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_ROUTE_STORAGE_KEY, JSON.stringify(route));
    } catch {
      // ignore
    }
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
      // User is not logged in, take them to login
      return { page: 'login' };
    }

    // If authenticated:
    // If user is visiting a public login page while already logged in, take them to their dashboard
    if (isPublic) {
      if (session.role === 'Admin') {
        return { page: 'adminmainpage' };
      } else {
        return { page: 'customermainpage', tab: 'dashboard' };
      }
    }

    // Role-based authorization & intelligent routing
    if (session.role === 'Admin') {
      if (target.page === 'customermainpage') {
        if (target.tab === 'complaints') {
          return { page: 'adminmaintenance', id: target.id };
        }
        if (target.tab === 'notices') {
          return { page: 'adminannouncements', id: target.id };
        }
        if (target.tab === 'payments') {
          return { page: 'adminpaymentverify' };
        }
        if (target.tab === 'contact') {
          return { page: 'admincontactrequests' };
        }
        return { page: 'adminmainpage' };
      }
    }

    if (session.role === 'Customer') {
      // Prevent customer from accessing admin pages
      if (ADMIN_ONLY_PAGES.includes(target.page)) {
        return { page: 'customermainpage', tab: 'dashboard' };
      }
    }

    return target;
  }

  /**
   * Synchronize the browser URL with history pushState and save state
   */
  public static pushUrl(page: PageId, tab?: string, param?: string, id?: string): void {
    if (typeof window === 'undefined') return;
    const path = routeToPath(page, tab, param, id);
    this.saveActiveRoute({ page, tab, param, id });
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState({ page, tab, param, id }, '', path);
    }
  }

  /**
   * Replace the current browser URL with history replaceState and save state
   */
  public static replaceUrl(page: PageId, tab?: string, param?: string, id?: string): void {
    if (typeof window === 'undefined') return;
    const path = routeToPath(page, tab, param, id);
    this.saveActiveRoute({ page, tab, param, id });
    if (window.location.pathname + window.location.search !== path) {
      window.history.replaceState({ page, tab, param, id }, '', path);
    }
  }
}
