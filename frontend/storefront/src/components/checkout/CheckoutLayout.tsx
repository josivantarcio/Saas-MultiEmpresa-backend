'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StoreLayout from '@/components/layout/StoreLayout';

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

const steps = [
  { name: 'Carrinho', href: '/checkout/carrinho', id: 'cart' },
  { name: 'Entrega', href: '/checkout/entrega', id: 'shipping' },
  { name: 'Pagamento', href: '/checkout/pagamento', id: 'payment' },
  { name: 'Confirmação', href: '/checkout/confirmacao', id: 'confirmation' },
];

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  const pathname = usePathname();
  
  // Determinar a etapa atual com base no pathname
  const currentStepIndex = steps.findIndex(step => step.href === pathname);
  
  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          
          {/* Indicador de progresso */}
          <nav aria-label="Progresso" className="mt-6">
            <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
              {steps.map((step, stepIdx) => {
                const isCurrentStep = stepIdx === currentStepIndex;
                const isCompleted = stepIdx < currentStepIndex;
                const isDisabled = stepIdx > currentStepIndex + 1;
                
                return (
                  <li key={step.name} className="md:flex-1">
                    {isCompleted ? (
                      <Link
                        href={step.href}
                        className="group flex flex-col border-l-4 border-purple-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
                      >
                        <span className="text-sm font-medium text-purple-600">
                          {stepIdx + 1}
                        </span>
                        <span className="text-sm font-medium">{step.name}</span>
                      </Link>
                    ) : isCurrentStep ? (
                      <div
                        className="flex flex-col border-l-4 border-purple-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
                        aria-current="step"
                      >
                        <span className="text-sm font-medium text-purple-600">
                          {stepIdx + 1}
                        </span>
                        <span className="text-sm font-medium">{step.name}</span>
                      </div>
                    ) : (
                      <div className={`flex flex-col border-l-4 ${isDisabled ? 'border-gray-200 group-hover:border-gray-300' : 'border-gray-300'} py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0`}>
                        <span className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stepIdx + 1}
                        </span>
                        <span className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                          {step.name}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        
        {/* Conteúdo da etapa atual */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </StoreLayout>
  );
}
