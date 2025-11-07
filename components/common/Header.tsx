import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ERanchoLogoIcon } from './ERanchoLogoIcon';

const LogoutIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);


export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-navy-blue-dark p-4 shadow-lg flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <ERanchoLogoIcon className="w-12 h-12 text-icon-white" />
        <div>
           <h1 className="text-xl md:text-2xl font-bold">
                <span className="text-icon-white">e-</span>
                <span className="text-military-green-text">Rancho</span>
            </h1>
          <p className="text-sm text-neutral-gray">Sistema de Arranchamento</p>
        </div>
      </div>
      {user && (
        <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
                <p className="font-semibold text-icon-white">{user.nome_guerra || user.nome}</p>
                <p className="text-xs text-neutral-gray">{user.cpf}</p>
            </div>
            <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-full transition duration-300"
                aria-label="Logout"
            >
                <LogoutIcon />
            </button>
        </div>
      )}
    </header>
  );
};