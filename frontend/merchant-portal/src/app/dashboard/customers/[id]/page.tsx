'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

interface Address {
  id?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: number;
}

interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate?: string;
  notes?: string;
  addresses: Address[];
  orders: Order[];
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    birthDate: '',
    notes: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [addressForm, setAddressForm] = useState({
    id: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    isDefault: false,
    type: 'shipping' as 'shipping' | 'billing' | 'both',
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        // Em um cenário real, isso seria uma chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Dados simulados para o cliente com o ID especificado
        const mockCustomer: CustomerDetails = {
          id: params.id,
          name: 'João Silva',
          email: 'joao.silva@example.com',
          phone: '(11) 98765-4321',
          document: '123.456.789-00',
          birthDate: '1985-05-15',
          notes: 'Cliente preferencial, sempre paga em dia.',
          addresses: [
            {
              id: '1',
              street: 'Rua das Flores',
              number: '123',
              complement: 'Apto 45',
              neighborhood: 'Jardim Primavera',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
              country: 'Brasil',
              isDefault: true,
              type: 'both',
            },
            {
              id: '2',
              street: 'Avenida Paulista',
              number: '1000',
              complement: 'Sala 45',
              neighborhood: 'Bela Vista',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01310-100',
              country: 'Brasil',
              isDefault: false,
              type: 'shipping',
            },
          ],
          orders: [
            {
              id: '1001',
              date: '2025-05-15',
              total: 1699.79,
              status: 'completed',
              paymentStatus: 'paid',
              items: 3,
            },
            {
              id: '1002',
              date: '2025-04-20',
              total: 499.90,
              status: 'completed',
              paymentStatus: 'paid',
              items: 1,
            },
            {
              id: '1003',
              date: '2025-03-10',
              total: 299.90,
              status: 'completed',
              paymentStatus: 'paid',
              items: 2,
            },
          ],
          totalSpent: 2499.59,
          totalOrders: 3,
          averageOrderValue: 833.20,
          lastOrderDate: '2025-05-15',
          createdAt: '2025-01-10',
          status: 'active',
        };
        
        setCustomer(mockCustomer);
        setFormData({
          name: mockCustomer.name,
          email: mockCustomer.email,
          phone: mockCustomer.phone,
          document: mockCustomer.document,
          birthDate: mockCustomer.birthDate || '',
          notes: mockCustomer.notes || '',
          status: mockCustomer.status,
        });
      } catch (error) {
        toast.error('Erro ao carregar detalhes do cliente');
        console.error('Erro ao carregar detalhes do cliente:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomer();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Em um cenário real, isso seria uma chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Atualiza o cliente localmente
      if (customer) {
        const updatedCustomer = {
          ...customer,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
          birthDate: formData.birthDate,
          notes: formData.notes,
          status: formData.status,
        };
        setCustomer(updatedCustomer);
      }
      
      setIsEditing(false);
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
      console.error('Erro ao atualizar cliente:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openAddressModal = (address?: Address) => {
    if (address) {
      setCurrentAddress(address);
      setAddressForm({
        id: address.id,
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault,
        type: address.type,
      });
    } else {
      setCurrentAddress(null);
      setAddressForm({
        id: Math.random().toString(36).substring(2, 9),
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil',
        isDefault: false,
        type: 'shipping',
      });
    }
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setCurrentAddress(null);
  };

  const saveAddress = () => {
    if (!customer) return;

    // Validar campos obrigatórios
    if (!addressForm.street || !addressForm.number || !addressForm.neighborhood || 
        !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      let updatedAddresses = [...customer.addresses];

      if (currentAddress) {
        // Editar endereço existente
        const index = updatedAddresses.findIndex(addr => addr.id === currentAddress.id);
        if (index !== -1) {
          updatedAddresses[index] = addressForm;
        }
      } else {
        // Adicionar novo endereço
        updatedAddresses.push(addressForm);
      }

      // Se o endereço atual é definido como padrão, atualizar os outros
      if (addressForm.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => 
          addr.id !== addressForm.id ? { ...addr, isDefault: false } : addr
        );
      }

      setCustomer({
        ...customer,
        addresses: updatedAddresses
      });

      toast.success(`Endereço ${currentAddress ? 'atualizado' : 'adicionado'} com sucesso!`);
      closeAddressModal();
    } catch (error) {
      toast.error(`Erro ao ${currentAddress ? 'atualizar' : 'adicionar'} endereço. Tente novamente.`);
    }
  };

  const deleteAddress = (addressId: string) => {
    if (!customer) return;

    try {
      const updatedAddresses = customer.addresses.filter(addr => addr.id !== addressId);
      setCustomer({
        ...customer,
        addresses: updatedAddresses
      });
      toast.success('Endereço removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover endereço. Tente novamente.');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
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
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500 font-medium">Cliente não encontrado</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Voltar para Clientes
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
          {isEditing ? 'Editar Cliente' : 'Detalhes do Cliente'}
        </h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center">
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
                    Salvando...
                  </span>
                ) : (
                  'Salvar'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Editar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informações Pessoais
            </h2>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone*
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ*
                  </label>
                  <input
                    type="text"
                    id="document"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Adicione observações sobre o cliente"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF/CNPJ</p>
                  <p className="font-medium">{customer.document}</p>
                </div>
                {customer.birthDate && (
                  <div>
                    <p className="text-sm text-gray-600">Data de Nascimento</p>
                    <p className="font-medium">{formatDate(customer.birthDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      customer.status
                    )}`}
                  >
                    {getStatusText(customer.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente desde</p>
                  <p className="font-medium">{formatDate(customer.createdAt)}</p>
                </div>
                {customer.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="font-medium">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Endereços</h2>
              <button
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={() => openAddressModal()}
              >
                Adicionar Endereço
              </button>
            </div>
            
            {customer.addresses.length > 0 ? (
              <div className="space-y-4">
                {customer.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border border-gray-200 rounded-md p-4 relative"
                  >
                    {address.isDefault && (
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Padrão
                      </span>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        {address.type === 'shipping'
                          ? 'Endereço de Entrega'
                          : address.type === 'billing'
                          ? 'Endereço de Cobrança'
                          : 'Endereço de Entrega e Cobrança'}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => openAddressModal(address)}
                        >
                          <svg
                            className="h-4 w-4"
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
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => deleteAddress(address.id || '')}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <address className="not-italic text-sm">
                      <p>
                        {address.street}, {address.number}
                        {address.complement && `, ${address.complement}`}
                      </p>
                      <p>
                        {address.neighborhood} - {address.city}/{address.state}
                      </p>
                      <p>CEP: {address.zipCode}</p>
                      <p>{address.country}</p>
                    </address>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Nenhum endereço cadastrado
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Pedidos Recentes</h2>
              <Link
                href={`/dashboard/orders?customer=${customer.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                Ver todos os pedidos
              </Link>
            </div>
            
            {customer.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-sm font-medium text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pl-4">ID</th>
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Pagamento</th>
                      <th className="pb-3 pr-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-4 pl-4 font-medium">#{order.id}</td>
                        <td className="py-4">{formatDate(order.date)}</td>
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
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {getStatusText(order.paymentStatus)}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ver detalhes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Nenhum pedido encontrado
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Resumo do Cliente
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-xl font-bold">{customer.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-xl font-bold">R$ {customer.totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Médio do Pedido</p>
                <p className="text-xl font-bold">R$ {customer.averageOrderValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Último Pedido</p>
                <p className="font-medium">{formatDate(customer.lastOrderDate)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Ações Rápidas
            </h2>
            <div className="space-y-3">
              <button
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={() => router.push(`/dashboard/orders/new?customer=${customer.id}`)}
              >
                Criar Novo Pedido
              </button>
              <button
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                onClick={() => toast.info('Funcionalidade de enviar email será implementada em breve')}
              >
                Enviar Email
              </button>
              <button
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                onClick={() => toast.info('Funcionalidade de enviar mensagem será implementada em breve')}
              >
                Enviar Mensagem
              </button>
              {customer.status === 'active' ? (
                <button
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, status: 'inactive' }));
                    handleSave();
                  }}
                  disabled={isSaving}
                >
                  Desativar Cliente
                </button>
              ) : (
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, status: 'active' }));
                    handleSave();
                  }}
                  disabled={isSaving}
                >
                  Ativar Cliente
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Endereço */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentAddress ? 'Editar Endereço' : 'Adicionar Novo Endereço'}
              </h2>
              <button
                onClick={closeAddressModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua/Avenida *
                </label>
                <input
                  type="text"
                  name="street"
                  value={addressForm.street}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  name="number"
                  value={addressForm.number}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  value={addressForm.complement}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={addressForm.neighborhood}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={addressForm.zipCode}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Endereço
                </label>
                <select
                  name="type"
                  value={addressForm.type}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="shipping">Entrega</option>
                  <option value="billing">Cobrança</option>
                  <option value="both">Entrega e Cobrança</option>
                </select>
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressCheckboxChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="isDefault"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Definir como endereço padrão
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={closeAddressModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveAddress}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
