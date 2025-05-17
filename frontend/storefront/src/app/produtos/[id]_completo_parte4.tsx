        {/* Abas de informações adicionais */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('description')}
                className={`${activeTab === 'description' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Descrição
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`${activeTab === 'specifications' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Especificações
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`${activeTab === 'reviews' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Avaliações ({product.reviews.length})
              </button>
            </nav>
          </div>
          
          {/* Conteúdo da aba de descrição */}
          {activeTab === 'description' && (
            <div className="py-6 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
          
          {/* Conteúdo da aba de especificações */}
          {activeTab === 'specifications' && (
            <div className="py-6">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Conteúdo da aba de avaliações */}
          {activeTab === 'reviews' && (
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Avaliações de clientes</h3>
              
              <div className="space-y-6">
                {product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <p className="ml-2 text-sm font-medium text-gray-900">{review.author}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(review.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Este produto ainda não possui avaliações.</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Produtos relacionados */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Produtos relacionados</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Aqui seriam exibidos os produtos relacionados */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group relative">
                <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                  <div className="bg-gray-200 w-full h-48"></div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <span aria-hidden="true" className="absolute inset-0" />
                      Produto Relacionado {i}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Categoria</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">R$ 99,90</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
