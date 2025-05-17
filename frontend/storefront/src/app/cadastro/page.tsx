'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StoreLayout from '@/components/layout/StoreLayout';
import { toast } from 'react-toastify';

interface FormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cpf: string;
  telefone: string;
  aceitarTermos: boolean;
  receberNovidades: boolean;
}

interface FormErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  cpf?: string;
  telefone?: string;
  aceitarTermos?: string;
}

export default function CadastroPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    telefone: '',
    aceitarTermos: false,
    receberNovidades: true
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Função para formatar CPF enquanto o usuário digita
  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const cpfNumbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (cpfNumbers.length <= 3) {
      return cpfNumbers;
    } else if (cpfNumbers.length <= 6) {
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3)}`;
    } else if (cpfNumbers.length <= 9) {
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3, 6)}.${cpfNumbers.slice(6)}`;
    } else {
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3, 6)}.${cpfNumbers.slice(6, 9)}-${cpfNumbers.slice(9, 11)}`;
    }
  };

  // Função para formatar telefone enquanto o usuário digita
  const formatTelefone = (value: string) => {
    // Remove tudo que não é número
    const phoneNumbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (phoneNumbers.length <= 2) {
      return `(${phoneNumbers}`;
    } else if (phoneNumbers.length <= 6) {
      return `(${phoneNumbers.slice(0, 2)}) ${phoneNumbers.slice(2)}`;
    } else if (phoneNumbers.length <= 10) {
      return `(${phoneNumbers.slice(0, 2)}) ${phoneNumbers.slice(2, 6)}-${phoneNumbers.slice(6)}`;
    } else {
      return `(${phoneNumbers.slice(0, 2)}) ${phoneNumbers.slice(2, 7)}-${phoneNumbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Para campos com formatação especial
    if (name === 'cpf') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCPF(value)
      }));
    } else if (name === 'telefone') {
      setFormData(prev => ({
        ...prev,
        [name]: formatTelefone(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Limpar erro quando o usuário começa a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Validar nome
    if (!formData.nome) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }
    
    // Validar CPF
    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (!cpfClean) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (cpfClean.length !== 11) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Validar telefone
    const phoneClean = formData.telefone.replace(/\D/g, '');
    if (!phoneClean) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (phoneClean.length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }
    
    // Validar termos
    if (!formData.aceitarTermos) {
      newErrors.aceitarTermos = 'Você precisa aceitar os termos para continuar';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulação de cadastro (em um cenário real, isso seria uma chamada de API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação de sucesso
      toast.success('Cadastro realizado com sucesso! Você já pode fazer login.');
      
      // Redirecionar para a página de login após o cadastro
      router.push('/login');
    } catch (error) {
      toast.error('Falha ao realizar o cadastro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Criar uma conta</h1>
              <p className="text-sm text-gray-600 mt-2">
                Preencha o formulário abaixo para criar sua conta na EcomSaaS Store
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome completo */}
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo *
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    value={formData.nome}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                      errors.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
                  )}
                </div>
                
                {/* E-mail */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                {/* CPF */}
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF *
                  </label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    autoComplete="off"
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                      errors.cpf ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
                  )}
                </div>
                
                {/* Telefone */}
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="text"
                    autoComplete="tel"
                    value={formData.telefone}
                    onChange={handleChange}
                    maxLength={15}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                      errors.telefone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>
                  )}
                </div>
                
                {/* Senha */}
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="new-password"
                    value={formData.senha}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                      errors.senha ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.senha && (
                    <p className="mt-1 text-sm text-red-600">{errors.senha}</p>
                  )}
                </div>
                
                {/* Confirmar senha */}
                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar senha *
                  </label>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                      errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.confirmarSenha && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha}</p>
                  )}
                </div>
              </div>
              
              {/* Termos e condições */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="aceitarTermos"
                      name="aceitarTermos"
                      type="checkbox"
                      checked={formData.aceitarTermos}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="aceitarTermos" className="font-medium text-gray-700">
                      Eu concordo com os{' '}
                      <Link href="/termos" className="text-purple-600 hover:text-purple-500">
                        Termos de Uso
                      </Link>{' '}
                      e{' '}
                      <Link href="/privacidade" className="text-purple-600 hover:text-purple-500">
                        Política de Privacidade
                      </Link>
                    </label>
                    {errors.aceitarTermos && (
                      <p className="mt-1 text-sm text-red-600">{errors.aceitarTermos}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="receberNovidades"
                      name="receberNovidades"
                      type="checkbox"
                      checked={formData.receberNovidades}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="receberNovidades" className="font-medium text-gray-700">
                      Desejo receber ofertas, novidades e conteúdos exclusivos
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Cadastrando...' : 'Criar conta'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                    Faça login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
