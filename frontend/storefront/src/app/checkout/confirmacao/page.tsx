'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '@/redux/features/cartSlice';
import { RootState } from '@/redux/store';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import Link from 'next/link';
import Image from 'next/image';

export default function ConfirmacaoPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [pedidoNumero, setPedidoNumero] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  
  // Calcular subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  // Calcular frete (simulação)
  const frete = subtotal > 200 ? 0 : 15.90;
  
  // Calcular total
  const total = subtotal + frete;
  
  // Gerar número do pedido e data de entrega estimada
  useEffect(() => {
    // Gerar número de pedido aleatório
    const numeroPedido = Math.floor(100000 + Math.random() * 900000).toString();
    setPedidoNumero(numeroPedido);
    
    // Calcular data de entrega estimada (7 dias úteis a partir de hoje)
    const hoje = new Date();
    const dataEntregaEstimada = new Date(hoje);
    dataEntregaEstimada.setDate(hoje.getDate() + 7);
    
    // Formatar data no padrão brasileiro
    const dataFormatada = dataEntregaEstimada.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    setDataEntrega(dataFormatada);
    
    // Limpar o carrinho após a confirmação do pedido
    dispatch(clearCart());
  }, [dispatch]);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Se não houver número de pedido, redirecionar para o carrinho
  if (!pedidoNumero) {
    return null;
  }
  
  return (
    <CheckoutLayout>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
          <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Pedido Confirmado!</h2>
        <p className="mt-2 text-lg text-gray-600">
          Obrigado por sua compra. Seu pedido foi processado com sucesso.
        </p>
        
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <div className="text-left">
            <h3 className="text-lg font-medium text-gray-900">Informações do Pedido</h3>
            
            <dl className="mt-4 space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-600">Número do Pedido</dt>
                <dd className="text-sm font-bold text-gray-900">#{pedidoNumero}</dd>
              </div>
              
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-600">Data</dt>
                <dd className="text-sm text-gray-900">{new Date().toLocaleDateString('pt-BR')}</dd>
              </div>
              
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-600">Entrega Estimada</dt>
                <dd className="text-sm text-gray-900">{dataEntrega}</dd>
              </div>
              
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-600">Total</dt>
                <dd className="text-sm font-bold text-gray-900">{formatCurrency(total)}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-lg font-medium text-gray-900">Acompanhe seu Pedido</h3>
          <p className="mt-2 text-sm text-gray-600">
            Um e-mail de confirmação foi enviado para o seu endereço de e-mail com os detalhes do pedido.
            Você também pode acompanhar o status do seu pedido na sua conta.
          </p>
          
          <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Link
              href="/minha-conta/pedidos"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Ver Meus Pedidos
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
        
        {/* Produtos comprados */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">Itens do Pedido</h3>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th scope="row" colSpan={2} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    Subtotal
                  </th>
                  <td className="px-6 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(subtotal)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" colSpan={2} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    Frete
                  </th>
                  <td className="px-6 py-3 text-right text-sm text-gray-900">
                    {frete === 0 ? 'Grátis' : formatCurrency(frete)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" colSpan={2} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    Total
                  </th>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
