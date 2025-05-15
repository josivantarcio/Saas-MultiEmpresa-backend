'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'react-toastify';

interface StoreInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

interface PaymentSettings {
  asaasApiKey: string;
  acceptCreditCard: boolean;
  acceptBoleto: boolean;
  acceptPix: boolean;
  installmentsEnabled: boolean;
  maxInstallments: number;
}

interface ShippingSettings {
  freeShippingEnabled: boolean;
  freeShippingMinValue: number;
  expressShippingEnabled: boolean;
  storePickupEnabled: boolean;
  defaultShippingPrice: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'Minha Loja',
    email: 'contato@minhaloja.com',
    phone: '(11) 98765-4321',
    address: 'Rua Exemplo, 123 - São Paulo/SP',
    description: 'Loja de produtos eletrônicos',
  });
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    asaasApiKey: '********',
    acceptCreditCard: true,
    acceptBoleto: true,
    acceptPix: true,
    installmentsEnabled: true,
    maxInstallments: 12,
  });
  
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingEnabled: true,
    freeShippingMinValue: 300,
    expressShippingEnabled: true,
    storePickupEnabled: false,
    defaultShippingPrice: 15,
  });
  
  const handleStoreInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreInfo({
      ...storeInfo,
      [name]: value,
    });
  };
  
  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleShippingSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setShippingSettings({
      ...shippingSettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    });
  };
  
  const handleSaveSettings = () => {
    // Em um cenário real, isso seria uma chamada à API
    toast.success('Configurações salvas com sucesso!');
  };

  const tabs = [
    { id: 'store', label: 'Informações da Loja' },
    { id: 'payment', label: 'Pagamento' },
    { id: 'shipping', label: 'Envio' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Informações da Loja */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={storeInfo.name}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={storeInfo.email}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={storeInfo.phone}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={storeInfo.address}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={storeInfo.description}
                  onChange={handleStoreInfoChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}
          
          {/* Configurações de Pagamento */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="asaasApiKey" className="block text-sm font-medium text-gray-700">
                  Chave de API do Asaas
                </label>
                <input
                  type="password"
                  id="asaasApiKey"
                  name="asaasApiKey"
                  value={paymentSettings.asaasApiKey}
                  onChange={handlePaymentSettingsChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Métodos de Pagamento</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="acceptCreditCard"
                    name="acceptCreditCard"
                    checked={paymentSettings.acceptCreditCard}
                    onChange={handlePaymentSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptCreditCard" className="ml-2 block text-sm text-gray-700">
                    Aceitar Cartão de Crédito
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="acceptBoleto"
                    name="acceptBoleto"
                    checked={paymentSettings.acceptBoleto}
                    onChange={handlePaymentSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptBoleto" className="ml-2 block text-sm text-gray-700">
                    Aceitar Boleto Bancário
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="acceptPix"
                    name="acceptPix"
                    checked={paymentSettings.acceptPix}
                    onChange={handlePaymentSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptPix" className="ml-2 block text-sm text-gray-700">
                    Aceitar PIX
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Parcelamento</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="installmentsEnabled"
                    name="installmentsEnabled"
                    checked={paymentSettings.installmentsEnabled}
                    onChange={handlePaymentSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="installmentsEnabled" className="ml-2 block text-sm text-gray-700">
                    Habilitar parcelamento
                  </label>
                </div>
                
                {paymentSettings.installmentsEnabled && (
                  <div>
                    <label htmlFor="maxInstallments" className="block text-sm font-medium text-gray-700">
                      Número máximo de parcelas
                    </label>
                    <input
                      type="number"
                      id="maxInstallments"
                      name="maxInstallments"
                      min="1"
                      max="12"
                      value={paymentSettings.maxInstallments}
                      onChange={handlePaymentSettingsChange}
                      className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Configurações de Envio */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Métodos de Envio</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="freeShippingEnabled"
                    name="freeShippingEnabled"
                    checked={shippingSettings.freeShippingEnabled}
                    onChange={handleShippingSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="freeShippingEnabled" className="ml-2 block text-sm text-gray-700">
                    Habilitar Frete Grátis
                  </label>
                </div>
                
                {shippingSettings.freeShippingEnabled && (
                  <div>
                    <label htmlFor="freeShippingMinValue" className="block text-sm font-medium text-gray-700">
                      Valor mínimo para Frete Grátis (R$)
                    </label>
                    <input
                      type="number"
                      id="freeShippingMinValue"
                      name="freeShippingMinValue"
                      min="0"
                      step="0.01"
                      value={shippingSettings.freeShippingMinValue}
                      onChange={handleShippingSettingsChange}
                      className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="expressShippingEnabled"
                    name="expressShippingEnabled"
                    checked={shippingSettings.expressShippingEnabled}
                    onChange={handleShippingSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="expressShippingEnabled" className="ml-2 block text-sm text-gray-700">
                    Habilitar Frete Expresso
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="storePickupEnabled"
                    name="storePickupEnabled"
                    checked={shippingSettings.storePickupEnabled}
                    onChange={handleShippingSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="storePickupEnabled" className="ml-2 block text-sm text-gray-700">
                    Habilitar Retirada na Loja
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="defaultShippingPrice" className="block text-sm font-medium text-gray-700">
                  Preço padrão de frete (R$)
                </label>
                <input
                  type="number"
                  id="defaultShippingPrice"
                  name="defaultShippingPrice"
                  min="0"
                  step="0.01"
                  value={shippingSettings.defaultShippingPrice}
                  onChange={handleShippingSettingsChange}
                  className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
