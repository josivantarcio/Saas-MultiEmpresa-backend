'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import Image from 'next/image';

interface FormaPagamento {
  tipo: 'cartao' | 'boleto' | 'pix';
  cartao?: {
    numero: string;
    nome: string;
    validade: string;
    cvv: string;
    parcelas: number;
  };
}

interface FormErrors {
  tipo?: string;
  'cartao.numero'?: string;
  'cartao.nome'?: string;
  'cartao.validade'?: string;
  'cartao.cvv'?: string;
}

export default function PagamentoPage() {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>({
    tipo: 'cartao',
    cartao: {
      numero: '',
      nome: '',
      validade: '',
      cvv: '',
      parcelas: 1
    }
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Calcular subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  // Calcular frete (simulação)
  const frete = subtotal > 200 ? 0 : 15.90;
  
  // Calcular total
  const total = subtotal + frete;
  
  // Opções de parcelamento
  const opcoesParcelamento = [];
  const maxParcelas = 12;
  const valorMinimoParcela = 5;
  
  for (let i = 1; i <= maxParcelas; i++) {
    const valorParcela = total / i;
    if (valorParcela < valorMinimoParcela) break;
    
    const temJuros = i > 6;
    const taxaJuros = temJuros ? 0.0199 : 0; // 1.99% ao mês
    
    let valorParcelaComJuros = valorParcela;
    if (temJuros) {
      // Cálculo de juros compostos
      valorParcelaComJuros = total * (taxaJuros * Math.pow(1 + taxaJuros, i)) / (Math.pow(1 + taxaJuros, i) - 1);
    }
    
    opcoesParcelamento.push({
      parcelas: i,
      valor: valorParcelaComJuros,
      temJuros,
      texto: `${i}x de ${formatCurrency(valorParcelaComJuros)}${temJuros ? ' com juros' : ' sem juros'}`
    });
  }
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Formatar número do cartão enquanto digita
  const formatCartao = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < digitsOnly.length; i += 4) {
      groups.push(digitsOnly.slice(i, i + 4));
    }
    
    return groups.join(' ').substr(0, 19); // Limita a 16 dígitos + 3 espaços
  };
  
  // Formatar validade do cartão (MM/AA)
  const formatValidade = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    }
    
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tipo') {
      setFormaPagamento(prev => ({
        ...prev,
        tipo: value as 'cartao' | 'boleto' | 'pix'
      }));
      return;
    }
    
    if (name.startsWith('cartao.')) {
      const cartaoField = name.split('.')[1];
      
      if (cartaoField === 'numero') {
        setFormaPagamento(prev => ({
          ...prev,
          cartao: {
            ...prev.cartao!,
            numero: formatCartao(value)
          }
        }));
      } else if (cartaoField === 'validade') {
        setFormaPagamento(prev => ({
          ...prev,
          cartao: {
            ...prev.cartao!,
            validade: formatValidade(value)
          }
        }));
      } else if (cartaoField === 'parcelas') {
        setFormaPagamento(prev => ({
          ...prev,
          cartao: {
            ...prev.cartao!,
            parcelas: parseInt(value)
          }
        }));
      } else {
        setFormaPagamento(prev => ({
          ...prev,
          cartao: {
            ...prev.cartao!,
            [cartaoField]: value
          }
        }));
      }
      
      // Limpar erro quando o usuário começa a digitar
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (formaPagamento.tipo === 'cartao') {
      // Validar número do cartão
      if (!formaPagamento.cartao?.numero) {
        newErrors['cartao.numero'] = 'Número do cartão é obrigatório';
      } else if (formaPagamento.cartao.numero.replace(/\s/g, '').length < 16) {
        newErrors['cartao.numero'] = 'Número do cartão inválido';
      }
      
      // Validar nome no cartão
      if (!formaPagamento.cartao?.nome) {
        newErrors['cartao.nome'] = 'Nome no cartão é obrigatório';
      }
      
      // Validar validade
      if (!formaPagamento.cartao?.validade) {
        newErrors['cartao.validade'] = 'Data de validade é obrigatória';
      } else if (formaPagamento.cartao.validade.length < 5) {
        newErrors['cartao.validade'] = 'Data de validade inválida';
      } else {
        // Verificar se a data não está expirada
        const [mes, ano] = formaPagamento.cartao.validade.split('/');
        const dataValidade = new Date(2000 + parseInt(ano), parseInt(mes) - 1);
        const hoje = new Date();
        
        if (dataValidade < hoje) {
          newErrors['cartao.validade'] = 'Cartão expirado';
        }
      }
      
      // Validar CVV
      if (!formaPagamento.cartao?.cvv) {
        newErrors['cartao.cvv'] = 'Código de segurança é obrigatório';
      } else if (formaPagamento.cartao.cvv.length < 3) {
        newErrors['cartao.cvv'] = 'Código de segurança inválido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulação de processamento de pagamento (em um cenário real, isso seria uma chamada de API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirecionar para a página de confirmação
      router.push('/checkout/confirmacao');
    } catch (error) {
      alert('Erro ao processar pagamento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVoltar = () => {
    router.push('/checkout/entrega');
  };
  
  // Verificar se há itens no carrinho
  if (cartItems.length === 0) {
    router.push('/checkout/carrinho');
    return null;
  }
  
  // Determinar a bandeira do cartão com base nos primeiros dígitos
  const getBandeiraCartao = () => {
    if (!formaPagamento.cartao?.numero) return null;
    
    const numero = formaPagamento.cartao.numero.replace(/\s/g, '');
    
    if (numero.startsWith('4')) {
      return '/images/visa.svg';
    } else if (/^5[1-5]/.test(numero)) {
      return '/images/mastercard.svg';
    } else if (/^3[47]/.test(numero)) {
      return '/images/amex.svg';
    } else if (/^6(?:011|5)/.test(numero)) {
      return '/images/discover.svg';
    } else if (numero.length >= 4) {
      return '/images/generic-card.svg';
    }
    
    return null;
  };
  
  const bandeiraCartao = getBandeiraCartao();
  
  return (
    <CheckoutLayout>
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Forma de Pagamento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-base font-medium text-gray-900">Selecione a forma de pagamento</label>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                {/* Cartão de Crédito */}
                <div
                  className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${
                    formaPagamento.tipo === 'cartao'
                      ? 'border-purple-500 ring-2 ring-purple-500'
                      : 'border-gray-300'
                  }`}
                  onClick={() => setFormaPagamento(prev => ({ ...prev, tipo: 'cartao' }))}
                >
                  <div className="flex-1 flex">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Cartão de Crédito
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Pagamento em até 12x
                      </span>
                      <span className="mt-6 text-sm font-medium text-gray-900">
                        <div className="flex space-x-2">
                          <img src="/images/visa.svg" alt="Visa" className="h-6 w-auto" />
                          <img src="/images/mastercard.svg" alt="Mastercard" className="h-6 w-auto" />
                          <img src="/images/amex.svg" alt="American Express" className="h-6 w-auto" />
                        </div>
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="tipo"
                    value="cartao"
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    checked={formaPagamento.tipo === 'cartao'}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Boleto */}
                <div
                  className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${
                    formaPagamento.tipo === 'boleto'
                      ? 'border-purple-500 ring-2 ring-purple-500'
                      : 'border-gray-300'
                  }`}
                  onClick={() => setFormaPagamento(prev => ({ ...prev, tipo: 'boleto' }))}
                >
                  <div className="flex-1 flex">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Boleto Bancário
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Vencimento em 3 dias úteis
                      </span>
                      <span className="mt-6 text-sm font-medium text-gray-900">
                        <div className="flex">
                          <img src="/images/boleto.svg" alt="Boleto" className="h-6 w-auto" />
                        </div>
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="tipo"
                    value="boleto"
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    checked={formaPagamento.tipo === 'boleto'}
                    onChange={handleChange}
                  />
                </div>
                
                {/* PIX */}
                <div
                  className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${
                    formaPagamento.tipo === 'pix'
                      ? 'border-purple-500 ring-2 ring-purple-500'
                      : 'border-gray-300'
                  }`}
                  onClick={() => setFormaPagamento(prev => ({ ...prev, tipo: 'pix' }))}
                >
                  <div className="flex-1 flex">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        PIX
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Pagamento instantâneo
                      </span>
                      <span className="mt-6 text-sm font-medium text-gray-900">
                        <div className="flex">
                          <img src="/images/pix.svg" alt="PIX" className="h-6 w-auto" />
                        </div>
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="tipo"
                    value="pix"
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    checked={formaPagamento.tipo === 'pix'}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Formulário de Cartão de Crédito */}
            {formaPagamento.tipo === 'cartao' && (
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="cartao.numero" className="block text-sm font-medium text-gray-700">
                    Número do Cartão
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="cartao.numero"
                      name="cartao.numero"
                      value={formaPagamento.cartao?.numero || ''}
                      onChange={handleChange}
                      maxLength={19}
                      className={`block w-full pr-10 rounded-md ${
                        errors['cartao.numero']
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      } sm:text-sm`}
                      placeholder="0000 0000 0000 0000"
                    />
                    {bandeiraCartao && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <img src={bandeiraCartao} alt="Bandeira do cartão" className="h-5 w-auto" />
                      </div>
                    )}
                  </div>
                  {errors['cartao.numero'] && (
                    <p className="mt-2 text-sm text-red-600">{errors['cartao.numero']}</p>
                  )}
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="cartao.nome" className="block text-sm font-medium text-gray-700">
                    Nome no Cartão
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="cartao.nome"
                      name="cartao.nome"
                      value={formaPagamento.cartao?.nome || ''}
                      onChange={handleChange}
                      className={`block w-full rounded-md ${
                        errors['cartao.nome']
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      } sm:text-sm`}
                      placeholder="Nome como está no cartão"
                    />
                  </div>
                  {errors['cartao.nome'] && (
                    <p className="mt-2 text-sm text-red-600">{errors['cartao.nome']}</p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="cartao.validade" className="block text-sm font-medium text-gray-700">
                    Validade (MM/AA)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="cartao.validade"
                      name="cartao.validade"
                      value={formaPagamento.cartao?.validade || ''}
                      onChange={handleChange}
                      maxLength={5}
                      className={`block w-full rounded-md ${
                        errors['cartao.validade']
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      } sm:text-sm`}
                      placeholder="MM/AA"
                    />
                  </div>
                  {errors['cartao.validade'] && (
                    <p className="mt-2 text-sm text-red-600">{errors['cartao.validade']}</p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="cartao.cvv" className="block text-sm font-medium text-gray-700">
                    Código de Segurança (CVV)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="cartao.cvv"
                      name="cartao.cvv"
                      value={formaPagamento.cartao?.cvv || ''}
                      onChange={handleChange}
                      maxLength={4}
                      className={`block w-full rounded-md ${
                        errors['cartao.cvv']
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      } sm:text-sm`}
                      placeholder="123"
                    />
                  </div>
                  {errors['cartao.cvv'] && (
                    <p className="mt-2 text-sm text-red-600">{errors['cartao.cvv']}</p>
                  )}
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="cartao.parcelas" className="block text-sm font-medium text-gray-700">
                    Parcelamento
                  </label>
                  <div className="mt-1">
                    <select
                      id="cartao.parcelas"
                      name="cartao.parcelas"
                      value={formaPagamento.cartao?.parcelas || 1}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    >
                      {opcoesParcelamento.map(opcao => (
                        <option key={opcao.parcelas} value={opcao.parcelas}>
                          {opcao.texto}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Informações para Boleto */}
            {formaPagamento.tipo === 'boleto' && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Informações sobre o Boleto</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>O boleto será gerado após a confirmação do pedido</li>
                        <li>O prazo de vencimento é de 3 dias úteis</li>
                        <li>O pedido será confirmado apenas após a compensação do pagamento</li>
                        <li>O boleto será enviado para o seu e-mail</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Informações para PIX */}
            {formaPagamento.tipo === 'pix' && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Informações sobre o PIX</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>O QR Code do PIX será gerado após a confirmação do pedido</li>
                        <li>O pagamento é processado instantaneamente</li>
                        <li>O QR Code tem validade de 30 minutos</li>
                        <li>Você também receberá o código PIX por e-mail</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Resumo do pedido */}
          <div className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900">Resumo do Pedido</h2>
            
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</dd>
              </div>
              
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Frete</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {frete === 0 ? 'Grátis' : formatCurrency(frete)}
                </dd>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Total</dt>
                <dd className="text-base font-medium text-gray-900">{formatCurrency(total)}</dd>
              </div>
            </dl>
          </div>
          
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handleVoltar}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Voltar para Entrega
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processando...' : 'Finalizar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </CheckoutLayout>
  );
}
