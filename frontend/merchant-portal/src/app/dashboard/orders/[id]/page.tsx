'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingMethod: string;
  shippingStatus: 'pending' | 'shipped' | 'delivered' | 'returned';
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderStatus, setOrderStatus] = useState<Order['status']>('pending');
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('pending');
  const [shippingStatus, setShippingStatus] = useState<Order['shippingStatus']>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        // Em um cenário real, isso seria uma chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Dados simulados para o pedido com o ID especificado
        const mockOrder: Order = {
          id: params.id,
          customer: {
            id: '101',
            name: 'João Silva',
            email: 'joao.silva@example.com',
            phone: '(11) 98765-4321',
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
              quantity: 2,
              price: 199.90,
            },
          ],
          total: 1699.79,
          status: 'processing',
          paymentMethod: 'Cartão de Crédito',
          paymentStatus: 'paid',
          shippingMethod: 'Sedex',
          shippingStatus: 'pending',
          shippingAddress: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Jardim Primavera',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            country: 'Brasil',
          },
          billingAddress: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Jardim Primavera',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            country: 'Brasil',
          },
          trackingNumber: '',
          notes: '',
          createdAt: '2025-05-15T14:30:00Z',
          updatedAt: '2025-05-15T15:45:00Z',
        };
        
        setOrder(mockOrder);
        setOrderStatus(mockOrder.status);
        setPaymentStatus(mockOrder.paymentStatus);
        setShippingStatus(mockOrder.shippingStatus);
        setTrackingNumber(mockOrder.trackingNumber || '');
        setNotes(mockOrder.notes || '');
      } catch (error) {
        toast.error('Erro ao carregar detalhes do pedido');
        console.error('Erro ao carregar detalhes do pedido:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [params.id]);

  const handleUpdateOrder = async () => {
    setIsUpdating(true);
    try {
      // Em um cenário real, isso seria uma chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Atualiza o pedido localmente
      if (order) {
        const updatedOrder = {
          ...order,
          status: orderStatus,
          paymentStatus,
          shippingStatus,
          trackingNumber,
          notes,
          updatedAt: new Date().toISOString(),
        };
        setOrder(updatedOrder);
      }
      
      toast.success('Pedido atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar pedido');
      console.error('Erro ao atualizar pedido:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
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
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Em processamento';
      case 'completed':
        return 'Concluído';
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500 font-medium">Pedido não encontrado</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Voltar para Pedidos
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Pedido #{order.id}
        </h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Informações do Pedido</h2>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Data do Pedido</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Atualização</p>
                <p className="font-medium">
                  {new Date(order.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Método de Pagamento</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status do Pagamento</p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    order.paymentStatus
                  )}`}
                >
                  {getStatusText(order.paymentStatus)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Método de Envio</p>
                <p className="font-medium">{order.shippingMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status do Envio</p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    order.shippingStatus
                  )}`}
                >
                  {getStatusText(order.shippingStatus)}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Código de Rastreio</p>
                  <p className="font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            <h3 className="text-md font-semibold text-gray-800 mb-3 mt-6">Itens do Pedido</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-sm font-medium text-left text-gray-500 border-b border-gray-200">
                    <th className="pb-3 pl-4">Produto</th>
                    <th className="pb-3 text-center">Quantidade</th>
                    <th className="pb-3 text-right">Preço</th>
                    <th className="pb-3 text-right pr-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="text-sm text-gray-700 border-b border-gray-200"
                    >
                      <td className="py-4 pl-4 font-medium">{item.name}</td>
                      <td className="py-4 text-center">{item.quantity}</td>
                      <td className="py-4 text-right">
                        R$ {item.price.toFixed(2)}
                      </td>
                      <td className="py-4 text-right pr-4">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="text-sm font-bold text-gray-800">
                    <td colSpan={3} className="py-4 text-right">
                      Total
                    </td>
                    <td className="py-4 text-right pr-4">
                      R$ {order.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Endereço de Entrega
              </h3>
              <address className="not-italic">
                <p>{order.customer.name}</p>
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.number}
                  {order.shippingAddress.complement && `, ${order.shippingAddress.complement}`}
                </p>
                <p>
                  {order.shippingAddress.neighborhood} - {order.shippingAddress.city}/{order.shippingAddress.state}
                </p>
                <p>CEP: {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </address>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Endereço de Cobrança
              </h3>
              <address className="not-italic">
                <p>{order.customer.name}</p>
                <p>
                  {order.billingAddress.street}, {order.billingAddress.number}
                  {order.billingAddress.complement && `, ${order.billingAddress.complement}`}
                </p>
                <p>
                  {order.billingAddress.neighborhood} - {order.billingAddress.city}/{order.billingAddress.state}
                </p>
                <p>CEP: {order.billingAddress.zipCode}</p>
                <p>{order.billingAddress.country}</p>
              </address>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informações do Cliente
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-medium">{order.customer.name}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{order.customer.email}</p>
            </div>
            {order.customer.phone && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            )}
            <div className="mt-6">
              <button
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={() => router.push(`/dashboard/customers/${order.customer.id}`)}
              >
                Ver Perfil do Cliente
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Atualizar Pedido
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Pedido
                </label>
                <select
                  id="orderStatus"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as Order['status'])}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Em processamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Pagamento
                </label>
                <select
                  id="paymentStatus"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as Order['paymentStatus'])}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="failed">Falhou</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="shippingStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Envio
                </label>
                <select
                  id="shippingStatus"
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value as Order['shippingStatus'])}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pending">Pendente</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="returned">Devolvido</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Rastreio
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Digite o código de rastreio"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Adicione observações sobre o pedido"
                />
              </div>
              
              <div className="pt-2">
                <button
                  onClick={handleUpdateOrder}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Atualizando...
                    </span>
                  ) : (
                    'Atualizar Pedido'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
