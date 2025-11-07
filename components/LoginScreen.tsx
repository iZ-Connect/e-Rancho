import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ERanchoLogoIcon } from './common/ERanchoLogoIcon';
import { Footer } from './common/Footer';

export const LoginScreen: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = await login(cpf, pin);
    if (!user) {
      setError('CPF ou PIN inválidos. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-blue-dark font-sans">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-navy-blue shadow-2xl rounded-xl p-8">
            <div className="mx-auto w-24 h-24 mb-4">
              <ERanchoLogoIcon className="text-icon-white" />
            </div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">
                <span className="text-icon-white">e-</span>
                <span className="text-military-green-text">Rancho</span>
              </h1>
              <p className="text-neutral-gray mt-4">Entre com seu CPF e PIN de acesso.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  className="shadow-inner appearance-none rounded-lg w-full py-3 px-4 bg-navy-blue-dark text-neutral-gray leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-military-green transition duration-200 placeholder-neutral-gray-dark"
                  id="cpf"
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  className="shadow-inner appearance-none rounded-lg w-full py-3 px-4 bg-navy-blue-dark text-neutral-gray leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-military-green transition duration-200 placeholder-neutral-gray-dark"
                  id="pin"
                  type="password"
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs text-center italic">{error}</p>}
              <div>
                <button
                  className="bg-military-green hover:bg-military-green-dark text-icon-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 disabled:opacity-50 text-lg"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Autenticando...' : 'LOGIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};