'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import { toast } from 'react-toastify';
import StoreLayout from '@/components/layout/StoreLayout';

// Tipos
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
  subcategories?: Category[];
}

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const dispatch = useDispatch();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros e ordenação
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(null);
  
  const productsPerPage = 12;

  // Formatar preço em reais
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Adicionar ao carrinho
  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
      category: product.category
    }));
    
    toast.success(`${product.name} adicionado ao carrinho!`);
  };
  
  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Meia estrela
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-gradient" x1="0" x2="100%" y1="0" y2="0">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#d1d5db" />
            </linearGradient>
          </defs>
          <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Estrelas vazias
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };
  
  // Buscar dados da categoria e produtos
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);
      
      try {
        // Simulação de chamada de API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados simulados da categoria
        const categoryData: Category = {
          id: '1',
          name: 'Eletrônicos',
          slug,
          description: 'Smartphones, tablets, notebooks e outros dispositivos eletrônicos.',
          imageUrl: '/images/categories/eletronicos.jpg',
          productCount: 156,
          subcategories: [
            {
              id: '1-1',
              name: 'Smartphones',
              slug: 'smartphones',
              description: 'Celulares e smartphones das melhores marcas.',
              imageUrl: '/images/categories/smartphones.jpg',
              productCount: 48
            },
            {
              id: '1-2',
              name: 'Notebooks',
              slug: 'notebooks',
              description: 'Notebooks para trabalho, estudo e jogos.',
              imageUrl: '/images/categories/notebooks.jpg',
              productCount: 35
            },
            {
              id: '1-3',
              name: 'Tablets',
              slug: 'tablets',
              description: 'Tablets de diversas marcas e tamanhos.',
              imageUrl: '/images/categories/tablets.jpg',
              productCount: 22
            }
          ]
        };
        
        // Dados simulados de produtos
        const productsData: Product[] = Array.from({ length: 24 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Produto ${i + 1} - ${categoryData.name}`,
          slug: `produto-${i + 1}`,
          price: Math.floor(Math.random() * 4000) + 500,
          originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 1000 : undefined,
          discount: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : undefined,
          imageUrl: `/images/products/product-${(i % 8) + 1}.jpg`,
          category: categoryData.name,
          subcategory: categoryData.subcategories ? categoryData.subcategories[i % categoryData.subcategories.length].name : undefined,
          rating: Math.random() * 3 + 2,
          reviewCount: Math.floor(Math.random() * 100) + 1,
          inStock: Math.random() > 0.2
        }));
        
        setCategory(categoryData);
        setProducts(productsData);
        setTotalPages(Math.ceil(productsData.length / productsPerPage));
      } catch (err) {
        setError('Erro ao carregar categoria. Por favor, tente novamente.');
        console.error('Erro ao buscar categoria:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndProducts();
  }, [slug, productsPerPage]);
  
  // Filtrar e ordenar produtos
  const filteredAndSortedProducts = () => {
    if (!products.length) return [];
    
    let filtered = [...products];
    
    // Filtrar por subcategoria
    if (subcategoryFilter) {
      filtered = filtered.filter(product => product.subcategory === subcategoryFilter);
    }
    
    // Filtrar por preço
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Filtrar por avaliação
    if (selectedRating) {
      filtered = filtered.filter(product => Math.floor(product.rating) >= selectedRating);
    }
    
    // Ordenar produtos
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Simula ordenação por data (usando ID neste exemplo)
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      default: // relevance
        // Mantém a ordem original
        break;
    }
    
    // Paginação
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filtered.slice(startIndex, startIndex + productsPerPage);
    
    // Atualizar total de páginas
    setTotalPages(Math.ceil(filtered.length / productsPerPage));
    
    return paginatedProducts;
  };
  
  // Renderizar estado de carregamento
  if (loading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </StoreLayout>
    );
  }
  
  // Renderizar estado de erro
  if (error || !category) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || 'Categoria não encontrada. Por favor, verifique o URL ou tente novamente mais tarde.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center py-8">
            <Link href="/categorias" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Voltar para Categorias
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }
  
  // Produtos filtrados e ordenados
  const displayProducts = filteredAndSortedProducts();
  
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Início
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href="/categorias" className="ml-1 text-sm font-medium text-gray-700 hover:text-purple-600 md:ml-2">
                  Categorias
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {category.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Cabeçalho da categoria */}
        <div className="relative">
          <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              <Image
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-center object-cover"
                width={1200}
                height={400}
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white">{category.name}</h1>
              <p className="mt-2 text-lg text-white">{category.description}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Filtros para desktop */}
          <div className="hidden lg:block">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
            </div>
            
            {/* Filtro de subcategorias */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="border-b border-gray-200 py-6">
                <h3 className="text-sm font-medium text-gray-900">Subcategorias</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="subcategory-all"
                      name="subcategory"
                      type="radio"
                      checked={subcategoryFilter === null}
                      onChange={() => setSubcategoryFilter(null)}
                      className="h-4 w-4 border-gray-300 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="subcategory-all" className="ml-3 text-sm text-gray-600">
                      Todas as subcategorias
                    </label>
                  </div>
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center">
                      <input
                        id={`subcategory-${subcategory.id}`}
                        name="subcategory"
                        type="radio"
                        checked={subcategoryFilter === subcategory.name}
                        onChange={() => setSubcategoryFilter(subcategory.name)}
                        className="h-4 w-4 border-gray-300 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor={`subcategory-${subcategory.id}`} className="ml-3 text-sm text-gray-600">
                        {subcategory.name} ({subcategory.productCount})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Filtro de preço */}
            <div className="border-b border-gray-200 py-6">
              <h3 className="text-sm font-medium text-gray-900">Preço</h3>
              <div className="mt-4 space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{formatCurrency(priceRange[0])}</span>
                    <span className="text-sm text-gray-600">{formatCurrency(priceRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* Filtro de avaliação */}
            <div className="border-b border-gray-200 py-6">
              <h3 className="text-sm font-medium text-gray-900">Avaliação</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="rating-all"
                    name="rating"
                    type="radio"
                    checked={selectedRating === null}
                    onChange={() => setSelectedRating(null)}
                    className="h-4 w-4 border-gray-300 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="rating-all" className="ml-3 text-sm text-gray-600">
                    Todas as avaliações
                  </label>
                </div>
                {[4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      id={`rating-${rating}`}
                      name="rating"
                      type="radio"
                      checked={selectedRating === rating}
                      onChange={() => setSelectedRating(rating)}
                      className="h-4 w-4 border-gray-300 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`rating-${rating}`} className="ml-3 text-sm text-gray-600 flex items-center">
                      <div className="flex items-center">
                        {renderStars(rating)}
                      </div>
                      <span className="ml-1">e acima</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Produtos */}
          <div className="mt-6 lg:mt-0 lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Mostrando <span className="font-medium">{displayProducts.length}</span> produtos
                  </p>
                </div>
                <div className="flex items-center">
                  <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 mr-2">
                    Ordenar por
                  </label>
                  <select
                    id="sort-by"
                    name="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="price-asc">Preço: Menor para maior</option>
                    <option value="price-desc">Preço: Maior para menor</option>
                    <option value="rating">Avaliação</option>
                    <option value="newest">Mais recentes</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Lista de produtos */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayProducts.map((product) => (
                  <div key={product.id} className="group relative">
                    <div className="w-full h-60 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75">
                      <div className="relative h-full w-full">
                        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-center object-cover"
                          width={400}
                          height={300}
                        />
                      </div>
                    </div>
                    
                    {/* Etiqueta de desconto */}
                    {product.discount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                        {product.discount}% OFF
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          <Link href={`/produtos/${product.id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.subcategory}</p>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          {product.originalPrice ? (
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                              <p className="ml-2 text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</p>
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {renderStars(product.rating)}
                          <span className="ml-1 text-xs text-gray-500">({product.reviewCount})</span>
                        </div>
                      </div>
                      
                      {/* Botão de adicionar ao carrinho */}
                      <div className="mt-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${product.inStock ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        >
                          {product.inStock ? (
                            <>
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Adicionar
                            </>
                          ) : (
                            'Indisponível'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Tente ajustar seus filtros ou buscar por outra categoria.</p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSubcategoryFilter(null);
                      setPriceRange([0, 5000]);
                      setSelectedRating(null);
                      setSortBy('relevance');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === page ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Próxima</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
