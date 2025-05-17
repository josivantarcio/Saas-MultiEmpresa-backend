'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StoreLayout from '@/components/layout/StoreLayout';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/cartSlice';
import { toast } from 'react-toastify';

// Tipos
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  stock: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const dispatch = useAppDispatch();

  // Simular carregamento de produtos e categorias
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Categorias mockadas
        const mockCategories: Category[] = [
          { id: '1', name: 'Eletrônicos', slug: 'eletronicos' },
          { id: '2', name: 'Moda', slug: 'moda' },
          { id: '3', name: 'Casa & Decoração', slug: 'casa-decoracao' },
          { id: '4', name: 'Beleza & Saúde', slug: 'beleza-saude' },
          { id: '5', name: 'Esportes', slug: 'esportes' },
          { id: '6', name: 'Livros', slug: 'livros' },
        ];
        
        // Produtos mockados
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Smartphone Galaxy X30',
            description: 'O mais novo smartphone com câmera de 108MP e tela AMOLED de 6.7"',
            price: 2499.90,
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2027&q=80',
            category: 'Eletrônicos',
            slug: 'smartphone-galaxy-x30',
            stock: 15,
            rating: 4.8,
            reviews: 124,
            isOnSale: true,
            discount: 24
          },
          {
            id: '2',
            name: 'Notebook Ultra Slim Pro',
            description: 'Notebook ultrafino com processador de última geração e 16GB de RAM',
            price: 4599.90,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            category: 'Eletrônicos',
            slug: 'notebook-ultra-slim-pro',
            stock: 8,
            rating: 4.7,
            reviews: 89
          },
          {
            id: '3',
            name: 'Fones de Ouvido Bluetooth',
            description: 'Fones sem fio com cancelamento de ruído e bateria de longa duração',
            price: 199.90,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Eletrônicos',
            slug: 'fones-de-ouvido-bluetooth',
            stock: 25,
            rating: 4.5,
            reviews: 213,
            isOnSale: true,
            discount: 43
          },
          {
            id: '4',
            name: 'Tênis Esportivo Runner',
            description: 'Tênis leve e confortável, ideal para corridas e atividades físicas',
            price: 159.90,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Moda',
            slug: 'tenis-esportivo-runner',
            stock: 32,
            rating: 4.6,
            reviews: 178,
            isNew: true
          },
          {
            id: '5',
            name: 'Cafeteira Elétrica Programável',
            description: 'Cafeteira com timer programável e jarra térmica para 12 xícaras',
            price: 189.90,
            image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Casa & Decoração',
            slug: 'cafeteira-eletrica-programavel',
            stock: 18,
            rating: 4.4,
            reviews: 92
          },
          {
            id: '6',
            name: 'Kit Skincare Facial',
            description: 'Kit completo com limpador, tônico, sérum e hidratante facial',
            price: 129.90,
            image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Beleza & Saúde',
            slug: 'kit-skincare-facial',
            stock: 22,
            rating: 4.9,
            reviews: 156,
            isNew: true
          },
          {
            id: '7',
            name: 'Mochila Impermeável',
            description: 'Mochila resistente à água com compartimento para notebook e múltiplos bolsos',
            price: 99.90,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            category: 'Moda',
            slug: 'mochila-impermeavel',
            stock: 29,
            rating: 4.7,
            reviews: 108
          },
          {
            id: '8',
            name: 'Conjunto de Panelas Antiaderentes',
            description: 'Kit com 5 panelas antiaderentes com tampas de vidro temperado',
            price: 259.90,
            image: 'https://images.unsplash.com/photo-1584990347449-a40ca2b870b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Casa & Decoração',
            slug: 'conjunto-panelas-antiaderentes',
            stock: 12,
            rating: 4.6,
            reviews: 87
          },
          {
            id: '9',
            name: 'Relógio Inteligente Fitness',
            description: 'Smartwatch com monitoramento cardíaco, GPS e mais de 20 modos esportivos',
            price: 349.90,
            image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
            category: 'Eletrônicos',
            slug: 'relogio-inteligente-fitness',
            stock: 20,
            rating: 4.5,
            reviews: 134,
            isNew: true
          },
          {
            id: '10',
            name: 'Camiseta Básica Algodão',
            description: 'Camiseta 100% algodão, confortável e versátil para o dia a dia',
            price: 49.90,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
            category: 'Moda',
            slug: 'camiseta-basica-algodao',
            stock: 50,
            rating: 4.3,
            reviews: 215
          },
          {
            id: '11',
            name: 'Livro: O Poder do Hábito',
            description: 'Best-seller sobre como criar e mudar hábitos para uma vida melhor',
            price: 39.90,
            image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            category: 'Livros',
            slug: 'livro-poder-do-habito',
            stock: 30,
            rating: 4.8,
            reviews: 189
          },
          {
            id: '12',
            name: 'Bola de Futebol Profissional',
            description: 'Bola oficial com tecnologia de controle e precisão para jogos profissionais',
            price: 89.90,
            image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Esportes',
            slug: 'bola-futebol-profissional',
            stock: 25,
            rating: 4.7,
            reviews: 98
          },
          {
            id: '13',
            name: 'Secador de Cabelo Profissional',
            description: 'Secador potente com tecnologia iônica para um secagem rápida e sem frizz',
            price: 159.90,
            image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80',
            category: 'Beleza & Saúde',
            slug: 'secador-cabelo-profissional',
            stock: 15,
            rating: 4.6,
            reviews: 112
          },
          {
            id: '14',
            name: 'Cadeira de Escritório Ergonômica',
            description: 'Cadeira com design ergonômico, ajustes de altura e encosto para maior conforto',
            price: 499.90,
            image: 'https://images.unsplash.com/photo-1505843490578-27dded2a51b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            category: 'Casa & Decoração',
            slug: 'cadeira-escritorio-ergonomica',
            stock: 10,
            rating: 4.5,
            reviews: 76
          },
          {
            id: '15',
            name: 'Tênis de Corrida Profissional',
            description: 'Tênis leve com amortecimento e suporte para corridas de longa distância',
            price: 299.90,
            image: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1965&q=80',
            category: 'Esportes',
            slug: 'tenis-corrida-profissional',
            stock: 18,
            rating: 4.9,
            reviews: 145,
            isNew: true
          },
          {
            id: '16',
            name: 'Livro: Pai Rico, Pai Pobre',
            description: 'Best-seller sobre educação financeira e investimentos',
            price: 34.90,
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2012&q=80',
            category: 'Livros',
            slug: 'livro-pai-rico-pai-pobre',
            stock: 22,
            rating: 4.7,
            reviews: 203
          }
        ];
        
        setCategories(mockCategories);
        setProducts(mockProducts);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar produtos por categoria e preço
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesPrice;
  });

  // Ordenar produtos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return a.isNew ? -1 : b.isNew ? 1 : 0;
      default: // featured
        return 0;
    }
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Adicionar produto ao carrinho
  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
    );
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  // Formatar preço em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Mudar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Mudar categoria
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Mudar ordenação
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Mudar faixa de preço
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const name = e.target.name;
    
    if (name === 'min') {
      setPriceRange([value, priceRange[1]]);
    } else if (name === 'max') {
      setPriceRange([priceRange[0], value]);
    }
    
    setCurrentPage(1);
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span>Produtos</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Barra lateral com filtros */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
              
              {/* Filtro por categoria */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categorias</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="category-all"
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => handleCategoryChange('all')}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="category-all" className="ml-2 text-sm text-gray-700">
                      Todas as categorias
                    </label>
                  </div>
                  
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        id={`category-${category.id}`}
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.name}
                        onChange={() => handleCategoryChange(category.name)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Filtro por preço */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Faixa de Preço</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price-min" className="block text-xs text-gray-500 mb-1">
                      Mínimo
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        id="price-min"
                        name="min"
                        min="0"
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={handlePriceRangeChange}
                        className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="price-max" className="block text-xs text-gray-500 mb-1">
                      Máximo
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        id="price-max"
                        name="max"
                        min={priceRange[0]}
                        value={priceRange[1]}
                        onChange={handlePriceRangeChange}
                        className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Faixa selecionada: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                </div>
              </div>
              
              {/* Filtro por avaliação */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Avaliação</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center">
                      <input
                        id={`rating-${rating}`}
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor={`rating-${rating}`} className="ml-2 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                        <span className="ml-1 text-xs text-gray-500">
                          ou mais
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Botão de limpar filtros */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 5000]);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="lg:w-3/4">
            {/* Barra de ordenação */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <span className="text-sm text-gray-500">
                  Mostrando {filteredProducts.length} produtos
                </span>
              </div>
              <div className="flex items-center">
                <label htmlFor="sort-by" className="text-sm text-gray-700 mr-2">
                  Ordenar por:
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="rating">Melhor Avaliação</option>
                  <option value="newest">Novidades</option>
                </select>
              </div>
            </div>
            
            {/* Lista de produtos */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Não encontramos produtos que correspondam aos filtros selecionados.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setPriceRange([0, 5000]);
                      }}
                      className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentItems.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1"
                        >
                          {/* Badge de desconto ou novidade */}
                          <div className="relative">
                            {product.isOnSale && (
                              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                -{product.discount}%
                              </div>
                            )}
                            {product.isNew && (
                              <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                Novo
                              </div>
                            )}
                            
                            {/* Imagem do produto */}
                            <Link href={`/produtos/${product.slug}`}>
                              <div className="relative aspect-square overflow-hidden">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-500 hover:scale-105"
                                />
                              </div>
                            </Link>
                          </div>
                          
                          {/* Informações do produto */}
                          <div className="p-4">
                            <Link href={`/categorias/${product.category.toLowerCase().replace(/\s+/g, '-')}`}>
                              <p className="text-xs text-gray-500 mb-1 hover:text-purple-600 transition-colors">
                                {product.category}
                              </p>
                            </Link>
                            
                            <Link href={`/produtos/${product.slug}`}>
                              <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 min-h-[40px] hover:text-purple-600 transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            
                            {/* Avaliações */}
                            <div className="flex items-center mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 ml-1">
                                ({product.reviews})
                              </span>
                            </div>
                            
                            {/* Preços */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col">
                                <span className="text-purple-600 font-bold">
                                  {formatCurrency(product.price)}
                                </span>
                                {product.isOnSale && product.discount && (
                                  <span className="text-gray-400 text-xs line-through">
                                    {formatCurrency(product.price * (100 / (100 - product.discount)))}
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                {product.stock > 0 ? (
                                  product.stock < 5 ? (
                                    <span className="text-orange-500">
                                      Apenas {product.stock} {product.stock === 1 ? 'restante' : 'restantes'}
                                    </span>
                                  ) : (
                                    <span className="text-green-500">Em Estoque</span>
                                  )
                                ) : (
                                  <span className="text-red-500">Esgotado</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Botão de adicionar ao carrinho */}
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className={`w-full mt-4 py-2 px-4 rounded text-sm font-medium ${product.stock === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'} transition-colors`}
                            >
                              {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <nav className="flex items-center">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            Anterior
                          </button>
                          
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`px-3 py-1 border-t border-b ${currentPage === pageNumber ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-r-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            Próxima
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
