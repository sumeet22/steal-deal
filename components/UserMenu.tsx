import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';
import { UserCircleIcon, LogoutIcon } from './Icons';

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
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <UserCircleIcon />
        {currentUser && <span className="hidden sm:inline text-sm font-medium">{currentUser.name}</span>}
      </button>

      {isOpen && (
        <div 
            className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-fade-in"
            role="menu"
            aria-orientation="vertical"
        >
          <div className="py-1">
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
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <UserCircleIcon/>
                  <span>Login</span>
                </a>
                <a
                  key="register"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToAuth('register');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <UserCircleIcon/>
                  <span>Register</span>
                </a>
              </>
            ) : (
              <> 
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                 <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                >
                   <LogoutIcon />
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
