'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

interface Order {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingMethod: string;
  shippingStatus: 'pending' | 'shipped' | 'delivered' | 'returned';
  trackingNumber?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedShippingStatus, setSelectedShippingStatus] = useState('all');

  useEffect(() => {
    // Simulando carregamento de dados do backend
    const fetchOrders = () => {
      setIsLoading(true);
      // Em um cenário real, isso seria uma chamada à API
      setTimeout(() => {
        const mockOrders: Order[] = [
          {
            id: '1001',
            customer: {
              id: '101',
              name: 'João Silva',
              email: 'joao.silva@example.com',
            },
            items: [
              {
                id: '1',
                name: 'Smartphone XYZ',
                quantity: 1,
                price: 1299.99,
              },
              {
                id: '3',
                name: 'Fones de Ouvido Bluetooth',
                quantity: 1,
                price: 199.90,
              },
            ],
            total: 1499.89,
            status: 'completed',
            paymentMethod: 'Cartão de Crédito',
            paymentStatus: 'paid',
            shippingMethod: 'Expresso',
            shippingStatus: 'delivered',
            trackingNumber: 'BR1234567890',
            createdAt: '2025-05-10',
          },
          {
            id: '1002',
            customer: {
              id: '102',
              name: 'Maria Oliveira',
              email: 'maria.oliveira@example.com',
            },
            items: [
              {
                id: '2',
                name: 'Notebook Ultra Slim',
                quantity: 1,
                price: 3499.90,
              },
            ],
            total: 3499.90,
            status: 'processing',
            paymentMethod: 'Boleto',
            paymentStatus: 'paid',
            shippingMethod: 'Padrão',
            shippingStatus: 'pending',
            createdAt: '2025-05-12',
          },
          {
            id: '1003',
            customer: {
              id: '103',
              name: 'Pedro Santos',
              email: 'pedro.santos@example.com',
            },
            items: [
              {
                id: '5',
                name: 'Smartwatch Fitness',
                quantity: 1,
                price: 499.90,
              },
              {
                id: '6',
                name: 'Caixa de Som Portátil',
                quantity: 1,
                price: 299.90,
              },
            ],
            total: 799.80,
            status: 'pending',
            paymentMethod: 'PIX',
            paymentStatus: 'pending',
            shippingMethod: 'Padrão',
            shippingStatus: 'pending',
            createdAt: '2025-05-14',
          },
          {
            id: '1004',
            customer: {
              id: '104',
              name: 'Ana Souza',
              email: 'ana.souza@example.com',
            },
            items: [
              {
                id: '4',
                name: 'Câmera Digital 4K',
                quantity: 1,
                price: 1899.90,
              },
            ],
            total: 1899.90,
            status: 'cancelled',
            paymentMethod: 'Cartão de Crédito',
            paymentStatus: 'refunded',
            shippingMethod: 'Expresso',
            shippingStatus: 'returned',
            createdAt: '2025-05-08',
          },
          {
            id: '1005',
            customer: {
              id: '105',
              name: 'Carlos Ferreira',
              email: 'carlos.ferreira@example.com',
            },
            items: [
              {
                id: '7',
                name: 'Tablet Pro',
                quantity: 1,
                price: 1599.90,
              },
              {
                id: '3',
                name: 'Fones de Ouvido Bluetooth',
                quantity: 2,
                price: 399.80,
              },
            ],
            total: 1999.70,
            status: 'completed',
            paymentMethod: 'PIX',
            paymentStatus: 'paid',
            shippingMethod: 'Padrão',
            shippingStatus: 'delivered',
            trackingNumber: 'BR0987654321',
            createdAt: '2025-05-05',
          },
        ];
        setOrders(mockOrders);
        setIsLoading(false);
      }, 1000);
    };

    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = (id: string, status: Order['status']) => {
    // Em um cenário real, isso seria uma chamada à API
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
    toast.success(`Status do pedido #${id} atualizado para ${getStatusText(status)}`);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPaymentStatus =
      selectedPaymentStatus === 'all' ||
      order.paymentStatus === selectedPaymentStatus;
    const matchesShippingStatus =
      selectedShippingStatus === 'all' ||
      order.shippingStatus === selectedShippingStatus;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesPaymentStatus &&
      matchesShippingStatus
    );
  });

  const statuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'processing', label: 'Em processamento' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'refunded', label: 'Reembolsado' },
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
    { value: 'failed', label: 'Falhou' },
    { value: 'refunded', label: 'Reembolsado' },
  ];

  const shippingStatuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'returned', label: 'Devolvido' },
  ];

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
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
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
      case 'refunded':
        return 'Reembolsado';
      case 'paid':
        return 'Pago';
      case 'failed':
        return 'Falhou';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'returned':
        return 'Devolvido';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
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
                placeholder="Buscar por ID, cliente ou email..."
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
            <label htmlFor="paymentStatus" className="sr-only">
              Status de Pagamento
            </label>
            <select
              id="paymentStatus"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            >
              <option value="all">Todos os status de pagamento</option>
              {paymentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="shippingStatus" className="sr-only">
              Status de Envio
            </label>
            <select
              id="shippingStatus"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedShippingStatus}
              onChange={(e) => setSelectedShippingStatus(e.target.value)}
            >
              <option value="all">Todos os status de envio</option>
              {shippingStatuses.map((status) => (
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
                  <th className="pb-3 pl-4">ID</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Pagamento</th>
                  <th className="pb-3">Envio</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 pl-4 font-medium">#{order.id}</td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-gray-500 text-xs">
                            {order.customer.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">R$ {order.total.toFixed(2)}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="text-xs text-gray-500">
                            {order.paymentMethod}
                          </div>
                          <span
                            className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {getStatusText(order.paymentStatus)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="text-xs text-gray-500">
                            {order.shippingMethod}
                          </div>
                          <span
                            className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order.shippingStatus
                            )}`}
                          >
                            {getStatusText(order.shippingStatus)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">{order.createdAt}</td>
                      <td className="py-4 pr-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <span className="sr-only">Ver</span>
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Link>
                          <div className="relative group">
                            <button className="text-gray-600 hover:text-gray-900">
                              <span className="sr-only">Atualizar Status</span>
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
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                              {statuses.map((status) => (
                                <button
                                  key={status.value}
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      status.value as Order['status']
                                    )
                                  }
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {status.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 text-center text-gray-500 font-medium"
                    >
                      Nenhum pedido encontrado
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
