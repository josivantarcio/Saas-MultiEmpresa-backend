'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';

interface EnderecoEntrega {
  nome: string;
  sobrenome: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  instrucoes: string;
}

interface FormErrors {
  nome?: string;
  sobrenome?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
}

export default function EntregaPage() {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  const [endereco, setEndereco] = useState<EnderecoEntrega>({
    nome: '',
    sobrenome: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    telefone: '',
    instrucoes: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Formatar CEP enquanto digita
  const formatCEP = (value: string) => {
    // Remove tudo que não é número
    const cepNumbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (cepNumbers.length <= 5) {
      return cepNumbers;
    } else {
      return `${cepNumbers.slice(0, 5)}-${cepNumbers.slice(5, 8)}`;
    }
  };
  
  // Formatar telefone enquanto digita
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cep') {
      setEndereco(prev => ({
        ...prev,
        [name]: formatCEP(value)
      }));
    } else if (name === 'telefone') {
      setEndereco(prev => ({
        ...prev,
        [name]: formatTelefone(value)
      }));
    } else {
      setEndereco(prev => ({
        ...prev,
        [name]: value
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
  
  const buscarEnderecoPorCEP = async () => {
    if (endereco.cep.length < 9) {
      setErrors(prev => ({
        ...prev,
        cep: 'CEP inválido'
      }));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulação de busca de CEP (em um cenário real, isso seria uma chamada de API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulação de dados de endereço
      const cepLimpo = endereco.cep.replace(/\D/g, '');
      if (cepLimpo === '12345678') {
        setEndereco(prev => ({
          ...prev,
          endereco: 'Avenida Brasil',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        }));
      } else {
        // Simulação de endereço genérico para qualquer CEP
        setEndereco(prev => ({
          ...prev,
          endereco: 'Rua Principal',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          estado: 'RJ'
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        cep: 'Erro ao buscar CEP'
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Validar campos obrigatórios
    if (!endereco.nome) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!endereco.sobrenome) {
      newErrors.sobrenome = 'Sobrenome é obrigatório';
    }
    
    if (!endereco.cep) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (endereco.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido';
    }
    
    if (!endereco.endereco) {
      newErrors.endereco = 'Endereço é obrigatório';
    }
    
    if (!endereco.numero) {
      newErrors.numero = 'Número é obrigatório';
    }
    
    if (!endereco.bairro) {
      newErrors.bairro = 'Bairro é obrigatório';
    }
    
    if (!endereco.cidade) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    
    if (!endereco.estado) {
      newErrors.estado = 'Estado é obrigatório';
    }
    
    if (!endereco.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (endereco.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Em um cenário real, salvaríamos os dados do endereço no estado global ou no backend
    // Por enquanto, apenas navegamos para a próxima etapa
    router.push('/checkout/pagamento');
  };
  
  const handleVoltar = () => {
    router.push('/checkout/carrinho');
  };
  
  // Verificar se há itens no carrinho
  if (cartItems.length === 0) {
    router.push('/checkout/carrinho');
    return null;
  }
  
  return (
    <CheckoutLayout>
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informações de Entrega</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Nome */}
            <div className="sm:col-span-3">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={endereco.nome}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.nome
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
                {errors.nome && (
                  <p className="mt-2 text-sm text-red-600">{errors.nome}</p>
                )}
              </div>
            </div>
            
            {/* Sobrenome */}
            <div className="sm:col-span-3">
              <label htmlFor="sobrenome" className="block text-sm font-medium text-gray-700">
                Sobrenome *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="sobrenome"
                  name="sobrenome"
                  value={endereco.sobrenome}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.sobrenome
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
                {errors.sobrenome && (
                  <p className="mt-2 text-sm text-red-600">{errors.sobrenome}</p>
                )}
              </div>
            </div>
            
            {/* CEP */}
            <div className="sm:col-span-3">
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                CEP *
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={endereco.cep}
                  onChange={handleChange}
                  maxLength={9}
                  className={`block w-full rounded-l-md shadow-sm sm:text-sm ${
                    errors.cep
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                  placeholder="00000-000"
                />
                <button
                  type="button"
                  onClick={buscarEnderecoPorCEP}
                  disabled={isLoading || endereco.cep.length < 9}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                    isLoading || endereco.cep.length < 9 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {errors.cep && (
                <p className="mt-2 text-sm text-red-600">{errors.cep}</p>
              )}
            </div>
            
            {/* Telefone */}
            <div className="sm:col-span-3">
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                Telefone *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={endereco.telefone}
                  onChange={handleChange}
                  maxLength={15}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.telefone
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                  placeholder="(00) 00000-0000"
                />
                {errors.telefone && (
                  <p className="mt-2 text-sm text-red-600">{errors.telefone}</p>
                )}
              </div>
            </div>
            
            {/* Endereço */}
            <div className="sm:col-span-4">
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                Endereço *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={endereco.endereco}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.endereco
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
                {errors.endereco && (
                  <p className="mt-2 text-sm text-red-600">{errors.endereco}</p>
                )}
              </div>
            </div>
            
            {/* Número */}
            <div className="sm:col-span-2">
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                Número *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={endereco.numero}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.numero
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
                {errors.numero && (
                  <p className="mt-2 text-sm text-red-600">{errors.numero}</p>
                )}
              </div>
            </div>
            
            {/* Complemento */}
            <div className="sm:col-span-6">
              <label htmlFor="complemento" className="block text-sm font-medium text-gray-700">
                Complemento
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="complemento"
                  name="complemento"
                  value={endereco.complemento}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Apartamento, bloco, referência, etc."
                />
              </div>
            </div>
            
            {/* Bairro */}
            <div className="sm:col-span-2">
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                Bairro *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={endereco.bairro}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.bairro
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
                {errors.bairro && (
                  <p className="mt-2 text-sm text-red-600">{errors.bairro}</p>
                )}
              </div>
            </div>
            
            {/* Cidade */}
            <div className="sm:col-span-2">
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                Cidade *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={endereco.cidade}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.cidade
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
                {errors.cidade && (
                  <p className="mt-2 text-sm text-red-600">{errors.cidade}</p>
                )}
              </div>
            </div>
            
            {/* Estado */}
            <div className="sm:col-span-2">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                Estado *
              </label>
              <div className="mt-1">
                <select
                  id="estado"
                  name="estado"
                  value={endereco.estado}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.estado
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
                {errors.estado && (
                  <p className="mt-2 text-sm text-red-600">{errors.estado}</p>
                )}
              </div>
            </div>
            
            {/* Instruções de entrega */}
            <div className="sm:col-span-6">
              <label htmlFor="instrucoes" className="block text-sm font-medium text-gray-700">
                Instruções para entrega
              </label>
              <div className="mt-1">
                <textarea
                  id="instrucoes"
                  name="instrucoes"
                  rows={3}
                  value={endereco.instrucoes}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Informações adicionais para o entregador"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handleVoltar}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Voltar para o Carrinho
            </button>
            
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Continuar para Pagamento
            </button>
          </div>
        </form>
      </div>
    </CheckoutLayout>
  );
}
