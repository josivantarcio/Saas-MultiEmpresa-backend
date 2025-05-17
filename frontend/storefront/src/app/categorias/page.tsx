'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StoreLayout from '@/components/layout/StoreLayout';

// Tipos
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
  subcategories?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      
      try {
        // Simulação de chamada de API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados simulados de categorias
        const categoriesData: Category[] = [
          {
            id: '1',
            name: 'Eletrônicos',
            slug: 'eletronicos',
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
          },
          {
            id: '2',
            name: 'Moda',
            slug: 'moda',
            description: 'Roupas, calçados e acessórios para todos os estilos.',
            imageUrl: '/images/categories/moda.jpg',
            productCount: 243,
            subcategories: [
              {
                id: '2-1',
                name: 'Roupas Masculinas',
                slug: 'roupas-masculinas',
                description: 'Camisas, calças, bermudas e mais para homens.',
                imageUrl: '/images/categories/roupas-masculinas.jpg',
                productCount: 78
              },
              {
                id: '2-2',
                name: 'Roupas Femininas',
                slug: 'roupas-femininas',
                description: 'Vestidos, blusas, saias e mais para mulheres.',
                imageUrl: '/images/categories/roupas-femininas.jpg',
                productCount: 112
              },
              {
                id: '2-3',
                name: 'Calçados',
                slug: 'calcados',
                description: 'Tênis, sapatos, sandálias e mais.',
                imageUrl: '/images/categories/calcados.jpg',
                productCount: 53
              }
            ]
          },
          {
            id: '3',
            name: 'Casa e Decoração',
            slug: 'casa-e-decoracao',
            description: 'Móveis, decoração, utensílios e mais para sua casa.',
            imageUrl: '/images/categories/casa.jpg',
            productCount: 187,
            subcategories: [
              {
                id: '3-1',
                name: 'Móveis',
                slug: 'moveis',
                description: 'Sofás, mesas, cadeiras e mais para sua casa.',
                imageUrl: '/images/categories/moveis.jpg',
                productCount: 64
              },
              {
                id: '3-2',
                name: 'Decoração',
                slug: 'decoracao',
                description: 'Quadros, vasos, tapetes e mais para decorar sua casa.',
                imageUrl: '/images/categories/decoracao.jpg',
                productCount: 82
              },
              {
                id: '3-3',
                name: 'Utensílios',
                slug: 'utensilios',
                description: 'Panelas, talheres, pratos e mais para sua cozinha.',
                imageUrl: '/images/categories/utensilios.jpg',
                productCount: 41
              }
            ]
          },
          {
            id: '4',
            name: 'Esportes e Lazer',
            slug: 'esportes-e-lazer',
            description: 'Equipamentos esportivos, roupas fitness e artigos para lazer.',
            imageUrl: '/images/categories/esportes.jpg',
            productCount: 134,
            subcategories: [
              {
                id: '4-1',
                name: 'Fitness',
                slug: 'fitness',
                description: 'Equipamentos e acessórios para academia e treinos.',
                imageUrl: '/images/categories/fitness.jpg',
                productCount: 48
              },
              {
                id: '4-2',
                name: 'Futebol',
                slug: 'futebol',
                description: 'Bolas, chuteiras, uniformes e mais para futebol.',
                imageUrl: '/images/categories/futebol.jpg',
                productCount: 36
              },
              {
                id: '4-3',
                name: 'Camping',
                slug: 'camping',
                description: 'Barracas, mochilas, lanternas e mais para camping.',
                imageUrl: '/images/categories/camping.jpg',
                productCount: 29
              }
            ]
          }
        ];
        
        setCategories(categoriesData);
      } catch (err) {
        setError('Erro ao carregar categorias. Por favor, tente novamente.');
        console.error('Erro ao buscar categorias:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

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
  if (error) {
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
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Título da página */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Categorias</h1>
          <p className="mt-4 text-lg text-gray-500">
            Explore nossos produtos por categorias
          </p>
        </div>

        {/* Lista de categorias principais */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {categories.map((category) => (
            <div key={category.id} className="group relative">
              <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75">
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-center object-cover"
                    width={500}
                    height={500}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link href={`/categorias/${category.slug}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {category.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{category.productCount} produtos</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{category.description}</p>
            </div>
          ))}
        </div>

        {/* Subcategorias populares */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Subcategorias populares</h2>
          
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {categories.flatMap(category => 
              (category.subcategories || []).slice(0, 2)
            ).map((subcategory) => (
              <div key={subcategory.id} className="group relative">
                <div className="w-full h-60 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75">
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    <Image
                      src={subcategory.imageUrl}
                      alt={subcategory.name}
                      className="w-full h-full object-center object-cover"
                      width={400}
                      height={300}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link href={`/categorias/${subcategory.slug}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {subcategory.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{subcategory.productCount} produtos</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{subcategory.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
