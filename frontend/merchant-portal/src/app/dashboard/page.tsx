'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/redux/hooks';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando carregamento de dados do backend
    const fetchDashboardData = () => {
      setIsLoading(true);
      // Em um cenário real, isso seria uma chamada à API
      setTimeout(() => {
        setStats({
          totalSales: 12580.45,
          totalOrders: 124,
          averageOrderValue: 101.45,
          pendingOrders: 8,
        });
        setRecentOrders([
          {
            id: '1',
            customer: 'João Silva',
            date: '15/05/2025',
            amount: 159.99,
            status: 'completed',
          },
          {
            id: '2',
            customer: 'Maria Oliveira',
            date: '14/05/2025',
            amount: 89.90,
            status: 'processing',
          },
          {
            id: '3',
            customer: 'Pedro Santos',
            date: '13/05/2025',
            amount: 299.99,
            status: 'pending',
          },
          {
            id: '4',
            customer: 'Ana Souza',
            date: '12/05/2025',
            amount: 45.50,
            status: 'completed',
          },
          {
            id: '5',
            customer: 'Carlos Ferreira',
            date: '11/05/2025',
            amount: 129.90,
            status: 'cancelled',
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Em processamento';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Bem-vindo, {user?.name || 'Lojista'}!
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo da sua loja para hoje.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-600">
                    Vendas Totais
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {stats.totalSales.toFixed(2)}
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-600">
                    Total de Pedidos
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-600">
                    Pedidos Pendentes
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingOrders}
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Pedidos Recentes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-sm font-medium text-left text-gray-500 border-b border-gray-200">
                    <th className="pb-3 pl-4">ID</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 pl-4">#{order.id}</td>
                      <td className="py-4">{order.customer}</td>
                      <td className="py-4">{order.date}</td>
                      <td className="py-4">R$ {order.amount.toFixed(2)}</td>
                      <td className="py-4 pr-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <a
                href="/dashboard/orders"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Ver todos os pedidos →
              </a>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
