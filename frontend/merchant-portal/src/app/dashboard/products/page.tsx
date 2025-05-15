'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulando carregamento de dados do backend
    const fetchProducts = () => {
      setIsLoading(true);
      // Em um cenário real, isso seria uma chamada à API
      setTimeout(() => {
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Smartphone XYZ',
            price: 1299.99,
            stock: 45,
            category: 'Eletrônicos',
            status: 'active',
            createdAt: '2025-04-10',
          },
          {
            id: '2',
            name: 'Notebook Ultra Slim',
            price: 3499.90,
            stock: 12,
            category: 'Eletrônicos',
            status: 'active',
            createdAt: '2025-04-15',
          },
          {
            id: '3',
            name: 'Fones de Ouvido Bluetooth',
            price: 199.90,
            stock: 78,
            category: 'Acessórios',
            status: 'active',
            createdAt: '2025-04-20',
          },
          {
            id: '4',
            name: 'Câmera Digital 4K',
            price: 1899.90,
            stock: 8,
            category: 'Eletrônicos',
            status: 'inactive',
            createdAt: '2025-04-25',
          },
          {
            id: '5',
            name: 'Smartwatch Fitness',
            price: 499.90,
            stock: 23,
            category: 'Acessórios',
            status: 'active',
            createdAt: '2025-04-30',
          },
          {
            id: '6',
            name: 'Caixa de Som Portátil',
            price: 299.90,
            stock: 34,
            category: 'Acessórios',
            status: 'draft',
            createdAt: '2025-05-05',
          },
          {
            id: '7',
            name: 'Tablet Pro',
            price: 1599.90,
            stock: 15,
            category: 'Eletrônicos',
            status: 'active',
            createdAt: '2025-05-10',
          },
        ];
        setProducts(mockProducts);
        setIsLoading(false);
      }, 1000);
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      // Em um cenário real, isso seria uma chamada à API
      setProducts(products.filter((product) => product.id !== id));
      toast.success('Produto excluído com sucesso!');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Eletrônicos', 'Acessórios'];
  const statuses = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'draft', label: 'Rascunho' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'draft':
        return 'Rascunho';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <Link
          href="/dashboard/products/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Adicionar Produto
        </Link>
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
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="category" className="sr-only">
              Categoria
            </label>
            <select
              id="category"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
                  <th className="pb-3 pl-4">Nome</th>
                  <th className="pb-3">Preço</th>
                  <th className="pb-3">Estoque</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Data de Criação</th>
                  <th className="pb-3 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 pl-4 font-medium">{product.name}</td>
                      <td className="py-4">R$ {product.price.toFixed(2)}</td>
                      <td className="py-4">{product.stock}</td>
                      <td className="py-4">{product.category}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td className="py-4">{product.createdAt}</td>
                      <td className="py-4 pr-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <span className="sr-only">Editar</span>
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
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <span className="sr-only">Excluir</span>
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 text-center text-gray-500 font-medium"
                    >
                      Nenhum produto encontrado
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
