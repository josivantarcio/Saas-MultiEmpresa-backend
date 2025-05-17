'use client';

import Link from 'next/link';
import { useAppSelector } from '../../redux/hooks';

export default function CartSummary() {
  const { items, total } = useAppSelector((state) => state.cart);
  
  // Valores fixos para demonstração
  const shipping = items.length > 0 ? 15.90 : 0;
  const tax = total * 0.09; // 9% de imposto
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Pedido</h2>
        <div className="flex flex-col items-center justify-center py-8">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
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
          <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
          <Link
            href="/produtos"
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Pedido</h2>
      
      {/* Detalhes do pedido */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(total)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Frete</span>
          <span className="font-medium">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(shipping)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Impostos</span>
          <span className="font-medium">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(tax)}
          </span>
        </div>
        
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold text-purple-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(grandTotal)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ou em até 10x de {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(grandTotal / 10)} sem juros
          </p>
        </div>
      </div>
      
      {/* Cupom de desconto */}
      <div className="mb-6">
        <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
          Cupom de Desconto
        </label>
        <div className="flex">
          <input
            type="text"
            id="coupon"
            className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
            placeholder="Digite seu cupom"
          />
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-r-md hover:bg-gray-300 transition-colors text-sm font-medium">
            Aplicar
          </button>
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="space-y-3">
        <Link
          href="/checkout"
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors text-center block font-medium"
        >
          Finalizar Compra
        </Link>
        <Link
          href="/produtos"
          className="w-full bg-white text-purple-600 border border-purple-600 py-3 px-4 rounded-md hover:bg-purple-50 transition-colors text-center block font-medium"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
