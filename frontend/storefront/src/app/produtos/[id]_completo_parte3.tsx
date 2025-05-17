  // Renderizar a página de detalhes do produto
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Início
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href="/produtos" className="ml-1 text-sm font-medium text-gray-700 hover:text-purple-600 md:ml-2">
                  Produtos
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href={`/produtos?categoria=${product.category}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-purple-600 md:ml-2">
                  {product.category}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Produto */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Galeria de imagens */}
          <div className="flex flex-col">
            {/* Imagem principal */}
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden mb-4 bg-gray-100">
              {selectedImage && (
                <div className="relative h-96 w-full">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    className="object-cover object-center w-full h-full"
                    width={600}
                    height={600}
                    priority
                  />
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(image.url)}
                  className={`relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${
                    selectedImage === image.url ? 'ring-2 ring-purple-500' : 'ring-1 ring-gray-200'
                  }`}
                >
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <Image
                    src={image.url}
                    alt={image.alt}
                    className="object-cover object-center w-full h-full"
                    width={150}
                    height={150}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Informações do produto */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            
            {/* Avaliações */}
            <div className="mt-3">
              <div className="flex items-center">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <p className="ml-2 text-sm text-gray-500">{product.reviewCount} avaliações</p>
              </div>
            </div>
            
            {/* Preço */}
            <div className="mt-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</h2>
                {product.originalPrice && (
                  <>
                    <p className="ml-3 text-lg text-gray-500 line-through">{formatCurrency(product.originalPrice)}</p>
                    <p className="ml-2 text-sm font-medium text-red-600">
                      {product.discount}% OFF
                    </p>
                  </>
                )}
              </div>
              
              {/* Disponibilidade */}
              <p className="mt-2 text-sm text-gray-500">
                {product.stock > 0 ? (
                  <>
                    <span className="text-green-600 font-medium">Em estoque</span>
                    {product.stock < 10 && (
                      <span className="ml-2">Apenas {product.stock} unidades disponíveis</span>
                    )}
                  </>
                ) : (
                  <span className="text-red-600 font-medium">Fora de estoque</span>
                )}
              </p>
            </div>
            
            {/* Descrição curta */}
            <div className="mt-6">
              <p className="text-base text-gray-700">{product.shortDescription}</p>
            </div>
            
            {/* SKU */}
            <div className="mt-4">
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
            
            {/* Quantidade e adicionar ao carrinho */}
            <div className="mt-8">
              <div className="flex items-center">
                <label htmlFor="quantity" className="mr-4 text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="p-2 text-gray-600 hover:text-gray-700"
                    disabled={quantity <= 1}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-12 text-center border-0 focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-2 text-gray-600 hover:text-gray-700"
                    disabled={quantity >= product.stock}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${
                    product.stock > 0
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Adicionar ao Carrinho
                </button>
              </div>
              
              {/* Entrega */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Entrega</h3>
                <div className="mt-4 flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-500">Frete grátis para compras acima de R$ 199,00</p>
                </div>
                <div className="mt-2 flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-500">Entrega em até 3 dias úteis</p>
                </div>
              </div>
              
              {/* Garantia */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Garantia</h3>
                <div className="mt-4 flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-500">Garantia de 12 meses diretamente com o fabricante</p>
                </div>
              </div>
            </div>
          </div>
        </div>
