'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import { toast } from 'react-toastify';
import StoreLayout from '@/components/layout/StoreLayout';

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
