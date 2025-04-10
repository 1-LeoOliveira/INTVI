'use client'
import React, { useState, ChangeEvent, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Interface para os itens do inventário
interface ItemInventario {
  descricao: string;
  codigoBarras: string;
  dataRegistro: string;
  destino: 'backup' | 'usuario';
  filial: string;
  usuario?: string;
  matricula?: string;
  setor?: string;
}

// Interface para o status de envio
interface SubmitStatus {
  success: boolean;
  message: string;
}

// Carregamento dinâmico do scanner (melhor para performance)
const BarcodeScanner = dynamic(
  () => import('@/components/BarcodeScanner'),
  { 
    ssr: false,
    loading: () => <p className="text-center p-4 text-gray-500">Carregando scanner...</p>
  }
);

const InventarioApp = () => {
  // Estado do item do inventário
  const [item, setItem] = useState<ItemInventario>({
    descricao: '',
    codigoBarras: '',
    dataRegistro: '',
    destino: 'backup',
    filial: ''
  });

  // Estado do status de envio
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    success: false,
    message: ''
  });
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean>(false);

  // Verificar permissão de câmera ao montar o componente
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (typeof window !== 'undefined' && 'navigator' in window) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setHasCameraAccess(true);
        }
      } catch (error) {
        setHasCameraAccess(false);
        console.warn('Acesso à câmera negado:', error);
      }
    };

    checkCameraPermission();
  }, []);

  // Manipulador de mudança nos inputs
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setItem({ ...item, [name]: value });
  };

  // Manipulador de mudança nos selects
  const handleSelectChange = (name: string, value: string) => {
    setItem({ ...item, [name]: value });
    
    // Reset campos de usuário quando mudar para backup
    if (name === 'destino' && value === 'backup') {
      setItem(prev => ({
        ...prev,
        usuario: '',
        matricula: '',
        setor: ''
      }));
    }
  };

  // Função para lidar com a leitura do código de barras
  const handleBarcodeScan = (barcode: string) => {
    setItem({ ...item, codigoBarras: barcode });
    setShowScanner(false);
  };

  // Função para enviar o item
  const submitItem = async () => {
    setIsLoading(true);
    setSubmitStatus({ success: false, message: '' });
    
    // Campos obrigatórios
    const requiredFields: (keyof ItemInventario)[] = [
      'descricao', 'codigoBarras', 'dataRegistro', 'destino', 'filial'
    ];
    
    // Campos adicionais se for para usuário
    if (item.destino === 'usuario') {
      requiredFields.push('usuario', 'matricula', 'setor');
    }

    // Verificar campos faltantes
    const missingFields = requiredFields.filter(field => {
      const value = item[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      setSubmitStatus({
        success: false,
        message: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simulação de envio para API
      console.log('Dados a serem enviados:', JSON.stringify(item, null, 2));
      const apiURL = 'SUA_API_AQUI';

      await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      });

      setSubmitStatus({
        success: true,
        message: 'Item registrado com sucesso!'
      });

      // Reset do formulário
      setItem({
        descricao: '',
        codigoBarras: '',
        dataRegistro: '',
        destino: 'backup',
        filial: ''
      });
    } catch (error) {
      console.error('Erro ao registrar item:', error);
      setSubmitStatus({
        success: false,
        message: `Erro ao registrar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Logo */}
      <div className="flex justify-center mb-6 pt-4">
        <Image 
          src="/logo.png"
          alt="Logo da Empresa"
          width={400}
          height={100}
          className="object-contain"
          priority
        />
      </div>

      {/* Card principal */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800 text-center">
            Registro de Itens - Inventário
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Campo Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Produto
              </label>
              <Input
                id="descricao"
                name="descricao"
                value={item.descricao}
                onChange={handleInputChange}
                placeholder="Digite a descrição do produto"
                disabled={isLoading}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Campo Código de Barras */}
            <div>
              <label htmlFor="codigoBarras" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras
              </label>
              <div className="flex space-x-2">
                <Input
                  id="codigoBarras"
                  name="codigoBarras"
                  value={item.codigoBarras}
                  onChange={handleInputChange}
                  placeholder="Digite ou escaneie o código"
                  disabled={isLoading}
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button 
                  onClick={() => setShowScanner(!showScanner)}
                  variant="outline"
                  disabled={isLoading || !hasCameraAccess}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {showScanner ? 'Cancelar' : 'Escanear'}
                </Button>
              </div>
            </div>
            
            {/* Scanner de Código de Barras */}
            {showScanner && hasCameraAccess && (
              <div className="p-4 border rounded-lg bg-white">
                <BarcodeScanner 
                  onScan={handleBarcodeScan}
                  onError={(error) => {
                    console.error('Erro no scanner:', error);
                    setSubmitStatus({
                      success: false,
                      message: `Erro no scanner: ${error.message}`
                    });
                    setShowScanner(false);
                  }}
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Aponte a câmera para o código de barras
                </p>
              </div>
            )}

            {showScanner && !hasCameraAccess && (
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                <p className="text-yellow-700 font-medium mb-2 text-center">
                  Permissão de câmera não concedida
                </p>
                <p className="text-sm text-yellow-600 text-center">
                  Por favor, permita o acesso à câmera nas configurações do seu dispositivo para usar o scanner.
                </p>
              </div>
            )}
            
            {/* Campo Data de Registro */}
            <div>
              <label htmlFor="dataRegistro" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Registro
              </label>
              <Input
                type="date"
                id="dataRegistro"
                name="dataRegistro"
                value={item.dataRegistro}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Campo Filial */}
            <div>
              <label htmlFor="filial" className="block text-sm font-medium text-gray-700 mb-1">
                Filial
              </label>
              <Select 
                onValueChange={(value) => handleSelectChange('filial', value)} 
                value={item.filial}
                disabled={isLoading}
              >
                <SelectTrigger id="filial" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filial1">Filial Norte</SelectItem>
                  <SelectItem value="filial2">Filial Sul</SelectItem>
                  <SelectItem value="filial3">Filial Leste</SelectItem>
                  <SelectItem value="filial4">Filial Oeste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Campo Destino */}
            <div>
              <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-1">
                Destino do Item
              </label>
              <Select 
                onValueChange={(value) => handleSelectChange('destino', value)} 
                value={item.destino}
                disabled={isLoading}
              >
                <SelectTrigger id="destino" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione o destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backup">Backup/Estoque</SelectItem>
                  <SelectItem value="usuario">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Campos condicionais para usuário */}
            {item.destino === 'usuario' && (
              <div className="space-y-4 border-t pt-4 border-gray-200">
                <div>
                  <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Usuário
                  </label>
                  <Input
                    id="usuario"
                    name="usuario"
                    value={item.usuario || ''}
                    onChange={handleInputChange}
                    placeholder="Digite o nome do usuário"
                    disabled={isLoading}
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">
                    Matrícula
                  </label>
                  <Input
                    id="matricula"
                    name="matricula"
                    value={item.matricula || ''}
                    onChange={handleInputChange}
                    placeholder="Digite a matrícula"
                    disabled={isLoading}
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="setor" className="block text-sm font-medium text-gray-700 mb-1">
                    Setor
                  </label>
                  <Input
                    id="setor"
                    name="setor"
                    value={item.setor || ''}
                    onChange={handleInputChange}
                    placeholder="Digite o setor"
                    disabled={isLoading}
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            {/* Botão de envio */}
            <Button 
              onClick={submitItem} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Registrar Item'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de status */}
      {submitStatus.message && (
        <div className={`mt-4 p-3 rounded-md ${submitStatus.success ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          {submitStatus.message}
        </div>
      )}
    </div>
  );
};

export default InventarioApp;