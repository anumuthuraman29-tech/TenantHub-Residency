/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AestheticBackground, BackgroundTheme } from './components/AestheticBackground';
import { ThemePalette } from './components/ThemePalette';
import { DatabaseService } from './services/dbStore';
import { SessionRouter, AuthSession, RouteState } from './services/sessionRouter';
import {
  CustomerLoginPage,
  AdminLoginPage,
  LoginPageDisplay,
} from './components/pages/AuthPagesDisplay';
import { CustomerMainPageDisplay } from './components/pages/CustomerMainPageDisplay';
import { AdminMainPageDisplay } from './components/pages/AdminMainPageDisplay';
import { PaymentPageDisplay } from './components/pages/PaymentPageDisplay';
import { PayPageDisplay } from './components/pages/PayPageDisplay';
import { CustomerInfoDisplay } from './components/pages/CustomerInfoDisplay';
import { InfoAllPageDisplay } from './components/pages/InfoAllPageDisplay';
import { InfoEditDisplay } from './components/pages/InfoEditDisplay';
import { AdminPaymentVerifyDisplay } from './components/pages/AdminPaymentVerifyDisplay';
import { AdminMaintenanceDisplay } from './components/pages/AdminMaintenanceDisplay';
import { AdminAnnouncementsDisplay } from './components/pages/AdminAnnouncementsDisplay';
import { AdminNotificationsDisplay } from './components/pages/AdminNotificationsDisplay';
import { AdminContactRequestsDisplay } from './components/pages/AdminContactRequestsDisplay';
import { ContactAdminDisplay } from './components/pages/ContactAdminDisplay';
import { RentAllPageDisplay } from './components/pages/RentAllPageDisplay';
import { WaterAllPageDisplay } from './components/pages/WaterAllPageDisplay';
import { RentEditDisplay } from './components/pages/RentEditDisplay';
import { WaterEditDisplay } from './components/pages/WaterEditDisplay';
import { RentPageDisplay, WaterBillPageDisplay } from './components/pages/CustomerViewsDisplay';
import { SendPaymentDisplay } from './components/pages/SendPaymentDisplay';
import { InfoPageDisplay, PasswordAllPageDisplay } from './components/pages/OtherPagesDisplay';

import { initializeSupabaseRealtime } from './services/supabaseRealtime';
import tenantHubLogo from './assets/images/tenant_hub_logo.png';

export default function App() {
  // Synchronous session and route restoration from localStorage and URL
  const initialSession = SessionRouter.getStoredSession();
  const rawInitialRoute = SessionRouter.getCurrentRoute();
  const initialGuarded = SessionRouter.guardRoute(rawInitialRoute, initialSession);

  const [currentPage, setCurrentPage] = useState<string>(initialGuarded.page);
  const [currentTab, setCurrentTab] = useState<string | undefined>(initialGuarded.tab);
  const [currentTenant, setCurrentTenant] = useState<string>(
    initialGuarded.param || initialSession?.tenantNumber || '11'
  );
  const [currentRecordId, setCurrentRecordId] = useState<string | undefined>(initialGuarded.id);
  const [userRole, setUserRole] = useState<'Admin' | 'Customer'>(initialSession?.role || 'Customer');

  const [bgTheme, setBgTheme] = useState<BackgroundTheme>(() => {
    const saved = localStorage.getItem('TENANT_HUB_THEME');
    const validThemes: BackgroundTheme[] = ['midnight_teal', 'nordic_navy', 'estate_emerald', 'daylight_slate'];
    if (saved && validThemes.includes(saved as BackgroundTheme)) {
      return saved as BackgroundTheme;
    }
    localStorage.setItem('TENANT_HUB_THEME', 'midnight_teal');
    return 'midnight_teal';
  });

  const handleThemeChange = (newTheme: BackgroundTheme) => {
    setBgTheme(newTheme);
    localStorage.setItem('TENANT_HUB_THEME', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', bgTheme);
    document.body.setAttribute('data-theme', bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    const handleGlobalThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<BackgroundTheme>;
      if (customEvent.detail && customEvent.detail !== bgTheme) {
        setBgTheme(customEvent.detail);
      }
    };
    window.addEventListener('tenant_hub_theme_change', handleGlobalThemeChange);
    return () => window.removeEventListener('tenant_hub_theme_change', handleGlobalThemeChange);
  }, [bgTheme]);

  // Synchronize URL on initial mount so URL reflects the exact restored page & params
  useEffect(() => {
    SessionRouter.replaceUrl(
      initialGuarded.page,
      initialGuarded.tab,
      initialGuarded.param || (userRole === 'Customer' ? currentTenant : undefined),
      initialGuarded.id
    );
  }, []);

  // Handle browser Back & Forward button popstate
  useEffect(() => {
    const handlePopState = () => {
      const route = SessionRouter.getCurrentRoute();
      const session = SessionRouter.getStoredSession();
      const guarded = SessionRouter.guardRoute(route, session);
      setCurrentPage(guarded.page);
      setCurrentTab(guarded.tab);
      if (guarded.param) setCurrentTenant(guarded.param);
      setCurrentRecordId(guarded.id);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync with Server & Supabase & background session check
  useEffect(() => {
    DatabaseService.syncFromServer();
    DatabaseService.syncFromSupabase();
    const unsubscribe = initializeSupabaseRealtime();

    // Re-sync when switching between phone and laptop (screen on / tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        DatabaseService.syncFromServer();
        DatabaseService.syncFromSupabase();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Periodic background sync across devices (every 8 seconds)
    const syncInterval = setInterval(() => {
      DatabaseService.syncFromServer();
    }, 8000);

    SessionRouter.restoreSession().then((session) => {
      if (session) {
        setUserRole(session.role);
        if (session.tenantNumber && !currentTenant) {
          setCurrentTenant(session.tenantNumber);
        }
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(syncInterval);
    };
  }, []);

  const handleNavigate = useCallback((page: string, tabOrParam?: string, maybeId?: string) => {
    let tab: string | undefined = undefined;
    let param: string | undefined = undefined;
    let recId: string | undefined = maybeId;

    if (page === 'customermainpage') {
      tab = tabOrParam || 'dashboard';
      param = currentTenant;
    } else if (
      page === 'rentedit' ||
      page === 'wateredit' ||
      page === 'infoeditpage' ||
      page === 'customerinfo' ||
      page === 'rentpage' ||
      page === 'waterbillpage' ||
      page === 'paypage'
    ) {
      if (tabOrParam && !tabOrParam.includes('dashboard')) {
        param = tabOrParam;
        setCurrentTenant(tabOrParam);
      } else {
        param = currentTenant;
      }
    } else if (page === 'adminmaintenance' || page === 'adminannouncements') {
      recId = tabOrParam;
    } else if (page === 'contactadmin') {
      tab = 'contact';
      param = currentTenant;
    }

    setCurrentPage(page);
    setCurrentTab(tab);
    if (param) setCurrentTenant(param);
    setCurrentRecordId(recId);

    SessionRouter.pushUrl(
      page as any,
      tab,
      param || (page === 'rentedit' || page === 'wateredit' ? currentTenant : undefined),
      recId
    );
  }, [currentTenant]);

  const handleLoginSuccess = (role: 'Admin' | 'Customer', tenantNumber?: string) => {
    setUserRole(role);
    const targetTenant = tenantNumber || '11';
    setCurrentTenant(targetTenant);

    const session: AuthSession = {
      role,
      tenantNumber: targetTenant,
      username: role === 'Admin' ? 'Admin Anu M' : `Resident Unit ${targetTenant}`,
      loggedInAt: Date.now(),
    };
    SessionRouter.saveSession(session);

    if (role === 'Customer') {
      handleNavigate('customermainpage', 'dashboard');
    } else {
      handleNavigate('adminmainpage');
    }
  };

  const handleLogout = async () => {
    await SessionRouter.clearSession();
    setUserRole('Customer');
    setCurrentPage('login');
    setCurrentTab(undefined);
    setCurrentRecordId(undefined);
    SessionRouter.pushUrl('login');
  };

  const tenantName = userRole === 'Customer' ? DatabaseService.getTenantResidentName(currentTenant) : 'Administrator';

  return (
    <div data-theme={bgTheme} className="relative min-h-screen text-white flex flex-col font-sans">
      {/* Aesthetic Animated Background System */}
      <AestheticBackground theme={bgTheme} />

      {/* Modern Midnight + Teal Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/90 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 backdrop-blur-xl shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div
            onClick={() => {
              if (currentPage !== 'login') {
                handleNavigate(userRole === 'Admin' ? 'adminmainpage' : 'customermainpage');
              }
            }}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900/90 border border-teal-500/40 p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={tenantHubLogo}
                alt="Tenant Hub Residency Logo"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-xs sm:text-sm text-white uppercase flex items-center gap-2">
                <span>TENANT HUB RESIDENCY</span>
              </div>
              <div className="text-[10px] text-teal-400/90 font-medium hidden sm:block">
                Smart Residential Management
              </div>
            </div>
          </div>

          {/* Top Right Corner Controls: Active Tenant Badge, Theme Palette & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentPage !== 'login' && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="font-semibold text-white">{tenantName}</span>
                {userRole === 'Customer' && <span className="text-teal-400 font-mono text-[11px]">(Unit {currentTenant})</span>}
              </div>
            )}

            <ThemePalette currentTheme={bgTheme} onThemeChange={handleThemeChange} />

            {currentPage !== 'login' && (
              <button
                id="btnSignOut"
                onClick={handleLogout}
                className="text-xs px-3.5 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-full border border-slate-700 hover:border-red-500/30 transition font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center p-4">
        {/* Page Router */}
        {currentPage === 'login' && (
          <LoginPageDisplay
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'customerloginpage' && (
          <CustomerLoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchMode={() => handleNavigate('adminloginpage')}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'adminloginpage' && (
          <AdminLoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchMode={() => handleNavigate('customerloginpage')}
            onNavigate={handleNavigate}
          />
        )}

        {(currentPage === 'customermainpage' || currentPage === 'mainpage') && (
          <CustomerMainPageDisplay
            tenantNumber={currentTenant}
            initialTab={currentTab}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'adminmainpage' && (
          <AdminMainPageDisplay onNavigate={handleNavigate} onLogout={handleLogout} />
        )}

        {currentPage === 'contactadmin' && (
          <ContactAdminDisplay
            tenantNumber={currentTenant}
            onNavigate={handleNavigate}
            showBackButton={true}
          />
        )}

        {currentPage === 'paymentpage' && (
          <PaymentPageDisplay
            tenantNumber={currentTenant}
            onNavigate={handleNavigate}
            userRole={userRole}
          />
        )}

        {currentPage === 'paypage' && (
          <PayPageDisplay
            tenantNumber={currentTenant}
            onNavigate={handleNavigate}
            userRole={userRole}
          />
        )}

        {currentPage === 'customerinfo' && (
          <CustomerInfoDisplay
            tenantNumber={currentTenant}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'infoallpage' && (
          <InfoAllPageDisplay
            onNavigate={handleNavigate}
            onSelectTenant={(t) => {
              setCurrentTenant(t);
              handleNavigate('infoeditpage', t);
            }}
          />
        )}

        {currentPage === 'infoeditpage' && (
          <InfoEditDisplay
            initialTenantNumber={currentTenant}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'adminpaymentverify' && (
          <AdminPaymentVerifyDisplay
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'adminmaintenance' && (
          <AdminMaintenanceDisplay
            initialTicketId={currentRecordId}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'adminannouncements' && (
          <AdminAnnouncementsDisplay
            initialNoticeId={currentRecordId}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'adminnotifications' && (
          <AdminNotificationsDisplay
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'admincontactrequests' && (
          <AdminContactRequestsDisplay
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'rentpage' && (
          <RentPageDisplay tenantNumber={currentTenant} onNavigate={handleNavigate} />
        )}

        {currentPage === 'waterbillpage' && (
          <WaterBillPageDisplay tenantNumber={currentTenant} onNavigate={handleNavigate} />
        )}

        {currentPage === 'rentedit' && (
          <RentEditDisplay
            initialTenantNumber={currentTenant}
            initialRecordId={currentRecordId}
            userRole={userRole}
            onNavigate={handleNavigate}
            onSelectRecord={(id) => {
              setCurrentRecordId(String(id));
              SessionRouter.replaceUrl('rentedit', undefined, currentTenant, String(id));
            }}
          />
        )}

        {currentPage === 'wateredit' && (
          <WaterEditDisplay
            initialTenantNumber={currentTenant}
            initialRecordId={currentRecordId}
            userRole={userRole}
            onNavigate={handleNavigate}
            onSelectRecord={(id) => {
              setCurrentRecordId(String(id));
              SessionRouter.replaceUrl('wateredit', undefined, currentTenant, String(id));
            }}
          />
        )}

        {currentPage === 'rentallpage' && (
          <RentAllPageDisplay
            onNavigate={handleNavigate}
            onSelectTenant={(t) => {
              setCurrentTenant(t);
              handleNavigate('rentedit', t);
            }}
          />
        )}

        {currentPage === 'waterallpage' && (
          <WaterAllPageDisplay
            onNavigate={handleNavigate}
            onSelectTenant={(t) => {
              setCurrentTenant(t);
              handleNavigate('wateredit', t);
            }}
          />
        )}

        {currentPage === 'sendpayment' && <SendPaymentDisplay onNavigate={handleNavigate} />}

        {currentPage === 'infopage' && (
          <InfoPageDisplay onNavigate={handleNavigate} userRole={userRole} />
        )}

        {currentPage === 'passwordallpage' && (
          <PasswordAllPageDisplay onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  );
}
