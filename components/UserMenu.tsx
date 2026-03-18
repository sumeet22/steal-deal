import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';
import { UserCircleIcon, LogoutIcon, PlusIcon } from './Icons';

interface UserMenuProps {
  onNavigateToAuth: (authView: 'login' | 'register') => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onNavigateToAuth }) => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setCurrentUser(null, null);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500/50 transition-all active:scale-95"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="p-1 rounded-full bg-brand-500 text-white shadow-sm">
          <UserCircleIcon />
        </div>
        {currentUser?.name && <span className="hidden sm:inline text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{currentUser.name.split(' ')[0]}</span>}
        {!currentUser && <span className="hidden sm:inline text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Account</span>}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-64 glass shadow-2xl rounded-3xl overflow-hidden ring-1 ring-black/5 z-50 origin-top-right transition-all duration-300"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="p-2">
            {!currentUser ? (
              <>
                <a
                  key="login"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToAuth('login');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-4 px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-2xl transition-all group"
                  role="menuitem"
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-none">Sign In</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Access your orders</span>
                  </div>
                </a>
                <a
                  key="register"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToAuth('register');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-4 px-5 py-4 text-sm font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-2xl transition-all group"
                  role="menuitem"
                >
                  <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/30 group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-none">Register</span>
                    <span className="text-[10px] text-brand-400 dark:text-brand-500 font-medium">Create new account</span>
                  </div>
                </a>
              </>
            ) : (
              <>
                <div className="border-t border-slate-100 dark:border-slate-800 my-2 mx-5"></div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="flex items-center gap-4 px-5 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all group"
                  role="menuitem"
                >
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <LogoutIcon className="w-5 h-5" />
                  </div>
                  <span>Sign Out</span>
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
