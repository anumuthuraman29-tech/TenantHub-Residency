/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AestheticBackground, BackgroundTheme } from './components/AestheticBackground';
import { ThemePalette } from './components/ThemePalette';
import { DatabaseService } from './services/dbStore';
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
import { RentAllPageDisplay } from './components/pages/RentAllPageDisplay';
import { WaterAllPageDisplay } from './components/pages/WaterAllPageDisplay';
import { RentEditDisplay } from './components/pages/RentEditDisplay';
import { WaterEditDisplay } from './components/pages/WaterEditDisplay';
import { RentPageDisplay, WaterBillPageDisplay } from './components/pages/CustomerViewsDisplay';
import { SendPaymentDisplay } from './components/pages/SendPaymentDisplay';
import { InfoPageDisplay, PasswordAllPageDisplay } from './components/pages/OtherPagesDisplay';

import { Building2 } from 'lucide-react';
import { initializeSupabaseRealtime } from './services/supabaseRealtime';
import tenantHubLogo from './assets/images/tenant_hub_logo.png';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [userRole, setUserRole] = useState<'Admin' | 'Customer'>('Customer');
  const [currentTenant, setCurrentTenant] = useState<string>('11');
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

  useEffect(() => {
    DatabaseService.syncFromSupabase();
    const unsubscribe = initializeSupabaseRealtime();
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (role: 'Admin' | 'Customer', tenantNumber?: string) => {
    setUserRole(role);
    if (role === 'Customer') {
      setCurrentTenant(tenantNumber || '11');
      setCurrentPage('customermainpage');
    } else {
      setCurrentPage('adminmainpage');
    }
  };

  const handleLogout = () => {
    setCurrentPage('login');
  };

  const tenantName = userRole === 'Customer' ? DatabaseService.getTenantResidentName(currentTenant) : 'Administrator';

  return (
    <div data-theme={bgTheme} className="relative min-h-screen text-white flex flex-col font-sans">
      {/* Aesthetic Animated Background System */}
      <AestheticBackground theme={bgTheme} />

      {/* Modern Midnight + Teal Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/90 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 backdrop-blur-xl shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
                className="text-xs px-3.5 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-full border border-slate-700 hover:border-red-500/30 transition font-semibold"
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
            onNavigate={setCurrentPage}
          />
        )}

            {currentPage === 'customerloginpage' && (
              <CustomerLoginPage
                onLoginSuccess={handleLoginSuccess}
                onSwitchMode={() => setCurrentPage('adminloginpage')}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'adminloginpage' && (
              <AdminLoginPage
                onLoginSuccess={handleLoginSuccess}
                onSwitchMode={() => setCurrentPage('customerloginpage')}
                onNavigate={setCurrentPage}
              />
            )}

            {(currentPage === 'customermainpage' || currentPage === 'mainpage') && (
              <CustomerMainPageDisplay
                tenantNumber={currentTenant}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
              />
            )}

            {currentPage === 'adminmainpage' && (
              <AdminMainPageDisplay onNavigate={setCurrentPage} onLogout={handleLogout} />
            )}

            {currentPage === 'paymentpage' && (
              <PaymentPageDisplay
                tenantNumber={currentTenant}
                onNavigate={setCurrentPage}
                userRole={userRole}
              />
            )}

            {currentPage === 'paypage' && (
              <PayPageDisplay
                tenantNumber={currentTenant}
                onNavigate={setCurrentPage}
                userRole={userRole}
              />
            )}

            {currentPage === 'customerinfo' && (
              <CustomerInfoDisplay
                tenantNumber={currentTenant}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'infoallpage' && (
              <InfoAllPageDisplay
                onNavigate={setCurrentPage}
                onSelectTenant={setCurrentTenant}
              />
            )}

            {currentPage === 'infoeditpage' && (
              <InfoEditDisplay
                initialTenantNumber={currentTenant}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'adminpaymentverify' && (
              <AdminPaymentVerifyDisplay
                onNavigate={setCurrentPage}
                onLogout={() => {
                  setUserRole('Customer');
                  setCurrentPage('login');
                }}
              />
            )}

            {currentPage === 'adminmaintenance' && (
              <AdminMaintenanceDisplay
                onNavigate={setCurrentPage}
                onLogout={() => {
                  setUserRole('Customer');
                  setCurrentPage('login');
                }}
              />
            )}

            {currentPage === 'adminannouncements' && (
              <AdminAnnouncementsDisplay
                onNavigate={setCurrentPage}
                onLogout={() => {
                  setUserRole('Customer');
                  setCurrentPage('login');
                }}
              />
            )}

            {currentPage === 'adminnotifications' && (
              <AdminNotificationsDisplay
                onNavigate={setCurrentPage}
                onLogout={() => {
                  setUserRole('Customer');
                  setCurrentPage('login');
                }}
              />
            )}

            {currentPage === 'rentpage' && (
              <RentPageDisplay tenantNumber={currentTenant} onNavigate={setCurrentPage} />
            )}

            {currentPage === 'waterbillpage' && (
              <WaterBillPageDisplay tenantNumber={currentTenant} onNavigate={setCurrentPage} />
            )}

            {currentPage === 'rentedit' && (
              <RentEditDisplay
                initialTenantNumber={currentTenant}
                userRole={userRole}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'wateredit' && (
              <WaterEditDisplay
                initialTenantNumber={currentTenant}
                userRole={userRole}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'rentallpage' && (
              <RentAllPageDisplay
                onNavigate={setCurrentPage}
                onSelectTenant={setCurrentTenant}
              />
            )}

            {currentPage === 'waterallpage' && (
              <WaterAllPageDisplay
                onNavigate={setCurrentPage}
                onSelectTenant={setCurrentTenant}
              />
            )}

            {currentPage === 'sendpayment' && <SendPaymentDisplay onNavigate={setCurrentPage} />}

            {currentPage === 'infopage' && (
              <InfoPageDisplay onNavigate={setCurrentPage} userRole={userRole} />
            )}

            {currentPage === 'passwordallpage' && (
              <PasswordAllPageDisplay onNavigate={setCurrentPage} />
            )}
      </main>
    </div>
  );
}
