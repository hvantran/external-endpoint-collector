import React, { useEffect, useRef, useState } from 'react';
import { AppSwitcher, AppSwitcherItem, AppTopBar, SearchBar } from '@hvantran/ui-component-library';
import { User, LogOut } from 'lucide-react';

const APP_ENVIRONMENT_VARIABLES = (window as any)._env_ || {};

let pages: Array<{ name: string; link: string; uiName: string }> = [];
try {
  pages = JSON.parse(`${APP_ENVIRONMENT_VARIABLES.REACT_APP_PAGES || '[]'}`);
} catch (e) {
  pages = [];
}

export interface ResponsiveAppBarProps {
  toggleDarkMode?: boolean;
  setToggleDarkMode?: () => void;
}

export default function PrimarySearchAppBar({
  toggleDarkMode = false,
  setToggleDarkMode,
}: ResponsiveAppBarProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    const gatewayBaseUrl =
      APP_ENVIRONMENT_VARIABLES.REACT_APP_GATEWAY_URL ||
      APP_ENVIRONMENT_VARIABLES.REACT_APP_ENDPOINT_MANAGER_BACKEND_URL?.replace('/api/ext-endpoint-collector', '') ||
      'http://localhost:6081';
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${gatewayBaseUrl}/logout?redirect_uri=${redirectUri}`;
  };

  const platformApps: AppSwitcherItem[] = [
    {
      id: 'template-manager',
      name: APP_ENVIRONMENT_VARIABLES.REACT_APP_TEMPLATE_MANAGER_NAME || 'Templates',
      url: `${APP_ENVIRONMENT_VARIABLES.REACT_APP_TEMPLATE_MANAGER_FRONTEND_URL || ''}/templates`,
      iconSrc: '/template-manager.png',
    },
    {
      id: 'action-manager',
      name: APP_ENVIRONMENT_VARIABLES.REACT_APP_ACTION_MANAGER_NAME || 'Actions',
      url: `${APP_ENVIRONMENT_VARIABLES.REACT_APP_ACTION_MANAGER_FRONTEND_URL || ''}/actions`,
      iconSrc: '/action-manager.png',
    },
    {
      id: 'endpoint-collector',
      name: APP_ENVIRONMENT_VARIABLES.REACT_APP_ENDPOINT_MANAGER_NAME || 'Collector',
      url: `${APP_ENVIRONMENT_VARIABLES.REACT_APP_ENDPOINT_MANAGER_FRONTEND_URL || ''}/endpoints`,
      iconSrc: '/data-collection.png',
    },
    {
      id: 'exam-integrity',
      name: APP_ENVIRONMENT_VARIABLES.REACT_APP_EXAM_INTEGRITY_NAME || 'Exam Integrity',
      url: `${APP_ENVIRONMENT_VARIABLES.REACT_APP_EXAM_INTEGRITY_FRONTEND_URL || ''}/`,
      iconSrc: '/exam-integrity.png',
    },
  ];

  const appSwitcher = (
    <AppSwitcher
      items={platformApps}
      currentAppId="endpoint-collector"
      onNavigate={(app) => {
        window.location.href = app.url;
      }}
    />
  );

  const userProfile = (
    <div className="relative" ref={profileRef}>
      <button
        type="button"
        title="User menu"
        aria-label="User menu"
        onClick={() => setIsProfileMenuOpen((prev) => !prev)}
        className="p-2 rounded-btn text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
      >
        <User className="w-5 h-5" />
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 p-2 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-surface-card-light dark:bg-surface-card-dark shadow-xl z-50">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/40 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <AppTopBar
        title={
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
              {APP_ENVIRONMENT_VARIABLES.REACT_APP_NAME || 'Data Collection'}
            </span>
            <nav className="hidden md:flex items-center gap-2">
              {pages.map((page) => (
                <a
                  key={page.name}
                  href={page.link}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  {page.uiName}
                </a>
              ))}
            </nav>
          </div>
        }
        onMenuToggle={() => setIsMobileNavOpen((prev) => !prev)}
        isDarkMode={toggleDarkMode}
        onThemeToggle={setToggleDarkMode}
        searchSlot={
          <div className="w-full">
            <SearchBar
              value=""
              placeholder="Search..."
              className="w-full"
              onChange={() => {}}
            />
          </div>
        }
        actionsSlot={appSwitcher}
        userSlot={userProfile}
      />

      {/* Mobile nav dropdown */}
      {isMobileNavOpen && (
        <div className="md:hidden border-b border-secondary-200 dark:border-secondary-800 bg-surface-card-light dark:bg-surface-card-dark px-4 py-3 flex flex-col gap-2 shadow-sm">
          {pages.map((page) => (
            <a
              key={page.name}
              href={page.link}
              className="px-3 py-2 rounded-md text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800"
            >
              {page.uiName}
            </a>
          ))}
        </div>
      )}
    </>
  );
}