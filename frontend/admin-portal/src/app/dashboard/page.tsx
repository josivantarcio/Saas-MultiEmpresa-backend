'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, icon, description, change, trend }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="bg-purple-100 p-3 rounded-full">{icon}</div>
    </div>
    {description && (
      <div className="mt-4 flex items-center">
        {trend && (
          <span className={`mr-2 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? (
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : trend === 'down' ? (
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : null}
          </span>
        )}
        <span className={`text-sm ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {change} {description}
        </span>
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  // Normalmente, esses dados viriam da API
  const [statistics, setStatistics] = useState({
    totalTenants: 126,
    activeTenants: 112,
    monthlyRevenue: 'R$ 28.450,00',
    totalSubscriptions: 118,
    merchantGrowth: '12%',
    revenueGrowth: '8%',
    activationRate: '89%',
    churnRate: '3%',
  });

  const [recentSignups, setRecentSignups] = useState([
    {
      id: 1,
      storeName: 'Loja de Eletrônicos XYZ',
      ownerName: 'João Silva',
      plan: 'Premium',
      date: '15/05/2025',
      status: 'active',
    },
    {
      id: 2,
      storeName: 'Boutique Moda Fashion',
      ownerName: 'Maria Santos',
      plan: 'Basic',
      date: '14/05/2025',
      status: 'active',
    },
    {
      id: 3,
      storeName: 'Livraria Conhecimento',
      ownerName: 'Pedro Alves',
      plan: 'Standard',
      date: '12/05/2025',
      status: 'pending',
    },
    {
      id: 4,
      storeName: 'Delícias da Terra',
      ownerName: 'Ana Oliveira',
      plan: 'Premium',
      date: '10/05/2025',
      status: 'active',
    },
    {
      id: 5,
      storeName: 'Esporte & Cia',
      ownerName: 'Carlos Mendes',
      plan: 'Standard',
      date: '08/05/2025',
      status: 'inactive',
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral da Plataforma</h1>
          <p className="mt-1 text-sm text-gray-500">
            Estatísticas e métricas da plataforma SaaS E-commerce
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Lojistas"
            value={statistics.totalTenants}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            description="desde o mês passado"
            change={statistics.merchantGrowth}
            trend="up"
          />
          <StatCard
            title="Lojistas Ativos"
            value={statistics.activeTenants}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            description="taxa de ativação"
            change={statistics.activationRate}
            trend="up"
          />
          <StatCard
            title="Receita Mensal"
            value={statistics.monthlyRevenue}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            description="desde o mês passado"
            change={statistics.revenueGrowth}
            trend="up"
          />
          <StatCard
            title="Assinaturas Ativas"
            value={statistics.totalSubscriptions}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            description="taxa de cancelamento"
            change={statistics.churnRate}
            trend="down"
          />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Novos Lojistas</h2>
          <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
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
                      Plano
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Cadastro
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSignups.map((signup) => (
                    <tr key={signup.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{signup.storeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{signup.ownerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{signup.plan}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{signup.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          signup.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : signup.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {signup.status === 'active' 
                            ? 'Ativo' 
                            : signup.status === 'pending' 
                            ? 'Pendente' 
                            : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => router.push(`/dashboard/tenants/${signup.id}`)}
                        >
                          Ver
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => router.push(`/dashboard/tenants/${signup.id}/edit`)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Assinaturas por Plano</h2>
            <div className="mt-4 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                O gráfico de assinaturas por plano será renderizado aqui utilizando Chart.js.
                Para simplificar, o estamos apenas simulando neste exemplo.
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Receita nos Últimos 12 Meses</h2>
            <div className="mt-4 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                O gráfico de receita mensal será renderizado aqui utilizando Chart.js.
                Para simplificar, o estamos apenas simulando neste exemplo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
