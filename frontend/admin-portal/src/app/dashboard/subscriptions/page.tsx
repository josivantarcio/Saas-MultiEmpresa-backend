'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppSelector } from '@/redux/hooks';
import { toast } from 'react-toastify';

// Enum para status de assinatura conforme a memória do sistema
enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
  TRIAL = 'trial',
}

// Enum para ciclo de assinatura conforme a memória do sistema
enum SubscriptionCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMIANNUAL = 'semiannual',
  ANNUAL = 'annual',
}

// Interface para assinaturas
interface Subscription {
  id: number;
  tenantId: number;
  tenantName: string;
  planId: number;
  planName: string;
  status: SubscriptionStatus;
  cycle: SubscriptionCycle;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  lastPaymentDate?: string;
  lastPaymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  asaasId?: string;
  canceledAt?: string;
  cancelReason?: string;
}

// Componente para o status da assinatura
const StatusBadge = ({ status }: { status: SubscriptionStatus }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let statusText = 'Desconhecido';

  switch (status) {
    case SubscriptionStatus.ACTIVE:
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Ativo';
      break;
    case SubscriptionStatus.INACTIVE:
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      statusText = 'Inativo';
      break;
    case SubscriptionStatus.PENDING:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      statusText = 'Pendente';
      break;
    case SubscriptionStatus.EXPIRED:
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      statusText = 'Vencido';
      break;
    case SubscriptionStatus.CANCELED:
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      statusText = 'Cancelado';
      break;
    case SubscriptionStatus.COMPLETED:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      statusText = 'Finalizado';
      break;
    case SubscriptionStatus.TRIAL:
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      statusText = 'Trial';
      break;
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  );
};

// Componente para o ciclo de assinatura
const CycleBadge = ({ cycle }: { cycle: SubscriptionCycle }) => {
  const getCycleText = (cycleType: SubscriptionCycle) => {
    switch (cycleType) {
      case SubscriptionCycle.MONTHLY:
        return 'Mensal';
      case SubscriptionCycle.QUARTERLY:
        return 'Trimestral';
      case SubscriptionCycle.SEMIANNUAL:
        return 'Semestral';
      case SubscriptionCycle.ANNUAL:
        return 'Anual';
      default:
        return cycleType;
    }
  };

  return (
    <span className="px-2 inline-flex text-xs leading-5 font-medium text-gray-700 bg-gray-100 rounded-full">
      {getCycleText(cycle)}
    </span>
  );
};

// Componente de filtros
const Filters = ({ onFilter }: { onFilter: (filters: any) => void }) => {
  const [filters, setFilters] = useState({
    status: '',
    cycle: '',
    plan: '',
    search: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Buscar
          </label>
          <input
            type="text"
            name="search"
            id="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Nome da loja, ID..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value={SubscriptionStatus.ACTIVE}>Ativo</option>
            <option value={SubscriptionStatus.INACTIVE}>Inativo</option>
            <option value={SubscriptionStatus.PENDING}>Pendente</option>
            <option value={SubscriptionStatus.EXPIRED}>Vencido</option>
            <option value={SubscriptionStatus.CANCELED}>Cancelado</option>
            <option value={SubscriptionStatus.COMPLETED}>Finalizado</option>
            <option value={SubscriptionStatus.TRIAL}>Trial</option>
          </select>
        </div>
        <div>
          <label htmlFor="cycle" className="block text-sm font-medium text-gray-700">
            Ciclo
          </label>
          <select
            id="cycle"
            name="cycle"
            value={filters.cycle}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value={SubscriptionCycle.MONTHLY}>Mensal</option>
            <option value={SubscriptionCycle.QUARTERLY}>Trimestral</option>
            <option value={SubscriptionCycle.SEMIANNUAL}>Semestral</option>
            <option value={SubscriptionCycle.ANNUAL}>Anual</option>
          </select>
        </div>
        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
            Plano
          </label>
          <select
            id="plan"
            name="plan"
            value={filters.plan}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="1">Básico</option>
            <option value="2">Padrão</option>
            <option value="3">Premium</option>
            <option value="4">Enterprise</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setFilters({ status: '', cycle: '', plan: '', search: '' });
            onFilter({ status: '', cycle: '', plan: '', search: '' });
          }}
          className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Limpar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [subscriptionsPerPage] = useState(10);

  // Dados mockados para demonstração
  useEffect(() => {
    // Simular carregamento de dados da API
    setTimeout(() => {
      const mockSubscriptions: Subscription[] = Array.from({ length: 50 }, (_, i) => {
        const startDate = new Date(2025, 0, 1);
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 120));
        
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + (
          Math.random() < 0.5 ? 1 : // Mensal
          Math.random() < 0.5 ? 3 : // Trimestral
          Math.random() < 0.5 ? 6 : // Semestral
          12 // Anual
        ));
        
        const cycle = endDate.getMonth() - startDate.getMonth() === 1 || endDate.getMonth() - startDate.getMonth() === -11 ? 
          SubscriptionCycle.MONTHLY : 
          endDate.getMonth() - startDate.getMonth() === 3 || endDate.getMonth() - startDate.getMonth() === -9 ? 
          SubscriptionCycle.QUARTERLY : 
          endDate.getMonth() - startDate.getMonth() === 6 || endDate.getMonth() - startDate.getMonth() === -6 ? 
          SubscriptionCycle.SEMIANNUAL : 
          SubscriptionCycle.ANNUAL;

        const nextBillingDate = new Date(startDate);
        if (cycle === SubscriptionCycle.MONTHLY) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else if (cycle === SubscriptionCycle.QUARTERLY) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        } else if (cycle === SubscriptionCycle.SEMIANNUAL) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 6);
        } else {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        const planId = Math.floor(Math.random() * 4) + 1;
        const planName = 
          planId === 1 ? 'Básico' : 
          planId === 2 ? 'Padrão' : 
          planId === 3 ? 'Premium' : 'Enterprise';

        const status = 
          Math.random() < 0.6 ? SubscriptionStatus.ACTIVE :
          Math.random() < 0.5 ? SubscriptionStatus.PENDING :
          Math.random() < 0.5 ? SubscriptionStatus.CANCELED :
          Math.random() < 0.5 ? SubscriptionStatus.TRIAL :
          Math.random() < 0.5 ? SubscriptionStatus.EXPIRED :
          Math.random() < 0.5 ? SubscriptionStatus.COMPLETED :
          SubscriptionStatus.INACTIVE;

        return {
          id: i + 1,
          tenantId: 1000 + i,
          tenantName: `Loja ${i + 1}`,
          planId,
          planName,
          status,
          cycle,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          nextBillingDate: nextBillingDate.toISOString().split('T')[0],
          amount: planId === 1 ? 49.90 : planId === 2 ? 99.90 : planId === 3 ? 199.90 : 499.90,
          lastPaymentDate: status === SubscriptionStatus.ACTIVE ? new Date().toISOString().split('T')[0] : undefined,
          lastPaymentStatus: status === SubscriptionStatus.ACTIVE ? 'confirmed' : undefined,
          createdAt: startDate.toISOString(),
          updatedAt: new Date().toISOString(),
          asaasId: `subscription_${100000 + i}`,
          canceledAt: status === SubscriptionStatus.CANCELED ? new Date().toISOString() : undefined,
          cancelReason: status === SubscriptionStatus.CANCELED ? 'Cancelado pelo cliente' : undefined,
        };
      });
      
      setSubscriptions(mockSubscriptions);
      setFilteredSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleFilter = (filters: any) => {
    let filtered = [...subscriptions];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (subscription) => 
          subscription.tenantName.toLowerCase().includes(searchLower) || 
          subscription.id.toString().includes(searchLower) ||
          subscription.asaasId?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter((subscription) => subscription.status === filters.status);
    }
    
    if (filters.cycle) {
      filtered = filtered.filter((subscription) => subscription.cycle === filters.cycle);
    }
    
    if (filters.plan) {
      filtered = filtered.filter((subscription) => subscription.planId.toString() === filters.plan);
    }
    
    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  };

  // Lógica de paginação
  const indexOfLastSubscription = currentPage * subscriptionsPerPage;
  const indexOfFirstSubscription = indexOfLastSubscription - subscriptionsPerPage;
  const currentSubscriptions = filteredSubscriptions.slice(indexOfFirstSubscription, indexOfLastSubscription);
  const totalPages = Math.ceil(filteredSubscriptions.length / subscriptionsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para simular a alteração de status
  const handleChangeStatus = (subscriptionId: number, newStatus: SubscriptionStatus) => {
    // Normalmente, isso seria uma chamada de API
    setSubscriptions((prevSubscriptions) =>
      prevSubscriptions.map((subscription) =>
        subscription.id === subscriptionId ? { ...subscription, status: newStatus } : subscription
      )
    );
    
    setFilteredSubscriptions((prevSubscriptions) =>
      prevSubscriptions.map((subscription) =>
        subscription.id === subscriptionId ? { ...subscription, status: newStatus } : subscription
      )
    );
    
    toast.success(`Status da assinatura atualizado para ${newStatus}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Assinaturas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todas as assinaturas dos lojistas na plataforma
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/subscriptions/new')}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Adicionar Assinatura
          </button>
        </div>
        
        <Filters onFilter={handleFilter} />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lojista
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plano
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ciclo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Início
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Próximo Pagamento
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentSubscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subscription.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{subscription.tenantName}</div>
                          <div className="text-xs text-gray-500">ID Tenant: {subscription.tenantId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{subscription.planName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={subscription.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CycleBadge cycle={subscription.cycle} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(subscription.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(subscription.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(subscription.nextBillingDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            onClick={() => router.push(`/dashboard/subscriptions/${subscription.id}`)}
                          >
                            Ver
                          </button>
                          <div className="relative inline-block text-left group">
                            <button className="text-gray-600 hover:text-gray-900">
                              Status
                            </button>
                            <div className="hidden group-hover:block absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  onClick={() => handleChangeStatus(subscription.id, SubscriptionStatus.ACTIVE)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Ativar
                                </button>
                                <button
                                  onClick={() => handleChangeStatus(subscription.id, SubscriptionStatus.CANCELED)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleChangeStatus(subscription.id, SubscriptionStatus.SUSPENDED)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Suspender
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Paginação */}
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstSubscription + 1}</span> a{' '}
                    <span className="font-medium">
                      {indexOfLastSubscription > filteredSubscriptions.length ? filteredSubscriptions.length : indexOfLastSubscription}
                    </span>{' '}
                    de <span className="font-medium">{filteredSubscriptions.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === i + 1
                            ? 'text-purple-600 bg-purple-50 border-purple-500 z-10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                        currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Próximo</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
