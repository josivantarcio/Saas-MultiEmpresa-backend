'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  incrementQuantity, 
  decrementQuantity, 
  removeFromCart 
} from '@/redux/features/cartSlice';
import { RootState } from '@/redux/store';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';

export default function CarrinhoPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [subtotal, setSubtotal] = useState(0);
  const [frete, setFrete] = useState(0);
  const [total, setTotal] = useState(0);
  const [cupom, setCupom] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(false);
  const [desconto, setDesconto] = useState(0);
  const [cepEntrega, setCepEntrega] = useState('');
  const [cepError, setCepError] = useState('');

  // Calcular valores do carrinho
  useEffect(() => {
    const novoSubtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setSubtotal(novoSubtotal);
    
    // Calcular frete (simulação)
    const novoFrete = novoSubtotal > 200 ? 0 : 15.90;
    setFrete(novoFrete);
    
    // Calcular total
    setTotal(novoSubtotal + novoFrete - desconto);
  }, [cartItems, desconto]);

  const handleIncrementQuantity = (id: string) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecrementQuantity = (id: string) => {
    dispatch(decrementQuantity(id));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleAplicarCupom = () => {
    if (cupom.toUpperCase() === 'DESCONTO10') {
      const novoDesconto = subtotal * 0.1; // 10% de desconto
      setDesconto(novoDesconto);
      setCupomAplicado(true);
    } else {
      setDesconto(0);
      setCupomAplicado(false);
      alert('Cupom inválido');
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleCalcularFrete = () => {
    // Validar CEP (formato brasileiro: 00000-000)
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    
    if (!cepRegex.test(cepEntrega)) {
      setCepError('CEP inválido. Use o formato 00000-000');
      return;
    }
    
    setCepError('');
    
    // Simulação de cálculo de frete baseado no CEP
    // Em um cenário real, isso seria uma chamada de API
    const valorFrete = subtotal > 200 ? 0 : 15.90;
    setFrete(valorFrete);
    
    // Atualizar o total
    setTotal(subtotal + valorFrete - desconto);
  };

  const handleContinuar = () => {
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }
    
    router.push('/checkout/entrega');
  };

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

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCepEntrega(formatCEP(e.target.value));
    setCepError('');
  };

  return (
    <CheckoutLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de produtos */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Carrinho de Compras</h2>
          
          {cartItems.length === 0 ? (
            <div className="bg-gray-50 p-6 text-center rounded-lg">
              <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
              <Link 
                href="/produtos" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Continuar Comprando
              </Link>
            </div>
          ) : (
            <div className="border-t border-gray-200 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="py-6 flex">
                  <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          <Link href={`/produtos/${item.id}`}>{item.name}</Link>
                        </h3>
                        <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleDecrementQuantity(item.id)}
                          disabled={item.quantity <= 1}
                          className={`p-1 rounded-md ${
                            item.quantity <= 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="mx-2 text-gray-700">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleIncrementQuantity(item.id)}
                          className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="font-medium text-purple-600 hover:text-purple-500"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <Link
              href="/produtos"
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              <span aria-hidden="true">&larr;</span> Continuar Comprando
            </Link>
          </div>
        </div>

        {/* Resumo do pedido */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-base text-gray-900">
                <p>Subtotal</p>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              
              {/* Cálculo de frete */}
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  Calcular Frete
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={cepEntrega}
                    onChange={handleCepChange}
                    maxLength={9}
                    placeholder="00000-000"
                    className={`block w-full rounded-l-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                      cepError ? 'border-red-300' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleCalcularFrete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Calcular
                  </button>
                </div>
                {cepError && (
                  <p className="mt-1 text-sm text-red-600">{cepError}</p>
                )}
              </div>
              
              <div className="flex justify-between text-base text-gray-900">
                <p>Frete</p>
                <p>{frete === 0 ? 'Grátis' : formatCurrency(frete)}</p>
              </div>
              
              {/* Cupom de desconto */}
              <div>
                <label htmlFor="cupom" className="block text-sm font-medium text-gray-700 mb-1">
                  Cupom de Desconto
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="cupom"
                    name="cupom"
                    value={cupom}
                    onChange={(e) => setCupom(e.target.value)}
                    disabled={cupomAplicado}
                    placeholder="DESCONTO10"
                    className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAplicarCupom}
                    disabled={cupomAplicado}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white ${
                      cupomAplicado
                        ? 'bg-green-600'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                  >
                    {cupomAplicado ? 'Aplicado' : 'Aplicar'}
                  </button>
                </div>
                {cupomAplicado && (
                  <p className="mt-1 text-sm text-green-600">
                    Cupom aplicado: -{formatCurrency(desconto)}
                  </p>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>{formatCurrency(total)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Impostos inclusos e frete calculado no checkout
                </p>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleContinuar}
                  disabled={cartItems.length === 0}
                  className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                    cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Continuar para Entrega
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
