'use client';

import Image from 'next/image';
import Link from 'next/link';
import StoreLayout from '@/components/layout/StoreLayout';

export default function AboutPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sobre Nós</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span>Sobre</span>
          </div>
        </div>

        {/* Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-12">
          <Image
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Equipe EcomSaaS"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nossa História</h2>
            <p className="text-lg text-white max-w-md">
              Transformando o e-commerce brasileiro desde 2025.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Coluna principal */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quem Somos</h2>
              
              <div className="prose max-w-none">
                <p>
                  A EcomSaaS Store é uma plataforma de e-commerce multiempresa desenvolvida por Jôsevan Tárcio Silva de Oliveira, com o objetivo de democratizar o acesso ao comércio eletrônico para empresas de todos os portes no Brasil.
                </p>
                
                <p>
                  Fundada em 2025, nossa plataforma nasceu da percepção de que muitas empresas brasileiras enfrentavam dificuldades para entrar no mercado digital devido aos altos custos e complexidade técnica das soluções existentes. Decidimos criar uma alternativa acessível, intuitiva e completa, que permitisse a qualquer empreendedor iniciar sua jornada no e-commerce com facilidade.
                </p>
                
                <p>
                  Nossa arquitetura de microserviços foi projetada para oferecer escalabilidade, segurança e flexibilidade, permitindo que cada lojista personalize sua experiência de acordo com suas necessidades específicas. Acreditamos que a tecnologia deve ser uma aliada do empreendedor, não um obstáculo.
                </p>
                
                <h3>Nossa Missão</h3>
                <p>
                  Democratizar o acesso ao comércio eletrônico, fornecendo ferramentas tecnológicas acessíveis e de alta qualidade para empreendedores brasileiros, impulsionando o crescimento de seus negócios no ambiente digital.
                </p>
                
                <h3>Nossa Visão</h3>
                <p>
                  Ser reconhecida como a principal plataforma de e-commerce multiempresa do Brasil, conhecida pela excelência em tecnologia, suporte ao cliente e contribuição para o ecossistema empreendedor brasileiro.
                </p>
                
                <h3>Nossos Valores</h3>
                <ul>
                  <li><strong>Inovação:</strong> Buscamos constantemente novas soluções e tecnologias para melhorar nossa plataforma.</li>
                  <li><strong>Acessibilidade:</strong> Acreditamos que a tecnologia de ponta deve estar ao alcance de todos os empreendedores.</li>
                  <li><strong>Qualidade:</strong> Comprometemo-nos com a excelência em cada aspecto de nossos produtos e serviços.</li>
                  <li><strong>Transparência:</strong> Mantemos uma comunicação clara e honesta com nossos clientes e parceiros.</li>
                  <li><strong>Segurança:</strong> Priorizamos a proteção dos dados e transações em nossa plataforma.</li>
                  <li><strong>Comunidade:</strong> Valorizamos o crescimento coletivo e o impacto positivo no ecossistema empreendedor brasileiro.</li>
                </ul>
              </div>
            </div>
            
            {/* Nossa Equipe */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Nossa Equipe</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                      alt="Jôsevan Tárcio Silva de Oliveira"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Jôsevan Tárcio Silva de Oliveira</h3>
                  <p className="text-purple-600 mb-2">Fundador e CEO</p>
                  <p className="text-sm text-gray-600">
                    Desenvolvedor full-stack com mais de 10 anos de experiência em e-commerce e arquitetura de sistemas.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                      alt="Ana Silva"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Ana Silva</h3>
                  <p className="text-purple-600 mb-2">Diretora de Operações</p>
                  <p className="text-sm text-gray-600">
                    Especialista em gestão de e-commerce com experiência em grandes marketplaces brasileiros.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                      alt="Carlos Mendes"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Carlos Mendes</h3>
                  <p className="text-purple-600 mb-2">CTO</p>
                  <p className="text-sm text-gray-600">
                    Arquiteto de sistemas com foco em microserviços e soluções escaláveis em nuvem.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                      alt="Mariana Costa"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Mariana Costa</h3>
                  <p className="text-purple-600 mb-2">Diretora de Marketing</p>
                  <p className="text-sm text-gray-600">
                    Especialista em marketing digital com foco em aquisição e retenção de clientes.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Coluna lateral */}
          <div className="md:col-span-1">
            {/* Por que nos escolher */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Por que nos escolher?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Solução Completa</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Oferecemos uma plataforma completa, desde o cadastro de produtos até o pós-venda.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Arquitetura Moderna</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Utilizamos microserviços e tecnologias de ponta para garantir desempenho e escalabilidade.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Suporte Especializado</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Equipe de suporte técnico dedicada e especializada em e-commerce.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Segurança de Dados</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Implementamos as melhores práticas de segurança para proteger seus dados e de seus clientes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Preço Justo</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Planos acessíveis para empresas de todos os tamanhos, sem taxas ocultas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Depoimentos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O que dizem nossos clientes</h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="text-sm text-gray-600 italic mb-2">
                    "A EcomSaaS Store transformou meu negócio. Em apenas três meses, minhas vendas online aumentaram em 70%. A plataforma é intuitiva e o suporte é excelente."
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    — Maria Santos, Loja de Roupas
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="text-sm text-gray-600 italic mb-2">
                    "Depois de testar várias plataformas, finalmente encontrei a EcomSaaS Store. A facilidade de uso e a flexibilidade são incomparáveis. Recomendo a todos os empreendedores."
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    — João Oliveira, Loja de Eletrônicos
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="text-sm text-gray-600 italic mb-2">
                    "A arquitetura de microserviços da plataforma nos permitiu escalar rapidamente durante a Black Friday. Não tivemos nenhum problema de desempenho, mesmo com o aumento de 300% no tráfego."
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    — Carla Mendes, Marketplace
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link
                  href="/contato"
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  Ver mais depoimentos →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="bg-purple-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Pronto para transformar seu negócio?</h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Junte-se a milhares de empreendedores que já estão utilizando a EcomSaaS Store para expandir seus negócios no mundo digital.
          </p>
          <Link
            href="/contato"
            className="bg-white text-purple-600 font-medium py-3 px-8 rounded-md hover:bg-gray-100 transition-colors inline-block"
          >
            Fale Conosco
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}
