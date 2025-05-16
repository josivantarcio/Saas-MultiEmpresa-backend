'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppSelector } from '@/redux/hooks';
import { toast } from 'react-toastify';

// Enum para status do lojista
enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

// Interface para o lojista
interface Tenant {
  id: number;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  plan: string;
  status: TenantStatus;
  createdAt: string;
  monthlyRevenue: string;
  domain: string;
}

// Componente do filtro
const Filters = ({ onFilter }: { onFilter: (filters: any) => void }) => {
  const [filters, setFilters] = useState({
    status: '',
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
            placeholder="Nome da loja, proprietário, email..."
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
            <option value={TenantStatus.ACTIVE}>Ativo</option>
            <option value={TenantStatus.INACTIVE}>Inativo</option>
            <option value={TenantStatus.PENDING}>Pendente</option>
            <option value={TenantStatus.SUSPENDED}>Suspenso</option>
            <option value={TenantStatus.TRIAL}>Trial</option>
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
            <option value="Basic">Básico</option>
            <option value="Standard">Padrão</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setFilters({ status: '', plan: '', search: '' });
            onFilter({ status: '', plan: '', search: '' });
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

// Componente de status do lojista
const StatusBadge = ({ status }: { status: TenantStatus }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let statusText = 'Desconhecido';

  switch (status) {
    case TenantStatus.ACTIVE:
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Ativo';
      break;
    case TenantStatus.INACTIVE:
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      statusText = 'Inativo';
      break;
    case TenantStatus.PENDING:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      statusText = 'Pendente';
      break;
    case TenantStatus.SUSPENDED:
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      statusText = 'Suspenso';
      break;
    case TenantStatus.TRIAL:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      statusText = 'Trial';
      break;
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  );
};

export default function TenantsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tenantsPerPage] = useState(10);

  // Dados mockados para demonstração
  useEffect(() => {
    // Simular carregamento de dados da API
    setTimeout(() => {
      const mockTenants: Tenant[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        storeName: `Loja ${i + 1}`,
        ownerName: `Proprietário ${i + 1}`,
        email: `loja${i + 1}@example.com`,
        phone: `(${Math.floor(Math.random() * 90) + 10}) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        plan: ['Basic', 'Standard', 'Premium'][Math.floor(Math.random() * 3)],
        status: [TenantStatus.ACTIVE, TenantStatus.INACTIVE, TenantStatus.PENDING, TenantStatus.SUSPENDED, TenantStatus.TRIAL][Math.floor(Math.random() * 5)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
        monthlyRevenue: `R$ ${(Math.random() * 10000).toFixed(2).replace('.', ',')}`,
        domain: `loja${i + 1}.lojaexemplo.com.br`,
      }));
      
      setTenants(mockTenants);
      setFilteredTenants(mockTenants);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleFilter = (filters: any) => {
    let filtered = [...tenants];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tenant) => 
          tenant.storeName.toLowerCase().includes(searchLower) || 
          tenant.ownerName.toLowerCase().includes(searchLower) || 
          tenant.email.toLowerCase().includes(searchLower) ||
          tenant.domain.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter((tenant) => tenant.status === filters.status);
    }
    
    if (filters.plan) {
      filtered = filtered.filter((tenant) => tenant.plan === filters.plan);
    }
    
    setFilteredTenants(filtered);
    setCurrentPage(1);
  };

  // Lógica de paginação
  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = filteredTenants.slice(indexOfFirstTenant, indexOfLastTenant);
  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Função para simular a alteração de status
  const handleStatusChange = (tenantId: number, newStatus: TenantStatus) => {
    // Normalmente, isso seria uma chamada de API
    setTenants((prevTenants) =>
      prevTenants.map((tenant) =>
        tenant.id === tenantId ? { ...tenant, status: newStatus } : tenant
      )
    );
    
    setFilteredTenants((prevTenants) =>
      prevTenants.map((tenant) =>
        tenant.id === tenantId ? { ...tenant, status: newStatus } : tenant
      )
    );
    
    toast.success(`Status do lojista atualizado com sucesso!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Lojistas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todos os lojistas da plataforma SaaS E-commerce
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/tenants/new')}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Adicionar Lojista
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
                        Loja
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proprietário
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plano
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Domínio
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receita Mensal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTenants.map((tenant) => (
                      <tr key={tenant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tenant.storeName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenant.ownerName}</div>
                          <div className="text-sm text-gray-500">{tenant.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenant.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenant.plan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={tenant.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenant.domain}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenant.monthlyRevenue}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
                          >
                            Ver
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-900 mr-3"
                            onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}
                          >
                            Editar
                          </button>
                          <div className="relative inline-block text-left group">
                            <button 
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => {}}
                            >
                              Status
                            </button>
                            <div className="hidden group-hover:block absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  onClick={() => handleStatusChange(tenant.id, TenantStatus.ACTIVE)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Ativar
                                </button>
                                <button
                                  onClick={() => handleStatusChange(tenant.id, TenantStatus.INACTIVE)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Desativar
                                </button>
                                <button
                                  onClick={() => handleStatusChange(tenant.id, TenantStatus.SUSPENDED)}
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
                    Mostrando <span className="font-medium">{indexOfFirstTenant + 1}</span> a{' '}
                    <span className="font-medium">
                      {indexOfLastTenant > filteredTenants.length ? filteredTenants.length : indexOfLastTenant}
                    </span>{' '}
                    de <span className="font-medium">{filteredTenants.length}</span> resultados
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
