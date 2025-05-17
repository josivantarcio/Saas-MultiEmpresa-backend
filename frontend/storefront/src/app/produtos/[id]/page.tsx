'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import { toast } from 'react-toastify';
import StoreLayout from '@/components/layout/StoreLayout';
import DOMPurify from 'dompurify';

// Tipos
interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  stock: number;
  sku: string;
  specifications: Record<string, string>;
  relatedProducts: string[];
}

export default function ProductDetailsPage() {
  const { id } = useParams() as { id: string };
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  
  // Buscar dados do produto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      try {
        // Simulação de chamada de API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados simulados do produto
        const productData: Product = {
          id,
          name: 'Smartphone Galaxy Ultra Pro',
          price: 2499.90,
          originalPrice: 2999.90,
          discount: 17,
          description: `
            <p>O Smartphone Galaxy Ultra Pro é a mais recente inovação em tecnologia móvel, oferecendo desempenho excepcional e recursos avançados para usuários exigentes.</p>
            
            <p>Com sua tela AMOLED de 6,7 polegadas e resolução 4K, você desfrutará de imagens nítidas e cores vibrantes em qualquer condição de iluminação. O processador octa-core de última geração, combinado com 12GB de RAM, garante uma experiência fluida mesmo em aplicativos e jogos mais pesados.</p>
            
            <p>A câmera principal de 108MP captura fotos impressionantes com detalhes surpreendentes, enquanto o conjunto de lentes adicionais (ultra-wide, telefoto e macro) oferece versatilidade para qualquer situação fotográfica. Para os amantes de selfies, a câmera frontal de 32MP entrega resultados profissionais com modo retrato aprimorado por IA.</p>
            
            <p>A bateria de 5000mAh proporciona mais de um dia inteiro de uso intenso, e com o carregamento rápido de 45W, você pode recarregar de 0 a 70% em apenas 30 minutos.</p>
            
            <p>O Galaxy Ultra Pro roda a mais recente versão do Android, com 5 anos garantidos de atualizações de segurança e 3 anos de atualizações do sistema operacional.</p>
          `,
          shortDescription: 'Smartphone topo de linha com câmera de 108MP, tela AMOLED 6.7" e processador octa-core de última geração.',
          images: [
            { id: '1', url: '/images/products/smartphone-1.jpg', alt: 'Smartphone Galaxy Ultra Pro - Vista frontal' },
            { id: '2', url: '/images/products/smartphone-2.jpg', alt: 'Smartphone Galaxy Ultra Pro - Vista traseira' },
            { id: '3', url: '/images/products/smartphone-3.jpg', alt: 'Smartphone Galaxy Ultra Pro - Vista lateral' },
            { id: '4', url: '/images/products/smartphone-4.jpg', alt: 'Smartphone Galaxy Ultra Pro - Câmeras' }
          ],
          category: 'Eletrônicos',
          subcategory: 'Smartphones',
          rating: 4.8,
          reviewCount: 127,
          reviews: [
            {
              id: '1',
              author: 'Carlos Silva',
              rating: 5,
              comment: 'Excelente smartphone! A câmera é impressionante e a bateria dura o dia todo mesmo com uso intenso.',
              date: '2025-04-15'
            },
            {
              id: '2',
              author: 'Ana Oliveira',
              rating: 4,
              comment: 'Muito bom, mas esquenta um pouco durante jogos pesados. De resto, é perfeito!',
              date: '2025-04-10'
            },
            {
              id: '3',
              author: 'Marcelo Santos',
              rating: 5,
              comment: 'Melhor celular que já tive. A tela é incrível e o desempenho é excelente.',
              date: '2025-04-05'
            }
          ],
          stock: 15,
          sku: 'GALAXY-UP-256-BLK',
          specifications: {
            'Processador': 'Octa-core 2.9GHz',
            'Memória RAM': '12GB',
            'Armazenamento': '256GB (expansível até 1TB)',
            'Tela': 'AMOLED 6.7" (3200x1440)',
            'Câmera Principal': '108MP + 12MP Ultra Wide + 10MP Telefoto + 5MP Macro',
            'Câmera Frontal': '32MP',
            'Bateria': '5000mAh',
            'Sistema Operacional': 'Android 14',
            'Dimensões': '165.1 x 75.6 x 8.9 mm',
            'Peso': '228g',
            'Resistência': 'IP68 (água e poeira)',
            'Conectividade': '5G, Wi-Fi 6E, Bluetooth 5.2, NFC'
          },
          relatedProducts: ['2', '3', '4', '5']
        };
        
        setProduct(productData);
        setSelectedImage(productData.images[0].url);
      } catch (err) {
        setError('Erro ao carregar o produto. Por favor, tente novamente.');
        console.error('Erro ao buscar produto:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  // Funções de manipulação
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (product && value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(value);
    }
  };
  
  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0].url,
      category: product.category
    }));
    
    toast.success(`${product.name} adicionado ao carrinho!`);
  };
  
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Meia estrela
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };
  
  // Exibir mensagem de carregamento ou erro
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
  
  if (error || !product) {
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
                  {error || 'Produto não encontrado. Por favor, verifique o URL ou tente novamente mais tarde.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center py-8">
            <Link href="/produtos" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Voltar para Produtos
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }
  // Renderizar a página de detalhes do produto
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
                <Link href="/produtos" className="ml-1 text-sm font-medium text-gray-700 hover:text-purple-600 md:ml-2">
                  Produtos
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href={`/produtos?categoria=${product.category}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-purple-600 md:ml-2">
                  {product.category}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Produto */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Galeria de imagens */}
          <div className="flex flex-col">
            {/* Imagem principal */}
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden mb-4 bg-gray-100">
              {selectedImage && (
                <div className="relative h-96 w-full">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    className="object-cover object-center w-full h-full"
                    width={600}
                    height={600}
                    priority
                  />
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(image.url)}
                  className={`relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${
                    selectedImage === image.url ? 'ring-2 ring-purple-500' : 'ring-1 ring-gray-200'
                  }`}
                >
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <Image
                    src={image.url}
                    alt={image.alt}
                    className="object-cover object-center w-full h-full"
                    width={150}
                    height={150}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Informações do produto */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            
            {/* Avaliações */}
            <div className="mt-3">
              <div className="flex items-center">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <p className="ml-2 text-sm text-gray-500">{product.reviewCount} avaliações</p>
              </div>
            </div>
            
            {/* Preço */}
            <div className="mt-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</h2>
                {product.originalPrice && (
                  <>
                    <p className="ml-3 text-lg text-gray-500 line-through">{formatCurrency(product.originalPrice)}</p>
                    <p className="ml-2 text-sm font-medium text-red-600">
                      {product.discount}% OFF
                    </p>
                  </>
                )}
              </div>
              
              {/* Disponibilidade */}
              <p className="mt-2 text-sm text-gray-500">
                {product.stock > 0 ? (
                  <>
                    <span className="text-green-600 font-medium">Em estoque</span>
                    {product.stock < 10 && (
                      <span className="ml-2">Apenas {product.stock} unidades disponíveis</span>
                    )}
                  </>
                ) : (
                  <span className="text-red-600 font-medium">Fora de estoque</span>
                )}
              </p>
            </div>
            
            {/* Descrição curta */}
            <div className="mt-6">
              <p className="text-base text-gray-700">{product.shortDescription}</p>
            </div>
            
            {/* SKU */}
            <div className="mt-4">
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
            
            {/* Quantidade e adicionar ao carrinho */}
            <div className="mt-8">
              <div className="flex items-center">
                <label htmlFor="quantity" className="mr-4 text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="p-2 text-gray-600 hover:text-gray-700"
                    disabled={quantity <= 1}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-12 text-center border-0 focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-2 text-gray-600 hover:text-gray-700"
                    disabled={quantity >= product.stock}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${
                    product.stock > 0
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Adicionar ao Carrinho
                </button>
              </div>
              
              {/* Entrega */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Entrega</h3>
                <div className="mt-4 flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-500">Frete grátis para compras acima de R$ 199,00</p>
                </div>
                <div className="mt-2 flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-500">Entrega em até 3 dias úteis</p>
                </div>
              </div>
              
              {/* Garantia */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Garantia</h3>
                <div className="mt-4 flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-500">Garantia de 12 meses diretamente com o fabricante</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Abas de informações adicionais */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('description')}
                className={`${activeTab === 'description' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Descrição
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`${activeTab === 'specifications' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Especificações
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`${activeTab === 'reviews' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Avaliações ({product.reviews.length})
              </button>
            </nav>
          </div>
          
          {/* Conteúdo da aba de descrição */}
          {activeTab === 'description' && (
            <div className="py-6 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
            </div>
          )}
          
          {/* Conteúdo da aba de especificações */}
          {activeTab === 'specifications' && (
            <div className="py-6">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Conteúdo da aba de avaliações */}
          {activeTab === 'reviews' && (
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Avaliações de clientes</h3>
              
              <div className="space-y-6">
                {product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <p className="ml-2 text-sm font-medium text-gray-900">{review.author}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(review.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Este produto ainda não possui avaliações.</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Produtos relacionados */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Produtos relacionados</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Aqui seriam exibidos os produtos relacionados */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group relative">
                <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                  <div className="bg-gray-200 w-full h-48"></div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <span aria-hidden="true" className="absolute inset-0" />
                      Produto Relacionado {i}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Categoria</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">R$ 99,90</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
