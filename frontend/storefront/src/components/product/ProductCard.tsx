'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/cartSlice';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
  isNew?: boolean;
  isOnSale?: boolean;
  stock: number;
  category: string;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  slug,
  isNew = false,
  isOnSale = false,
  stock,
  category
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    if (stock > 0) {
      dispatch(
        addToCart({
          id,
          name,
          price,
          image,
          quantity: 1
        })
      );
    }
  };

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div
      className="group relative bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isNew && (
          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
            Novo
          </span>
        )}
        {isOnSale && originalPrice && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
      </div>

      {/* Imagem do produto */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/produtos/${slug}`}>
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </Link>
      </div>

      {/* Informações do produto */}
      <div className="p-4">
        <Link href={`/categorias/${category.toLowerCase().replace(/\s+/g, '-')}`}>
          <p className="text-xs text-gray-500 mb-1 hover:text-purple-600 transition-colors">
            {category}
          </p>
        </Link>
        <Link href={`/produtos/${slug}`}>
          <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 min-h-[40px] hover:text-purple-600 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <span className="text-purple-600 font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(price)}
            </span>
            {originalPrice && (
              <span className="text-gray-400 text-xs line-through ml-2">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(originalPrice)}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {stock > 0 ? (
              stock < 5 ? (
                <span className="text-orange-500">
                  Apenas {stock} {stock === 1 ? 'restante' : 'restantes'}
                </span>
              ) : (
                <span className="text-green-500">Em Estoque</span>
              )
            ) : (
              <span className="text-red-500">Esgotado</span>
            )}
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white p-3 flex gap-2 transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded ${
            stock === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          } transition-colors`}
        >
          {stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </button>
        <Link
          href={`/produtos/${slug}`}
          className="py-2 px-3 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}
