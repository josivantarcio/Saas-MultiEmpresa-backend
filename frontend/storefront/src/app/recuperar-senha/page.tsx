'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StoreLayout from '@/components/layout/StoreLayout';
import { toast } from 'react-toastify';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const validateEmail = () => {
    if (!email) {
      setError('E-mail é obrigatório');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('E-mail inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulação de envio de e-mail (em um cenário real, isso seria uma chamada de API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação de sucesso
      setEmailSent(true);
      toast.success('E-mail de recuperação enviado com sucesso!');
    } catch (error) {
      toast.error('Falha ao enviar e-mail de recuperação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoltar = () => {
    router.push('/login');
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
              <p className="text-sm text-gray-600 mt-2">
                {!emailSent 
                  ? 'Informe seu e-mail para receber as instruções de recuperação de senha'
                  : 'Enviamos um e-mail com instruções para recuperar sua senha'
                }
              </p>
            </div>
            
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <Link href="/login" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                    Voltar para o login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        E-mail enviado com sucesso para {email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-6">
                    Verifique sua caixa de entrada e siga as instruções no e-mail para redefinir sua senha. Se não encontrar o e-mail, verifique também sua pasta de spam.
                  </p>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    O link de recuperação expira em 1 hora por motivos de segurança.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleVoltar}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Voltar para o login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
