# Guia de Tradução para EcomSaaS Store

Este documento contém instruções para traduzir todos os textos em inglês para português brasileiro no projeto EcomSaaS Store.

## Componentes Prioritários para Tradução

### 1. Header (Cabeçalho)

Arquivo: `frontend/storefront/src/components/layout/Header.tsx`

| Inglês | Português |
|--------|-----------|
| Home | Início |
| Products | Produtos |
| Categories | Categorias |
| About | Sobre |
| Contact | Contato |
| Search | Buscar |
| Login | Entrar |
| Register | Cadastrar |
| Cart | Carrinho |
| My Account | Minha Conta |
| Logout | Sair |
| Settings | Configurações |

### 2. Footer (Rodapé)

Arquivo: `frontend/storefront/src/components/layout/Footer.tsx`

| Inglês | Português |
|--------|-----------|
| Subscribe | Inscrever-se |
| Submit | Enviar |
| Quick Links | Links Rápidos |
| Categories | Categorias |
| Contact Us | Fale Conosco |
| Follow Us | Siga-nos |
| All Rights Reserved | Todos os direitos reservados |

### 3. Produto

Arquivo: `frontend/storefront/src/components/product/ProductCard.tsx`

| Inglês | Português |
|--------|-----------|
| Add to Cart | Adicionar ao Carrinho |
| View Details | Ver Detalhes |
| Out of Stock | Esgotado |
| In Stock | Em Estoque |
| Only | Apenas |
| left | restantes |
| Sale | Promoção |
| New | Novo |

### 4. Carrinho

Arquivo: `frontend/storefront/src/components/cart/CartItem.tsx`

| Inglês | Português |
|--------|-----------|
| Remove | Remover |
| Update | Atualizar |
| Quantity | Quantidade |
| Your Cart is Empty | Seu Carrinho está Vazio |
| Continue Shopping | Continuar Comprando |
| Proceed to Checkout | Finalizar Compra |
| Subtotal | Subtotal |
| Shipping | Frete |
| Tax | Impostos |
| Total | Total |
| Apply Coupon | Aplicar Cupom |

### 5. Checkout

Arquivo: `frontend/storefront/src/components/checkout/CheckoutForm.tsx`

| Inglês | Português |
|--------|-----------|
| Shipping Address | Endereço de Entrega |
| Billing Address | Endereço de Cobrança |
| Payment Method | Método de Pagamento |
| Credit Card | Cartão de Crédito |
| PayPal | PayPal |
| Bank Transfer | Transferência Bancária |
| Place Order | Fazer Pedido |
| Back to Cart | Voltar ao Carrinho |
| Next | Próximo |
| Previous | Anterior |

### 6. Mensagens de Sistema

Arquivo: `frontend/storefront/src/components/ui/Notification.tsx`

| Inglês | Português |
|--------|-----------|
| Success | Sucesso |
| Error | Erro |
| Warning | Aviso |
| Info | Informação |
| Loading... | Carregando... |
| Please wait | Aguarde por favor |
| Something went wrong | Algo deu errado |
| Please try again | Por favor, tente novamente |
| Item added to cart | Item adicionado ao carrinho |
| Item removed from cart | Item removido do carrinho |
| Cart updated | Carrinho atualizado |
| Order placed successfully | Pedido realizado com sucesso |

## Instruções para Tradução

1. **Identificar textos em inglês**: Use a ferramenta de busca do código para encontrar textos em inglês usando palavras-chave como as listadas acima.

2. **Traduzir textos**: Substitua os textos em inglês pelos equivalentes em português brasileiro.

3. **Manter consistência**: Use a tabela acima como referência para manter consistência nas traduções.

4. **Testar após tradução**: Após traduzir, teste a aplicação para garantir que os textos estão sendo exibidos corretamente.

5. **Verificar pluralização**: Certifique-se de que a pluralização está funcionando corretamente em português.

6. **Adaptar mensagens**: Algumas mensagens podem precisar de adaptação para soar natural em português.

## Exemplo de Tradução

Antes:
```jsx
<button className="btn-primary">Add to Cart</button>
```

Depois:
```jsx
<button className="btn-primary">Adicionar ao Carrinho</button>
```

## Comandos Úteis para Encontrar Textos em Inglês

```bash
# Buscar por textos em inglês em arquivos .tsx
grep -r "Add to Cart\|View Details\|Out of Stock" --include="*.tsx" frontend/

# Buscar por textos em inglês em arquivos .ts
grep -r "Success\|Error\|Warning" --include="*.ts" frontend/
```

## Próximos Passos

1. Traduzir todos os componentes listados acima
2. Verificar e traduzir mensagens de erro e validação
3. Traduzir páginas estáticas (Sobre, Contato, etc.)
4. Revisar toda a interface para garantir que não há textos em inglês

---

Atualizado em: 17/05/2025
