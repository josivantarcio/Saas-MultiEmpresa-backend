#!/usr/bin/env node

/**
 * Script de Auditoria de Segurança para EcomSaaS Store
 * 
 * Este script realiza verificações básicas de segurança no código-fonte
 * para identificar potenciais vulnerabilidades.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const CONFIG = {
  extensoesArquivos: ['.js', '.jsx', '.ts', '.tsx', '.json', '.env', '.yaml', '.yml'],
  palavrasChaveRiscos: [
    // Injeção
    'eval\\(', 'new Function\\(', 'exec\\(', 'execSync\\(',
    // XSS
    'dangerouslySetInnerHTML', 'innerHTML', 'document\\.write',
    // Segurança de Dados
    'password', 'senha', 'secret', 'token', 'api[_-]?key', 'jwt',
    // Outros
    'localStorage', 'sessionStorage', 'process\\.env'
  ],
  arquivosParaVerificar: [
    'package.json',
    'next.config.js',
    'next.config.ts',
    'docker-compose.yml',
    '.env*'
  ]
};

// Resultados da auditoria
const resultados = {
  problemasEncontrados: 0,
  problemas: [],
  dependenciasVulneraveis: [],
  arquivosAnalisados: 0,
  tempoExecucao: 0
};

/**
 * Função principal
 */
async function main() {
  const inicio = Date.now();
  console.log('🚀 Iniciando auditoria de segurança...\n');

  try {
    // Verificar dependências desatualizadas
    await verificarDependencias();
    
    // Verificar arquivos de configuração
    await verificarArquivosConfiguracao();
    
    // Verificar código-fonte
    await verificarCodigoFonte();
    
    // Exibir resumo
    exibirResumo();
    
  } catch (erro) {
    console.error('❌ Erro durante a auditoria:', erro);
    process.exit(1);
  } finally {
    const fim = Date.now();
    resultados.tempoExecucao = (fim - inicio) / 1000; // em segundos
    
    console.log(`\n⏱️  Auditoria concluída em ${resultados.tempoExecucao.toFixed(2)} segundos`);
    console.log(`📊 ${resultados.arquivosAnalisados} arquivos analisados`);
    console.log(`⚠️  ${resultados.problemasEncontrados} problemas encontrados`);
    
    if (resultados.problemasEncontrados > 0) {
      console.log('\n🔍 Detalhes dos problemas encontrados:');
      resultados.problemas.slice(0, 10).forEach((problema, index) => {
        console.log(`\n${index + 1}. ${problema.tipo}: ${problema.descricao}`);
        console.log(`   Local: ${problema.arquivo}${problema.linha ? `:${problema.linha}` : ''}`);
        if (problema.recomendacao) {
          console.log(`   Recomendação: ${problema.recomendacao}`);
        }
      });
      
      if (resultados.problemas.length > 10) {
        console.log(`\n... e mais ${resultados.problemas.length - 10} problemas`);
      }
    }
    
    // Gerar relatório em arquivo
    gerarRelatorio();
  }
}

/**
 * Verifica dependências desatualizadas
 */
async function verificarDependencias() {
  console.log('🔍 Verificando dependências...');
  
  try {
    // Verificar se o npm está disponível
    execSync('npm --version');
    
    // Verificar dependências desatualizadas
    console.log('   Verificando pacotes desatualizados...');
    try {
      const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
      const pacotesDesatualizados = JSON.parse(outdated || '{}');
      
      Object.entries(pacotesDesatualizados).forEach(([pkg, info]) => {
        resultados.problemasEncontrados++;
        resultados.problemas.push({
          tipo: 'Dependência Desatualizada',
          descricao: `Pacote ${pkg} está desatualizado (${info.current} -> ${info.latest})`,
          recomendacao: `Atualize para a versão ${info.latest} com 'npm update ${pkg}'`,
          severidade: 'média'
        });
      });
    } catch (erro) {
      console.log('   Aviso: Não foi possível verificar pacotes desatualizados');
    }
    
    // Verificar vulnerabilidades conhecidas
    console.log('   Verificando vulnerabilidades conhecidas...');
    try {
      const auditoria = execSync('npm audit --json', { encoding: 'utf8' });
      const auditoriaJson = JSON.parse(auditoria);
      
      if (auditoriaJson.vulnerabilities) {
        Object.entries(auditoriaJson.vulnerabilities).forEach(([pkg, info]) => {
          resultados.problemasEncontrados++;
          resultados.dependenciasVulneraveis.push(pkg);
          resultados.problemas.push({
            tipo: 'Vulnerabilidade de Segurança',
            descricao: `Pacote ${pkg} tem vulnerabilidades (${info.severity})`,
            recomendacao: 'Execute "npm audit fix" para corrigir automaticamente',
            severidade: info.severity === 'high' || info.severity === 'critical' ? 'alta' : 'média'
          });
        });
      }
    } catch (erro) {
      console.log('   Aviso: Não foi possível verificar vulnerabilidades com npm audit');
    }
    
  } catch (erro) {
    console.log('   Aviso: Não foi possível verificar dependências. Certifique-se de que o npm está instalado.');
  }
}

/**
 * Verifica arquivos de configuração
 */
async function verificarArquivosConfiguracao() {
  console.log('🔍 Verificando arquivos de configuração...');
  
  CONFIG.arquivosParaVerificar.forEach(arquivoPadrao => {
    // Lidar com curingas (ex: .env*)
    if (arquivoPadrao.includes('*')) {
      const diretorio = path.dirname(arquivoPadrao) || '.';
      const padrao = path.basename(arquivoPadrao);
      
      try {
        const arquivos = fs.readdirSync(diretorio);
        const arquivosCorrespondentes = arquivos.filter(arq => {
          const regex = new RegExp('^' + padrao.replace(/\*/g, '.*') + '$');
          return regex.test(arq);
        });
        
        arquivosCorrespondentes.forEach(arq => {
          const caminhoCompleto = path.join(diretorio, arq);
          verificarArquivo(caminhoCompleto);
        });
      } catch (erro) {
        // Pasta não encontrada, ignorar
      }
    } else if (fs.existsSync(arquivoPadrao)) {
      verificarArquivo(arquivoPadrao);
    }
  });
}

/**
 * Verifica um arquivo específico
 */
function verificarArquivo(caminhoArquivo) {
  if (!fs.existsSync(caminhoArquivo)) {
    return;
  }
  
  // Ignorar alguns arquivos
  if (caminhoArquivo.includes('node_modules') || 
      caminhoArquivo.includes('.git') ||
      caminhoArquivo.includes('.next') ||
      caminhoArquivo.includes('dist') ||
      caminhoArquivo.includes('build')) {
    return;
  }
  
  resultados.arquivosAnalisados++;
  
  try {
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
    const linhas = conteudo.split('\n');
    
    // Verificar por palavras-chave de risco
    linhas.forEach((linha, indice) => {
      CONFIG.palavrasChaveRiscos.forEach(palavraChave => {
        const regex = new RegExp(palavraChave, 'i');
        if (regex.test(linha)) {
          resultados.problemasEncontrados++;
          
          let tipo = 'Possível problema de segurança';
          let recomendacao = 'Revise o código para garantir que não há vulnerabilidades de segurança.';
          let severidade = 'baixa';
          
          // Classificar o tipo de problema
          if (['eval\\(', 'new Function\\(', 'exec\\(', 'execSync\\('].includes(palavraChave)) {
            tipo = 'Injeção de Código';
            recomendacao = 'Evite o uso de funções que permitem injeção de código. Considere alternativas mais seguras.';
            severidade = 'alta';
          } else if (['password', 'senha', 'secret', 'token', 'api[_-]?key', 'jwt'].includes(palavraChave.toLowerCase())) {
            tipo = 'Credenciais Expostas';
            recomendacao = 'Não armazene credenciais diretamente no código. Use variáveis de ambiente ou um gerenciador de segredos.';
            severidade = 'alta';
          } else if (['dangerouslySetInnerHTML', 'innerHTML', 'document\\.write'].includes(palavraChave)) {
            tipo = 'Risco de XSS';
            recomendacao = 'Tenha cuidado com a inserção de conteúdo HTML dinâmico. Use funções de escape ou bibliotecas como DOMPurify para limpar o conteúdo.';
            severidade = 'média';
          }
          
          resultados.problemas.push({
            tipo,
            descricao: `Uso de '${palavraChave}' encontrado`,
            recomendacao,
            arquivo: caminhoArquivo,
            linha: indice + 1,
            codigo: linha.trim(),
            severidade
          });
        }
      });
    });
    
    // Verificações específicas para package.json
    if (caminhoArquivo.endsWith('package.json')) {
      try {
        const pkg = JSON.parse(conteudo);
        
        // Verificar scripts perigosos
        if (pkg.scripts) {
          Object.entries(pkg.scripts).forEach(([nome, comando]) => {
            if (typeof comando === 'string' && 
                (comando.includes('rm -rf') || comando.includes('rimraf') || comando.includes('del /'))) {
              resultados.problemasEncontrados++;
              resultados.problemas.push({
                tipo: 'Script Perigoso',
                descricao: `Script '${nome}' contém comandos de remoção de arquivos`,
                recomendacao: 'Revise o script para garantir que não há risco de exclusão acidental de arquivos.',
                arquivo: caminhoArquivo,
                severidade: 'alta'
              });
            }
          });
        }
      } catch (erro) {
        console.error(`Erro ao analisar ${caminhoArquivo}:`, erro.message);
      }
    }
    
  } catch (erro) {
    console.error(`Erro ao ler o arquivo ${caminhoArquivo}:`, erro.message);
  }
}

/**
 * Verifica o código-fonte do projeto
 */
async function verificarCodigoFonte() {
  console.log('🔍 Verificando código-fonte...');
  
  // Função para percorrer diretórios recursivamente
  function percorrerDiretorio(diretorio) {
    if (!fs.existsSync(diretorio)) {
      return;
    }
    
    const itens = fs.readdirSync(diretorio);
    
    itens.forEach(item => {
      const caminhoCompleto = path.join(diretorio, item);
      const stat = fs.statSync(caminhoCompleto);
      
      if (stat.isDirectory()) {
        percorrerDiretorio(caminhoCompleto);
      } else if (CONFIG.extensoesArquivos.includes(path.extname(item).toLowerCase())) {
        verificarArquivo(caminhoCompleto);
      }
    });
  }
  
  // Verificar diretórios principais
  const diretoriosParaVerificar = [
    'src',
    'frontend',
    'backend',
    'api',
    'config',
    'scripts'
  ];
  
  diretoriosParaVerificar.forEach(dir => {
    if (fs.existsSync(dir)) {
      percorrerDiretorio(dir);
    }
  });
}

/**
 * Exibe um resumo da auditoria
 */
function exibirResumo() {
  console.log('\n📋 Resumo da Auditoria de Segurança');
  console.log('='.repeat(50));
  
  // Contar problemas por severidade
  const contagem = {
    alta: resultados.problemas.filter(p => p.severidade === 'alta').length,
    media: resultados.problemas.filter(p => p.severidade === 'média').length,
    baixa: resultados.problemas.filter(p => p.severidade === 'baixa').length
  };
  
  console.log(`\n🔴 ${contagem.alta} problemas de alta severidade`);
  console.log(`🟠 ${contagem.media} problemas de média severidade`);
  console.log(`🟡 ${contagem.baixa} problemas de baixa severidade`);
  
  // Exibir recomendações rápidas
  if (resultados.problemasEncontrados > 0) {
    console.log('\n🚨 Recomendações Imediatas:');
    
    // Priorizar problemas de alta severidade
    const problemasAltos = resultados.problemas.filter(p => p.severidade === 'alta');
    if (problemasAltos.length > 0) {
      console.log('\n🔴 Corrija os seguintes problemas de alta prioridade primeiro:');
      problemasAltos.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.tipo}: ${p.descricao}`);
        console.log(`      Arquivo: ${p.arquivo}${p.linha ? `:${p.linha}` : ''}`);
      });
      if (problemasAltos.length > 3) {
        console.log(`   ... e mais ${problemasAltos.length - 3} problemas`);
      }
    }
  } else {
    console.log('\n✅ Nenhum problema crítico de segurança encontrado!');
  }
}

/**
 * Gera um relatório detalhado em formato JSON
 */
function gerarRelatorio() {
  const relatorio = {
    data: new Date().toISOString(),
    resumo: {
      totalArquivosAnalisados: resultados.arquivosAnalisados,
      totalProblemas: resultados.problemasEncontrados,
      tempoExecucao: resultados.tempoExecucao,
      problemasPorSeveridade: {
        alta: resultados.problemas.filter(p => p.severidade === 'alta').length,
        media: resultados.problemas.filter(p => p.severidade === 'média').length,
        baixa: resultados.problemas.filter(p => p.severidade === 'baixa').length
      }
    },
    problemas: resultados.problemas.map(p => ({
      tipo: p.tipo,
      descricao: p.descricao,
      arquivo: p.arquivo,
      linha: p.linha,
      severidade: p.severidade,
      recomendacao: p.recomendacao
    }))
  };
  
  const caminhoRelatorio = 'relatorio-auditoria.json';
  fs.writeFileSync(caminhoRelatorio, JSON.stringify(relatorio, null, 2));
  console.log(`\n📄 Relatório detalhado salvo em: ${caminhoRelatorio}`);
}

// Executar a auditoria
main().catch(console.error);
