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
  originalPrice: number;
  discount: number;
  image: string;
  category: string;
  slug: string;
  stock: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isOnSale: boolean;
  validUntil?: string;
}

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const dispatch = useAppDispatch();

  // Simular carregamento de produtos
  useEffect(() => {
    // Em um cenário real, isso seria uma chamada de API
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados mockados de produtos em promoção
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Smartphone Galaxy X30',
            description: 'O mais novo smartphone com câmera de 108MP e tela AMOLED de 6.7"',
            price: 2499.90,
            originalPrice: 3299.90,
            discount: 24,
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2027&q=80',
            category: 'Eletrônicos',
            slug: 'smartphone-galaxy-x30',
            stock: 15,
            rating: 4.8,
            reviews: 124,
            isOnSale: true,
            validUntil: '2025-06-30'
          },
          {
            id: '2',
            name: 'Notebook Ultra Slim Pro',
            description: 'Notebook ultrafino com processador de última geração e 16GB de RAM',
            price: 4599.90,
            originalPrice: 5999.90,
            discount: 23,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            category: 'Eletrônicos',
            slug: 'notebook-ultra-slim-pro',
            stock: 8,
            rating: 4.7,
            reviews: 89,
            isOnSale: true,
            validUntil: '2025-06-15'
          },
          {
            id: '3',
            name: 'Fones de Ouvido Bluetooth',
            description: 'Fones sem fio com cancelamento de ruído e bateria de longa duração',
            price: 199.90,
            originalPrice: 349.90,
            discount: 43,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Eletrônicos',
            slug: 'fones-de-ouvido-bluetooth',
            stock: 25,
            rating: 4.5,
            reviews: 213,
            isOnSale: true,
            validUntil: '2025-06-20'
          },
          {
            id: '4',
            name: 'Tênis Esportivo Runner',
            description: 'Tênis leve e confortável, ideal para corridas e atividades físicas',
            price: 159.90,
            originalPrice: 259.90,
            discount: 38,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Moda',
            slug: 'tenis-esportivo-runner',
            stock: 32,
            rating: 4.6,
            reviews: 178,
            isOnSale: true,
            validUntil: '2025-07-10'
          },
          {
            id: '5',
            name: 'Cafeteira Elétrica Programável',
            description: 'Cafeteira com timer programável e jarra térmica para 12 xícaras',
            price: 189.90,
            originalPrice: 299.90,
            discount: 37,
            image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Casa & Decoração',
            slug: 'cafeteira-eletrica-programavel',
            stock: 18,
            rating: 4.4,
            reviews: 92,
            isOnSale: true,
            validUntil: '2025-06-25'
          },
          {
            id: '6',
            name: 'Kit Skincare Facial',
            description: 'Kit completo com limpador, tônico, sérum e hidratante facial',
            price: 129.90,
            originalPrice: 219.90,
            discount: 41,
            image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Beleza & Saúde',
            slug: 'kit-skincare-facial',
            stock: 22,
            rating: 4.9,
            reviews: 156,
            isOnSale: true,
            validUntil: '2025-07-05'
          },
          {
            id: '7',
            name: 'Mochila Impermeável',
            description: 'Mochila resistente à água com compartimento para notebook e múltiplos bolsos',
            price: 99.90,
            originalPrice: 179.90,
            discount: 44,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            category: 'Moda',
            slug: 'mochila-impermeavel',
            stock: 29,
            rating: 4.7,
            reviews: 108,
            isOnSale: true,
            validUntil: '2025-06-18'
          },
          {
            id: '8',
            name: 'Conjunto de Panelas Antiaderentes',
            description: 'Kit com 5 panelas antiaderentes com tampas de vidro temperado',
            price: 259.90,
            originalPrice: 459.90,
            discount: 43,
            image: 'https://images.unsplash.com/photo-1584990347449-a40ca2b870b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            category: 'Casa & Decoração',
            slug: 'conjunto-panelas-antiaderentes',
            stock: 12,
            rating: 4.6,
            reviews: 87,
            isOnSale: true,
            validUntil: '2025-07-15'
          }
        ];
        
        setProducts(mockProducts);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.error('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filtrar produtos por categoria
  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => product.category === filter);

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

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Promoções</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span>Promoções</span>
          </div>
        </div>

        {/* Banner promocional */}
        <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-8">
          <Image
            src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2115&q=80"
            alt="Promoções Especiais"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-purple-600/50 flex flex-col justify-center px-8 md:px-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ofertas Imperdíveis</h2>
            <p className="text-lg text-white max-w-md mb-6">
              Aproveite descontos de até 50% em produtos selecionados por tempo limitado.
            </p>
            <div className="inline-block bg-white text-purple-600 font-bold px-4 py-2 rounded-md">
              Válido até 15/07/2025
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-900 mr-4">Filtrar por:</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('Eletrônicos')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === 'Eletrônicos'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Eletrônicos
                </button>
                <button
                  onClick={() => setFilter('Moda')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === 'Moda'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Moda
                </button>
                <button
                  onClick={() => setFilter('Casa & Decoração')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === 'Casa & Decoração'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Casa & Decoração
                </button>
                <button
                  onClick={() => setFilter('Beleza & Saúde')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === 'Beleza & Saúde'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Beleza & Saúde
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {filteredProducts.length} produtos em promoção
            </div>
          </div>
        </div>

        {/* Lista de produtos */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
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
                  Não encontramos produtos em promoção para esta categoria no momento.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Ver todas as promoções
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1"
                  >
                    {/* Badge de desconto */}
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discount}%
                      </div>
                      
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
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
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
                          <span className="text-gray-400 text-xs line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
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
                        className={`w-full mt-4 py-2 px-4 rounded text-sm font-medium ${
                          product.stock === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        } transition-colors`}
                      >
                        {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                      </button>
                      
                      {/* Validade da promoção */}
                      {product.validUntil && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Promoção válida até {new Date(product.validUntil).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Banner informativo */}
        <div className="mt-16 bg-gray-50 rounded-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Fique por dentro das melhores ofertas
              </h2>
              <p className="text-gray-600 mb-6">
                Inscreva-se em nossa newsletter e receba em primeira mão todas as promoções e descontos exclusivos da EcomSaaS Store.
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white font-medium py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Inscrever-se
                </button>
              </form>
            </div>
            <div className="hidden md:block">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Promoções"
                width={500}
                height={300}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
