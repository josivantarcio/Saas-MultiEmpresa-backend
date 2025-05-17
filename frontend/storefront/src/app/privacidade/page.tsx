'use client';

import Link from 'next/link';
import StoreLayout from '@/components/layout/StoreLayout';

export default function PrivacyPolicyPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Política de Privacidade</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span>Política de Privacidade</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none">
            <p className="lead">
              A EcomSaaS Store está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações pessoais quando você utiliza nossa plataforma.
            </p>

            <h2>1. Informações que Coletamos</h2>
            <p>
              Podemos coletar os seguintes tipos de informações:
            </p>
            <h3>1.1. Informações Fornecidas por Você</h3>
            <ul>
              <li>Informações de cadastro (nome, e-mail, telefone, endereço, CPF/CNPJ)</li>
              <li>Informações de pagamento (número do cartão de crédito, dados bancários)</li>
              <li>Conteúdo gerado pelo usuário (avaliações, comentários, perguntas)</li>
              <li>Comunicações com nosso serviço de atendimento ao cliente</li>
            </ul>

            <h3>1.2. Informações Coletadas Automaticamente</h3>
            <ul>
              <li>Dados de uso (páginas visitadas, produtos visualizados, tempo de permanência)</li>
              <li>Informações do dispositivo (tipo de dispositivo, sistema operacional, navegador)</li>
              <li>Endereço IP e localização geográfica aproximada</li>
              <li>Cookies e tecnologias similares</li>
            </ul>

            <h3>1.3. Informações de Terceiros</h3>
            <ul>
              <li>Redes sociais (quando você se conecta através de uma rede social)</li>
              <li>Parceiros comerciais (informações de compra, histórico de crédito)</li>
              <li>Provedores de serviços (verificação de identidade, prevenção de fraudes)</li>
            </ul>

            <h2>2. Como Usamos Suas Informações</h2>
            <p>
              Utilizamos suas informações para os seguintes fins:
            </p>
            <ul>
              <li>Processar e entregar seus pedidos</li>
              <li>Gerenciar sua conta e fornecer suporte ao cliente</li>
              <li>Personalizar sua experiência de compra</li>
              <li>Enviar comunicações de marketing (com seu consentimento)</li>
              <li>Melhorar nossos produtos, serviços e a plataforma</li>
              <li>Detectar, prevenir e resolver fraudes ou problemas técnicos</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>

            <h2>3. Compartilhamento de Informações</h2>
            <p>
              Podemos compartilhar suas informações com:
            </p>
            <ul>
              <li>Parceiros de logística (para entrega de produtos)</li>
              <li>Processadores de pagamento (para processar transações)</li>
              <li>Provedores de serviços (hospedagem, análise de dados, marketing)</li>
              <li>Autoridades governamentais (quando exigido por lei)</li>
              <li>Parceiros comerciais (com seu consentimento explícito)</li>
            </ul>
            <p>
              Não vendemos ou alugamos suas informações pessoais a terceiros para fins de marketing.
            </p>

            <h2>4. Segurança das Informações</h2>
            <p>
              Implementamos medidas técnicas, administrativas e físicas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro, e não podemos garantir segurança absoluta.
            </p>

            <h2>5. Seus Direitos de Privacidade</h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </p>
            <ul>
              <li>Direito de acesso às suas informações pessoais</li>
              <li>Direito de correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Direito de eliminação de dados desnecessários ou excessivos</li>
              <li>Direito de portabilidade dos dados</li>
              <li>Direito de informação sobre o compartilhamento de dados</li>
              <li>Direito de revogação do consentimento</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato conosco através do e-mail <a href="mailto:josivantarcio@msn.com" className="text-purple-600 hover:text-purple-800">josivantarcio@msn.com</a>.
            </p>

            <h2>6. Cookies e Tecnologias Similares</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, entender como você utiliza nossa plataforma e personalizar nosso conteúdo e publicidade. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
            </p>

            <h2>7. Transferência Internacional de Dados</h2>
            <p>
              Suas informações pessoais podem ser transferidas e processadas em países diferentes daquele em que você reside. Nesses casos, implementamos salvaguardas apropriadas para garantir que suas informações permaneçam protegidas de acordo com esta Política de Privacidade e as leis aplicáveis.
            </p>

            <h2>8. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta Política de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
            </p>

            <h2>9. Privacidade de Crianças</h2>
            <p>
              Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos intencionalmente informações pessoais de crianças. Se você acredita que coletamos informações de um menor, entre em contato conosco imediatamente.
            </p>

            <h2>10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre disponível em nossa plataforma, com a data da última atualização. Recomendamos que você revise esta política regularmente.
            </p>

            <h2>11. Contato</h2>
            <p>
              Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <p>
              E-mail: <a href="mailto:josivantarcio@msn.com" className="text-purple-600 hover:text-purple-800">josivantarcio@msn.com</a><br />
              Telefone: (11) 4000-0000<br />
              Endereço: Av. Tecnologia, 1000, Bairro Digital, São Paulo, SP - 01000-000
            </p>

            <div className="mt-8 text-sm text-gray-500">
              <p>Última atualização: 17 de maio de 2025</p>
              <p>© 2025 EcomSaaS Store. Todos os direitos reservados a Jôsevan Tárcio Silva de Oliveira.</p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
