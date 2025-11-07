import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import { LoginScreen } from './components/LoginScreen';
import { MilitarView } from './components/MilitarView';
import { FiscSuView } from './components/FiscSuView';
import { AdmLocalView } from './components/AdmLocalView';
import { Header } from './components/common/Header';
import { Spinner } from './components/common/Spinner';
import { Footer } from './components/common/Footer';

const PendingApprovalScreen: React.FC = () => {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center p-8">
                <h2 className="text-2xl font-bold text-military-green mb-4">Aguardando Aprovação</h2>
                <p className="text-neutral-gray max-w-md">Sua conta foi criada e está aguardando a aprovação de um administrador. Por favor, tente novamente mais tarde.</p>
                <button 
                    onClick={logout}
                    className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Sair
                </button>
            </main>
            <Footer />
        </div>
    );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (user && user.status === 'pending') {
      return <PendingApprovalScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }
  
  const renderViewByRole = () => {
    switch (user.perfil) {
      case UserRole.MILITAR:
        return <MilitarView />;
      case UserRole.FISC_SU:
        return <FiscSuView />;
      case UserRole.ADM_LOCAL:
      case UserRole.ADM_GERAL:
        return <AdmLocalView />;
      default:
        return <div className="p-8 text-red-500">Perfil de usuário não reconhecido.</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto">
        {renderViewByRole()}
      </main>
      <Footer />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;