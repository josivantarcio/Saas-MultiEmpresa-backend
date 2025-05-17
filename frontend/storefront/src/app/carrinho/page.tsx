'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StoreLayout from '@/components/layout/StoreLayout';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { useAppSelector } from '@/redux/hooks';

export default function CartPage() {
  const { items, total, quantity } = useAppSelector((state) => state.cart);
  const [isClient, setIsClient] = useState(false);

  // Evita erro de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Meu Carrinho</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span>Carrinho</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="w-20 h-20 text-gray-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Seu carrinho está vazio</h2>
              <p className="text-gray-500 mb-8">
                Parece que você ainda não adicionou nenhum produto ao seu carrinho.
              </p>
              <Link
                href="/produtos"
                className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
              >
                Explorar Produtos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de itens do carrinho */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Itens do Carrinho ({quantity})
                </h2>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      quantity={item.quantity}
                    />
                  ))}
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <Link
                    href="/"
                    className="text-purple-600 hover:text-purple-700 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      ></path>
                    </svg>
                    Continuar Comprando
                  </Link>
                  
                  <span className="text-gray-600">
                    Subtotal:{' '}
                    <span className="font-semibold text-purple-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(total)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Resumo do pedido */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
