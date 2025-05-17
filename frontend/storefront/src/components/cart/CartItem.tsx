'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAppDispatch } from '../../redux/hooks';
import { updateCartItem, removeFromCart } from '../../redux/cartSlice';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartItem({ id, name, price, image, quantity }: CartItemProps) {
  const [itemQuantity, setItemQuantity] = useState(quantity);
  const dispatch = useAppDispatch();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value);
    setItemQuantity(newQuantity);
    dispatch(updateCartItem({ id, quantity: newQuantity }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      {/* Imagem do produto */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden relative">
        <Image
          src={image}
          alt={name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Informações do produto */}
      <div className="ml-4 flex-grow">
        <h3 className="text-sm font-medium text-gray-800">{name}</h3>
        <p className="text-sm text-purple-600 font-semibold mt-1">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(price)}
        </p>
      </div>

      {/* Controles de quantidade */}
      <div className="flex items-center">
        <select
          value={itemQuantity}
          onChange={handleQuantityChange}
          className="mr-4 p-1 border border-gray-300 rounded text-sm"
          aria-label="Quantidade"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <button
          onClick={handleRemove}
          className="text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Remover item"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
