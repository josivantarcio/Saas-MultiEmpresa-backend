'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  averageOrderValue: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    activeCustomers: 0,
    averageOrderValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    // Simulando carregamento de dados do backend
    const fetchCustomers = () => {
      setIsLoading(true);
      // Em um cenário real, isso seria uma chamada à API
      setTimeout(() => {
        const mockCustomers: Customer[] = [
          {
            id: '101',
            name: 'João Silva',
            email: 'joao.silva@example.com',
            phone: '(11) 98765-4321',
            totalOrders: 3,
            totalSpent: 1899.89,
            lastOrderDate: '2025-05-10',
            createdAt: '2025-01-15',
            status: 'active',
          },
          {
            id: '102',
            name: 'Maria Oliveira',
            email: 'maria.oliveira@example.com',
            phone: '(21) 98765-4321',
            totalOrders: 2,
            totalSpent: 3599.90,
            lastOrderDate: '2025-05-12',
            createdAt: '2025-02-20',
            status: 'active',
          },
          {
            id: '103',
            name: 'Pedro Santos',
            email: 'pedro.santos@example.com',
            phone: '(31) 98765-4321',
            totalOrders: 1,
            totalSpent: 799.80,
            lastOrderDate: '2025-05-14',
            createdAt: '2025-04-10',
            status: 'active',
          },
          {
            id: '104',
            name: 'Ana Souza',
            email: 'ana.souza@example.com',
            phone: '(41) 98765-4321',
            totalOrders: 5,
            totalSpent: 2899.90,
            lastOrderDate: '2025-05-08',
            createdAt: '2025-01-05',
            status: 'active',
          },
          {
            id: '105',
            name: 'Carlos Ferreira',
            email: 'carlos.ferreira@example.com',
            phone: '(51) 98765-4321',
            totalOrders: 2,
            totalSpent: 1999.70,
            lastOrderDate: '2025-05-05',
            createdAt: '2025-03-15',
            status: 'active',
          },
          {
            id: '106',
            name: 'Fernanda Lima',
            email: 'fernanda.lima@example.com',
            phone: '(61) 98765-4321',
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: '',
            createdAt: '2025-05-01',
            status: 'inactive',
          },
          {
            id: '107',
            name: 'Roberto Alves',
            email: 'roberto.alves@example.com',
            phone: '(71) 98765-4321',
            totalOrders: 1,
            totalSpent: 499.90,
            lastOrderDate: '2025-04-20',
            createdAt: '2025-04-01',
            status: 'active',
          },
        ];

        // Calcular estatísticas
        const stats = {
          totalCustomers: mockCustomers.length,
          newCustomersThisMonth: mockCustomers.filter(
            (c) => new Date(c.createdAt) >= new Date('2025-05-01')
          ).length,
          activeCustomers: mockCustomers.filter(
            (c) => c.status === 'active'
          ).length,
          averageOrderValue:
            mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) /
            mockCustomers.filter((c) => c.totalOrders > 0).length,
        };

        setCustomers(mockCustomers);
        setStats(stats);
        setIsLoading(false);
      }, 1000);
    };

    fetchCustomers();
  }, []);

  const handleUpdateCustomerStatus = (id: string, status: Customer['status']) => {
    // Em um cenário real, isso seria uma chamada à API
    setCustomers(
      customers.map((customer) =>
        customer.id === id ? { ...customer, status } : customer
      )
    );
    toast.success(`Status do cliente #${id} atualizado para ${status === 'active' ? 'ativo' : 'inativo'}`);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus =
      selectedStatus === 'all' || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Ordenação
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'totalOrders':
        comparison = a.totalOrders - b.totalOrders;
        break;
      case 'totalSpent':
        comparison = a.totalSpent - b.totalSpent;
        break;
      case 'lastOrderDate':
        comparison = a.lastOrderDate
          ? b.lastOrderDate
            ? new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime()
            : -1
          : 1;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const statuses = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <Link
          href="/dashboard/customers/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Adicionar Cliente
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-600">
                Total de Clientes
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCustomers}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-600">
                Novos Clientes (Mês)
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.newCustomersThisMonth}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-600">
                Clientes Ativos
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeCustomers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-600">
                Valor Médio do Pedido
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="status" className="sr-only">
              Status
            </label>
            <select
              id="status"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos os status</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-sm font-medium text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-3 pl-4">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('name')}
                    >
                      <span>Nome</span>
                      <span className="ml-1">{renderSortIcon('name')}</span>
                    </button>
                  </th>
                  <th className="pb-3">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('email')}
                    >
                      <span>Email</span>
                      <span className="ml-1">{renderSortIcon('email')}</span>
                    </button>
                  </th>
                  <th className="pb-3">Telefone</th>
                  <th className="pb-3">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('totalOrders')}
                    >
                      <span>Pedidos</span>
                      <span className="ml-1">{renderSortIcon('totalOrders')}</span>
                    </button>
                  </th>
                  <th className="pb-3">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('totalSpent')}
                    >
                      <span>Total Gasto</span>
                      <span className="ml-1">{renderSortIcon('totalSpent')}</span>
                    </button>
                  </th>
                  <th className="pb-3">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('lastOrderDate')}
                    >
                      <span>Último Pedido</span>
                      <span className="ml-1">{renderSortIcon('lastOrderDate')}</span>
                    </button>
                  </th>
                  <th className="pb-3">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('createdAt')}
                    >
                      <span>Cadastro</span>
                      <span className="ml-1">{renderSortIcon('createdAt')}</span>
                    </button>
                  </th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.length > 0 ? (
                  sortedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 pl-4 font-medium">{customer.name}</td>
                      <td className="py-4">{customer.email}</td>
                      <td className="py-4">{customer.phone}</td>
                      <td className="py-4">{customer.totalOrders}</td>
                      <td className="py-4">
                        {customer.totalSpent > 0
                          ? `R$ ${customer.totalSpent.toFixed(2)}`
                          : '-'}
                      </td>
                      <td className="py-4">
                        {customer.lastOrderDate || '-'}
                      </td>
                      <td className="py-4">{customer.createdAt}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() =>
                              handleUpdateCustomerStatus(
                                customer.id,
                                customer.status === 'active'
                                  ? 'inactive'
                                  : 'active'
                              )
                            }
                            className={`${
                              customer.status === 'active'
                                ? 'text-gray-600 hover:text-gray-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={
                              customer.status === 'active'
                                ? 'Desativar'
                                : 'Ativar'
                            }
                          >
                            {customer.status === 'active' ? (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-4 text-center text-gray-500 font-medium"
                    >
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
