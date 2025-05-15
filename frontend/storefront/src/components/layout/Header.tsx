'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items, quantity } = useAppSelector((state) => state.cart);

  // Controle de scroll para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lista de categorias - normalmente viria de uma API
  const categories = [
    { name: 'Eletrônicos', href: '/categorias/eletronicos' },
    { name: 'Moda', href: '/categorias/moda' },
    { name: 'Casa & Decoração', href: '/categorias/casa-decoracao' },
    { name: 'Beleza & Saúde', href: '/categorias/beleza-saude' },
    { name: 'Livros', href: '/categorias/livros' },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      {/* Topo do Header - Logo, busca e ícones */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-purple-600">EcomSaaS</span>
              <span className="ml-1 text-xs font-semibold text-gray-500">Store</span>
            </Link>
          </div>

          {/* Busca - apenas em telas maiores */}
          <div className="hidden md:block flex-grow mx-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Ícones - usuário, favoritos, carrinho */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-purple-600 transition-colors">
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
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-purple-600 transition-colors relative">
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
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </button>
            <Link href="/carrinho" className="text-gray-600 hover:text-purple-600 transition-colors relative">
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
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              {quantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {quantity}
                </span>
              )}
            </Link>
            
            {/* Menu hamburguer para mobile */}
            <button
              className="block md:hidden text-gray-600 hover:text-purple-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              ) : (
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
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Campo de busca para mobile */}
        <div className="mt-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className={`${
        isMenuOpen ? 'block' : 'hidden md:block'
      } bg-white md:bg-transparent mt-4 md:mt-2`}>
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:justify-center md:space-x-8">
            <li>
              <Link
                href="/"
                className={`block py-2 text-sm font-medium hover:text-purple-600 ${
                  pathname === '/' ? 'text-purple-600' : 'text-gray-700'
                }`}
              >
                Início
              </Link>
            </li>
            {categories.map((category, index) => (
              <li key={index}>
                <Link
                  href={category.href}
                  className={`block py-2 text-sm font-medium hover:text-purple-600 ${
                    pathname === category.href ? 'text-purple-600' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/promocoes"
                className={`block py-2 text-sm font-medium hover:text-purple-600 ${
                  pathname === '/promocoes' ? 'text-purple-600' : 'text-gray-700'
                }`}
              >
                Promoções
              </Link>
            </li>
            <li>
              <Link
                href="/contato"
                className={`block py-2 text-sm font-medium hover:text-purple-600 ${
                  pathname === '/contato' ? 'text-purple-600' : 'text-gray-700'
                }`}
              >
                Contato
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
