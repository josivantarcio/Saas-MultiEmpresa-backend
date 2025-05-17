import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'source.unsplash.com',
      'localhost',
      'via.placeholder.com',
      'loremflickr.com'
    ],
  },
  // Configuração para melhorar o desempenho
  reactStrictMode: true,
  swcMinify: true,
  // Ativar compressão
  compress: true,
  // Otimizações adicionais
  poweredByHeader: false,
  generateEtags: true,
  // Configuração para melhorar o cache
  experimental: {
    // Habilita o cache de imagens
    images: {
      allowFutureImage: true,
    },
  },
};

export default nextConfig;
