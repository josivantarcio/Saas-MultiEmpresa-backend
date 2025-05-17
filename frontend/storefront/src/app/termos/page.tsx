'use client';

import Link from 'next/link';
import StoreLayout from '@/components/layout/StoreLayout';

export default function TermsPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Termos de Uso</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span>Termos de Uso</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma EcomSaaS Store, você concorda em cumprir e ficar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>

            <h2>2. Cadastro e Conta</h2>
            <p>
              Para utilizar determinadas funcionalidades da plataforma, é necessário realizar um cadastro e criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
            </p>
            <p>
              Ao se cadastrar, você concorda em fornecer informações verdadeiras, precisas, atuais e completas sobre si mesmo. A EcomSaaS Store reserva-se o direito de suspender ou encerrar sua conta caso seja constatado que as informações fornecidas são falsas, imprecisas ou enganosas.
            </p>

            <h2>3. Uso da Plataforma</h2>
            <p>
              A plataforma EcomSaaS Store destina-se ao uso pessoal e não comercial, a menos que explicitamente autorizado por nós. Você concorda em não utilizar a plataforma para:
            </p>
            <ul>
              <li>Violar leis, regulamentos ou direitos de terceiros;</li>
              <li>Publicar, enviar ou distribuir conteúdo ilegal, difamatório, obsceno ou ofensivo;</li>
              <li>Interferir ou interromper a segurança ou funcionalidade da plataforma;</li>
              <li>Coletar ou armazenar dados pessoais de outros usuários sem autorização;</li>
              <li>Utilizar robôs, spiders ou outros meios automatizados para acessar a plataforma sem autorização expressa.</li>
            </ul>

            <h2>4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponibilizado na plataforma EcomSaaS Store, incluindo, mas não se limitando a textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é de propriedade exclusiva da EcomSaaS Store ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais.
            </p>
            <p>
              Você não pode modificar, reproduzir, distribuir, criar trabalhos derivados, exibir publicamente, executar publicamente, republicar, baixar, armazenar ou transmitir qualquer material da plataforma sem autorização prévia por escrito.
            </p>

            <h2>5. Produtos e Serviços</h2>
            <p>
              A EcomSaaS Store se esforça para apresentar descrições precisas dos produtos e serviços oferecidos. No entanto, não garantimos que as descrições, cores, informações ou outros conteúdos disponíveis na plataforma sejam precisos, completos, confiáveis, atuais ou livres de erros.
            </p>
            <p>
              Reservamo-nos o direito de descontinuar qualquer produto ou serviço a qualquer momento. Os preços dos produtos estão sujeitos a alterações sem aviso prévio.
            </p>

            <h2>6. Política de Privacidade</h2>
            <p>
              Ao utilizar a plataforma EcomSaaS Store, você concorda com nossa Política de Privacidade, que descreve como coletamos, usamos e compartilhamos suas informações pessoais. Recomendamos que você leia nossa Política de Privacidade para entender nossas práticas.
            </p>

            <h2>7. Limitação de Responsabilidade</h2>
            <p>
              Em nenhuma circunstância a EcomSaaS Store, seus diretores, funcionários, agentes ou afiliados serão responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais, punitivos ou consequentes decorrentes do uso ou incapacidade de uso da plataforma ou de qualquer conteúdo, produto ou serviço obtido através da plataforma.
            </p>

            <h2>8. Indenização</h2>
            <p>
              Você concorda em indenizar, defender e isentar a EcomSaaS Store, seus diretores, funcionários, agentes e afiliados de e contra quaisquer reclamações, responsabilidades, danos, perdas e despesas, incluindo, sem limitação, honorários advocatícios razoáveis, decorrentes de ou de qualquer forma relacionados à sua violação destes Termos de Uso.
            </p>

            <h2>9. Modificações dos Termos</h2>
            <p>
              A EcomSaaS Store reserva-se o direito de modificar estes Termos de Uso a qualquer momento, a seu exclusivo critério. As alterações entrarão em vigor imediatamente após a publicação dos termos atualizados na plataforma. O uso contínuo da plataforma após a publicação das alterações constituirá sua aceitação dos termos revisados.
            </p>

            <h2>10. Lei Aplicável</h2>
            <p>
              Estes Termos de Uso serão regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa decorrente ou relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais da cidade de São Paulo, SP.
            </p>

            <h2>11. Disposições Gerais</h2>
            <p>
              Se qualquer disposição destes Termos de Uso for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito. A falha da EcomSaaS Store em fazer valer qualquer direito ou disposição destes termos não constituirá uma renúncia a tal direito ou disposição.
            </p>

            <h2>12. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco pelo e-mail: <a href="mailto:josivantarcio@msn.com" className="text-purple-600 hover:text-purple-800">josivantarcio@msn.com</a>.
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
