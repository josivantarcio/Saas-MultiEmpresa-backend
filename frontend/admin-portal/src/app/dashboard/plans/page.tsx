'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppSelector } from '@/redux/hooks';
import { toast } from 'react-toastify';

// Enum para o ciclo de cobrança
enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMIANNUAL = 'semiannual',
  ANNUAL = 'annual',
}

// Interface para os planos
interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  storeLimit: number;
  productLimit: number;
  fileStorageLimit: number;
  bandwidthLimit: number;
  customDomain: boolean;
  customerSupport: 'basic' | 'priority' | 'dedicated';
  hasPromotion: boolean;
  promotionalPrice?: number;
  promotionValidUntil?: string;
}

// Componente para mostrar o card do plano
const PlanCard = ({ 
  plan, 
  onEdit, 
  onToggleActive 
}: { 
  plan: Plan; 
  onEdit: (plan: Plan) => void; 
  onToggleActive: (planId: number, isActive: boolean) => void;
}) => {
  const getBillingCycleText = (cycle: BillingCycle) => {
    switch (cycle) {
      case BillingCycle.MONTHLY:
        return 'Mensal';
      case BillingCycle.QUARTERLY:
        return 'Trimestral';
      case BillingCycle.SEMIANNUAL:
        return 'Semestral';
      case BillingCycle.ANNUAL:
        return 'Anual';
      default:
        return cycle;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${!plan.isActive ? 'opacity-70' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <div className="mt-1 text-sm text-gray-500">{getBillingCycleText(plan.billingCycle)}</div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(plan)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => onToggleActive(plan.id, !plan.isActive)}
              className={`p-2 hover:bg-gray-100 rounded-md ${plan.isActive ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
            >
              {plan.isActive ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-baseline">
            {plan.hasPromotion && plan.promotionalPrice ? (
              <>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(plan.promotionalPrice)}</span>
                <span className="ml-2 text-sm line-through text-gray-500">{formatCurrency(plan.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
            )}
            <span className="ml-1 text-sm text-gray-500">/{getBillingCycleText(plan.billingCycle).toLowerCase()}</span>
          </div>
          
          {plan.hasPromotion && plan.promotionValidUntil && (
            <div className="mt-1 text-xs text-green-600">
              Promoção válida até {new Date(plan.promotionValidUntil).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Recursos incluídos:</h4>
          <ul className="mt-2 space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div>
            <span className="font-medium">Limite de lojas:</span> {plan.storeLimit}
          </div>
          <div>
            <span className="font-medium">Limite de produtos:</span> {plan.productLimit}
          </div>
          <div>
            <span className="font-medium">Armazenamento:</span> {plan.fileStorageLimit}GB
          </div>
          <div>
            <span className="font-medium">Largura de banda:</span> {plan.bandwidthLimit}GB
          </div>
          <div>
            <span className="font-medium">Domínio personalizado:</span> {plan.customDomain ? 'Sim' : 'Não'}
          </div>
          <div>
            <span className="font-medium">Suporte:</span> {
              plan.customerSupport === 'basic' ? 'Básico' :
              plan.customerSupport === 'priority' ? 'Prioritário' : 'Dedicado'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PlansPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Carregar dados mockados
  useEffect(() => {
    // Simular carregamento de dados da API
    setTimeout(() => {
      const mockPlans: Plan[] = [
        {
          id: 1,
          name: 'Plano Básico',
          description: 'Ideal para pequenos negócios que estão começando no e-commerce.',
          price: 49.90,
          billingCycle: BillingCycle.MONTHLY,
          features: [
            'Até 100 produtos',
            'Processamento de pagamentos',
            'Dashboard básico',
            'Suporte por email',
          ],
          isActive: true,
          createdAt: '2025-01-15',
          updatedAt: '2025-04-10',
          storeLimit: 1,
          productLimit: 100,
          fileStorageLimit: 5,
          bandwidthLimit: 20,
          customDomain: false,
          customerSupport: 'basic',
          hasPromotion: false,
        },
        {
          id: 2,
          name: 'Plano Padrão',
          description: 'Perfeito para negócios em crescimento que precisam de mais recursos.',
          price: 99.90,
          billingCycle: BillingCycle.MONTHLY,
          features: [
            'Até 500 produtos',
            'Processamento de pagamentos',
            'Dashboard avançado',
            'Relatórios personalizados',
            'Integrações com marketplaces',
            'Suporte prioritário',
          ],
          isActive: true,
          createdAt: '2025-01-15',
          updatedAt: '2025-04-10',
          storeLimit: 1,
          productLimit: 500,
          fileStorageLimit: 20,
          bandwidthLimit: 50,
          customDomain: true,
          customerSupport: 'priority',
          hasPromotion: true,
          promotionalPrice: 79.90,
          promotionValidUntil: '2025-06-30',
        },
        {
          id: 3,
          name: 'Plano Premium',
          description: 'Solução completa para negócios estabelecidos que precisam de escalabilidade.',
          price: 199.90,
          billingCycle: BillingCycle.MONTHLY,
          features: [
            'Produtos ilimitados',
            'Processamento de pagamentos avançado',
            'Dashboard completo',
            'Relatórios avançados e análises',
            'Integrações com múltiplos marketplaces',
            'API personalizada',
            'Suporte dedicado 24/7',
          ],
          isActive: true,
          createdAt: '2025-01-15',
          updatedAt: '2025-04-10',
          storeLimit: 3,
          productLimit: 5000,
          fileStorageLimit: 100,
          bandwidthLimit: 200,
          customDomain: true,
          customerSupport: 'dedicated',
          hasPromotion: false,
        },
        {
          id: 4,
          name: 'Plano Enterprise',
          description: 'Para grandes empresas que precisam de uma solução personalizada e robusta.',
          price: 499.90,
          billingCycle: BillingCycle.MONTHLY,
          features: [
            'Produtos ilimitados',
            'Processamento de pagamentos personalizado',
            'Dashboard personalizado',
            'Relatórios e análises avançados',
            'Integrações personalizadas',
            'API dedicada',
            'Suporte dedicado 24/7 com gerente de conta',
            'Infraestrutura escalável',
          ],
          isActive: false,
          createdAt: '2025-01-15',
          updatedAt: '2025-04-10',
          storeLimit: 10,
          productLimit: 10000,
          fileStorageLimit: 500,
          bandwidthLimit: 1000,
          customDomain: true,
          customerSupport: 'dedicated',
          hasPromotion: false,
        },
      ];
      
      setPlans(mockPlans);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setShowNewPlanModal(true);
  };

  const handleToggleActivePlan = (planId: number, isActive: boolean) => {
    // Normalmente, isso seria uma chamada de API
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === planId ? { ...plan, isActive } : plan
      )
    );
    
    toast.success(`Plano ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
  };

  const handleCloseModal = () => {
    setShowNewPlanModal(false);
    setEditingPlan(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Planos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os planos de assinatura disponíveis para os lojistas
            </p>
          </div>
          <button
            onClick={() => setShowNewPlanModal(true)}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Adicionar Plano
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onEdit={handleEditPlan} 
                onToggleActive={handleToggleActivePlan} 
              />
            ))}
          </div>
        )}
        
        {/* Aqui seria implementado o modal para adicionar/editar planos */}
        {showNewPlanModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal}></div>
            <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPlan ? 'Editar Plano' : 'Adicionar Novo Plano'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-center p-8">
                <p className="text-gray-600">
                  Este é um modelo para o modal de adicionar/editar planos.
                  Em uma implementação real, aqui teria um formulário completo
                  para configurar todos os detalhes do plano.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
