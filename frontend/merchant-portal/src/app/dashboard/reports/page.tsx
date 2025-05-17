'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

// Importação de bibliotecas de gráficos
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Registrando os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  daily: {
    labels: string[];
    data: number[];
  };
  monthly: {
    labels: string[];
    data: number[];
  };
  categories: {
    labels: string[];
    data: number[];
  };
  paymentMethods: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  topCustomers: {
    id: string;
    name: string;
    orders: number;
    spent: number;
  }[];
}

interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchSalesData(dateRange);
  }, [dateRange]);

  const fetchSalesData = async (range: string) => {
    setIsLoading(true);
    try {
      // Em um cenário real, isso seria uma chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Dados simulados para os relatórios
      const mockSalesData: SalesData = {
        daily: {
          labels: [
            '01/05', '02/05', '03/05', '04/05', '05/05', '06/05', '07/05',
            '08/05', '09/05', '10/05', '11/05', '12/05', '13/05', '14/05',
            '15/05', '16/05', '17/05', '18/05', '19/05', '20/05', '21/05',
            '22/05', '23/05', '24/05', '25/05', '26/05', '27/05', '28/05',
            '29/05', '30/05',
          ],
          data: [
            1250, 980, 1100, 1300, 950, 800, 750,
            1400, 1600, 1800, 1700, 1500, 1400, 1200,
            1100, 1050, 1300, 1450, 1600, 1750, 1850,
            1700, 1600, 1500, 1400, 1300, 1200, 1100,
            1000, 1200,
          ],
        },
        monthly: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
          data: [25000, 28000, 32000, 30000, 35000],
        },
        categories: {
          labels: ['Eletrônicos', 'Acessórios', 'Vestuário', 'Casa e Decoração', 'Outros'],
          data: [45, 25, 15, 10, 5],
        },
        paymentMethods: {
          labels: ['Cartão de Crédito', 'Boleto', 'Pix', 'Outros'],
          data: [65, 15, 18, 2],
        },
        topProducts: [
          {
            id: '1',
            name: 'Smartphone XYZ',
            sales: 45,
            revenue: 58499.55,
          },
          {
            id: '2',
            name: 'Notebook Ultra Slim',
            sales: 12,
            revenue: 41998.80,
          },
          {
            id: '3',
            name: 'Fones de Ouvido Bluetooth',
            sales: 78,
            revenue: 15592.20,
          },
          {
            id: '7',
            name: 'Tablet Pro',
            sales: 15,
            revenue: 23998.50,
          },
          {
            id: '5',
            name: 'Smartwatch Fitness',
            sales: 23,
            revenue: 11497.70,
          },
        ],
        topCustomers: [
          {
            id: '101',
            name: 'João Silva',
            orders: 5,
            spent: 7500.50,
          },
          {
            id: '102',
            name: 'Maria Oliveira',
            orders: 4,
            spent: 6200.75,
          },
          {
            id: '103',
            name: 'Pedro Santos',
            orders: 3,
            spent: 5800.25,
          },
          {
            id: '104',
            name: 'Ana Souza',
            orders: 3,
            spent: 4500.90,
          },
          {
            id: '105',
            name: 'Carlos Ferreira',
            orders: 2,
            spent: 3800.50,
          },
        ],
      };
      
      const mockSalesStats: SalesStats = {
        totalSales: 151587.25,
        totalOrders: 173,
        averageOrderValue: 876.23,
        conversionRate: 3.2,
      };
      
      setSalesData(mockSalesData);
      setSalesStats(mockSalesStats);
    } catch (error) {
      toast.error('Erro ao carregar dados de vendas');
      console.error('Erro ao carregar dados de vendas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vendas Diárias',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vendas Mensais',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const lineChartData = {
    labels: salesData?.daily.labels || [],
    datasets: [
      {
        label: 'Vendas (R$)',
        data: salesData?.daily.data || [],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: salesData?.monthly.labels || [],
    datasets: [
      {
        label: 'Vendas (R$)',
        data: salesData?.monthly.data || [],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
      },
    ],
  };

  const categoryPieData = {
    labels: salesData?.categories.labels || [],
    datasets: [
      {
        label: 'Vendas por Categoria (%)',
        data: salesData?.categories.data || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentPieData = {
    labels: salesData?.paymentMethods.labels || [],
    datasets: [
      {
        label: 'Métodos de Pagamento (%)',
        data: salesData?.paymentMethods.data || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Relatórios de Vendas</h1>
        <div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="last7days">Últimos 7 dias</option>
            <option value="last30days">Últimos 30 dias</option>
            <option value="last90days">Últimos 90 dias</option>
            <option value="thisYear">Este ano</option>
            <option value="allTime">Todo o período</option>
          </select>
        </div>
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
                    R$ {salesStats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    {salesStats.totalOrders}
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
                    R$ {salesStats.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    Taxa de Conversão
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {salesStats.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Vendas Diárias
              </h2>
              <div className="h-80">
                <Line options={lineChartOptions} data={lineChartData} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Vendas Mensais
              </h2>
              <div className="h-80">
                <Bar options={barChartOptions} data={barChartData} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Vendas por Categoria
              </h2>
              <div className="h-80 flex items-center justify-center">
                <div className="w-4/5">
                  <Pie options={pieChartOptions} data={categoryPieData} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Métodos de Pagamento
              </h2>
              <div className="h-80 flex items-center justify-center">
                <div className="w-4/5">
                  <Pie options={pieChartOptions} data={paymentPieData} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Produtos Mais Vendidos
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-sm font-medium text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pl-4">Produto</th>
                      <th className="pb-3 text-center">Vendas</th>
                      <th className="pb-3 text-right pr-4">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData?.topProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-4 pl-4 font-medium">{product.name}</td>
                        <td className="py-4 text-center">{product.sales}</td>
                        <td className="py-4 text-right pr-4">
                          R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Clientes Mais Valiosos
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-sm font-medium text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pl-4">Cliente</th>
                      <th className="pb-3 text-center">Pedidos</th>
                      <th className="pb-3 text-right pr-4">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData?.topCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-4 pl-4 font-medium">{customer.name}</td>
                        <td className="py-4 text-center">{customer.orders}</td>
                        <td className="py-4 text-right pr-4">
                          R$ {customer.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
