'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'received' | 'overdue' | 'refunded' | 'cancelled';
  type: 'order' | 'subscription' | 'manual' | 'refund';
  gatewayPaymentId: string;
  paidAt?: string;
  dueDate: string;
  createdAt: string;
}

interface PaymentStats {
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  totalRefunded: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalRefunded: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  useEffect(() => {
    // Simulando carregamento de dados do backend
    const fetchPayments = () => {
      setIsLoading(true);
      // Em um cenário real, isso seria uma chamada à API
      setTimeout(() => {
        const mockPayments: Payment[] = [
          {
            id: '1',
            orderId: '1001',
            amount: 1499.89,
            paymentMethod: 'Cartão de Crédito',
            status: 'received',
            type: 'order',
            gatewayPaymentId: 'pay_123456789',
            paidAt: '2025-05-11',
            dueDate: '2025-05-15',
            createdAt: '2025-05-10',
          },
          {
            id: '2',
            orderId: '1002',
            amount: 3499.90,
            paymentMethod: 'Boleto',
            status: 'received',
            type: 'order',
            gatewayPaymentId: 'pay_987654321',
            paidAt: '2025-05-13',
            dueDate: '2025-05-15',
            createdAt: '2025-05-12',
          },
          {
            id: '3',
            orderId: '1003',
            amount: 799.80,
            paymentMethod: 'PIX',
            status: 'pending',
            type: 'order',
            gatewayPaymentId: 'pay_456789123',
            dueDate: '2025-05-16',
            createdAt: '2025-05-14',
          },
          {
            id: '4',
            orderId: '1004',
            amount: 1899.90,
            paymentMethod: 'Cartão de Crédito',
            status: 'refunded',
            type: 'refund',
            gatewayPaymentId: 'pay_789123456',
            paidAt: '2025-05-09',
            dueDate: '2025-05-12',
            createdAt: '2025-05-08',
          },
          {
            id: '5',
            orderId: '1005',
            amount: 1999.70,
            paymentMethod: 'PIX',
            status: 'received',
            type: 'order',
            gatewayPaymentId: 'pay_321654987',
            paidAt: '2025-05-05',
            dueDate: '2025-05-07',
            createdAt: '2025-05-05',
          },
          {
            id: '6',
            orderId: '',
            amount: 99.90,
            paymentMethod: 'Cartão de Crédito',
            status: 'confirmed',
            type: 'subscription',
            gatewayPaymentId: 'pay_654987321',
            paidAt: '2025-05-01',
            dueDate: '2025-05-01',
            createdAt: '2025-05-01',
          },
          {
            id: '7',
            orderId: '',
            amount: 149.90,
            paymentMethod: 'Cartão de Crédito',
            status: 'overdue',
            type: 'subscription',
            gatewayPaymentId: 'pay_159753456',
            dueDate: '2025-04-30',
            createdAt: '2025-04-25',
          },
        ];

        // Calcular estatísticas
        const stats = {
          totalReceived: mockPayments
            .filter((p) => p.status === 'received')
            .reduce((sum, p) => sum + p.amount, 0),
          totalPending: mockPayments
            .filter((p) => p.status === 'pending' || p.status === 'confirmed')
            .reduce((sum, p) => sum + p.amount, 0),
          totalOverdue: mockPayments
            .filter((p) => p.status === 'overdue')
            .reduce((sum, p) => sum + p.amount, 0),
          totalRefunded: mockPayments
            .filter((p) => p.status === 'refunded')
            .reduce((sum, p) => sum + p.amount, 0),
        };

        setPayments(mockPayments);
        setStats(stats);
        setIsLoading(false);
      }, 1000);
    };

    fetchPayments();
  }, []);

  const handleRefundPayment = (id: string) => {
    if (window.confirm('Tem certeza que deseja reembolsar este pagamento?')) {
      // Em um cenário real, isso seria uma chamada à API
      setPayments(
        payments.map((payment) =>
          payment.id === id ? { ...payment, status: 'refunded' } : payment
        )
      );
      toast.success(`Pagamento #${id} reembolsado com sucesso!`);
    }
  };

  const handleCancelPayment = (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este pagamento?')) {
      // Em um cenário real, isso seria uma chamada à API
      setPayments(
        payments.map((payment) =>
          payment.id === id ? { ...payment, status: 'cancelled' } : payment
        )
      );
      toast.success(`Pagamento #${id} cancelado com sucesso!`);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.includes(searchTerm) ||
      payment.orderId.includes(searchTerm) ||
      payment.gatewayPaymentId.includes(searchTerm);
    const matchesStatus =
      selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesType = selectedType === 'all' || payment.type === selectedType;

    let matchesDateRange = true;
    const today = new Date();
    const paymentDate = new Date(payment.createdAt);
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    if (selectedDateRange === 'today') {
      matchesDateRange =
        paymentDate.toDateString() === today.toDateString();
    } else if (selectedDateRange === 'week') {
      matchesDateRange = today.getTime() - paymentDate.getTime() <= oneWeek;
    } else if (selectedDateRange === 'month') {
      matchesDateRange = today.getTime() - paymentDate.getTime() <= oneMonth;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  const statuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'received', label: 'Recebido' },
    { value: 'overdue', label: 'Vencido' },
    { value: 'refunded', label: 'Reembolsado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  const types = [
    { value: 'order', label: 'Pedido' },
    { value: 'subscription', label: 'Assinatura' },
    { value: 'manual', label: 'Manual' },
    { value: 'refund', label: 'Reembolso' },
  ];

  const dateRanges = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Últimos 7 dias' },
    { value: 'month', label: 'Últimos 30 dias' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return 'Recebido';
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Vencido';
      case 'refunded':
        return 'Reembolsado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'order':
        return 'Pedido';
      case 'subscription':
        return 'Assinatura';
      case 'manual':
        return 'Manual';
      case 'refund':
        return 'Reembolso';
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-600">
                Total Recebido
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalReceived.toFixed(2)}
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
                Total Pendente
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalPending.toFixed(2)}
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
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-600">
                Total Vencido
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalOverdue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-600">
                Total Reembolsado
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalRefunded.toFixed(2)}
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
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
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
                placeholder="Buscar por ID, pedido ou gateway..."
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
          <div className="w-full md:w-48">
            <label htmlFor="type" className="sr-only">
              Tipo
            </label>
            <select
              id="type"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="dateRange" className="sr-only">
              Período
            </label>
            <select
              id="dateRange"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
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
                  <th className="pb-3 pl-4">ID</th>
                  <th className="pb-3">Pedido</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Método</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Data de Vencimento</th>
                  <th className="pb-3">Data de Pagamento</th>
                  <th className="pb-3 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 pl-4 font-medium">#{payment.id}</td>
                      <td className="py-4">
                        {payment.orderId ? `#${payment.orderId}` : '-'}
                      </td>
                      <td className="py-4">R$ {payment.amount.toFixed(2)}</td>
                      <td className="py-4">{payment.paymentMethod}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="py-4">{getTypeText(payment.type)}</td>
                      <td className="py-4">{payment.dueDate}</td>
                      <td className="py-4">{payment.paidAt || '-'}</td>
                      <td className="py-4 pr-4">
                        <div className="flex space-x-2">
                          {payment.status === 'received' && (
                            <button
                              onClick={() => handleRefundPayment(payment.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Reembolsar"
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
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          )}
                          {(payment.status === 'pending' ||
                            payment.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelPayment(payment.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancelar"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
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
                      Nenhum pagamento encontrado
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
