import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Layout/Header';
import { Lock, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple authentication (in production, use proper authentication)
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('coordinator-authenticated', 'true');
      navigate('/coordinator');
    } else {
      setError('Credenciais inválidas');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Acesso do Coordenador" />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Área Restrita
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Acesso exclusivo para coordenadores pedagógicos
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Usuário
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Usuário"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Senha"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Demo: usuário <code className="bg-gray-100 px-1 py-0.5 rounded">admin</code> senha <code className="bg-gray-100 px-1 py-0.5 rounded">admin123</code>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};