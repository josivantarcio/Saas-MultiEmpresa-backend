'use client';

import Link from 'next/link';
import StoreLayout from '@/components/layout/StoreLayout';

export default function LicensePage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Licença de Uso</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span>Licença</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mb-4">Licença de Uso Exclusivo</h2>
            
            <div className="mb-6">
              <p className="font-medium">Título:</p>
              <p>EcomSaaS Store</p>
            </div>
            
            <div className="mb-6">
              <p className="font-medium">Proprietário dos Direitos Autorais:</p>
              <p>Jôsevan Tárcio Silva de Oliveira</p>
            </div>
            
            <div className="mb-6">
              <p className="font-medium">Ano:</p>
              <p>2025</p>
            </div>

            <h3 className="text-lg font-bold mt-8 mb-4">Termos e Condições de Uso</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold">1. Direitos Autorais</h4>
                <p>
                  Todo o conteúdo, incluindo mas não se limitando a códigos-fonte, documentação, design, imagens e arquivos relacionados, são de propriedade exclusiva de Jôsevan Tárcio Silva de Oliveira.
                </p>
              </div>

              <div>
                <h4 className="font-bold">2. Uso Proibido</h4>
                <p>
                  É estritamente proibida qualquer forma de cópia, distribuição, modificação, exibição pública, execução pública, reprodução, publicação, licenciamento, criação de trabalhos derivados, transferência ou veda de qualquer informação, software, produtos ou serviços obtidos através deste repositório, sem autorização prévia por escrito do proprietário dos direitos autorais.
                </p>
              </div>

              <div>
                <h4 className="font-bold">3. Uso Permitido</h4>
                <p>
                  O uso deste software é permitido apenas para fins de avaliação e teste, e somente mediante autorização expressa do proprietário dos direitos autorais.
                </p>
              </div>

              <div>
                <h4 className="font-bold">4. Sem Garantias</h4>
                <p>
                  Este software é fornecido "como está", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a, garantias de comercialização, adequação a uma finalidade específica e não violação.
                </p>
              </div>

              <div>
                <h4 className="font-bold">5. Limitação de Responsabilidade</h4>
                <p>
                  Em nenhum caso o proprietário dos direitos autorais será responsável por quaisquer danos (incluindo, sem limitação, danos por perda de lucros, interrupção de negócios, perda de informações ou quaisquer outras perdas pecuniárias) decorrentes do uso ou da impossibilidade de uso deste software.
                </p>
              </div>

              <div>
                <h4 className="font-bold">6. Conformidade</h4>
                <p>
                  O uso deste software implica na aceitação destes termos e condições. Se você não concorda com estes termos, não está autorizado a usar este software.
                </p>
              </div>

              <div>
                <h4 className="font-bold">7. Contato para Permissões</h4>
                <p>
                  Para solicitar permissões de uso além do escopo desta licença, entre em contato com o proprietário dos direitos autorais através do e-mail: <a href="mailto:josivantarcio@msn.com" className="text-purple-600 hover:text-purple-800">josivantarcio@msn.com</a>
                </p>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-center font-bold">
                © 2025 EcomSaaS Store. Todos os direitos reservados a Jôsevan Tárcio Silva de Oliveira.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
