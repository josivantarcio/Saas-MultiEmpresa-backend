# Script para criar uma nova tag de versão no GitHub
# Uso: .\create-release.ps1 -Version "v0.6.2" -Message "Implementação da página de detalhes do produto e páginas de categorias"

param (
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Verifica se o diretório atual é um repositório git
if (-not (Test-Path ".git")) {
    Write-Error "Este script deve ser executado na raiz do repositório git."
    exit 1
}

# Verifica se o formato da versão está correto
if (-not ($Version -match "^v\d+\.\d+\.\d+$")) {
    Write-Error "O formato da versão deve ser vX.Y.Z (exemplo: v0.6.2)"
    exit 1
}

# Cria a tag com a mensagem
Write-Host "Criando tag $Version com a mensagem: $Message"
git tag -a $Version -m $Message

# Empurra a tag para o repositório remoto
Write-Host "Enviando tag para o repositório remoto..."
git push origin $Version

Write-Host "Tag $Version criada e enviada com sucesso!"
Write-Host "Acesse a seção de releases no GitHub para adicionar mais detalhes: https://github.com/seu-usuario/seu-repositorio/releases"
