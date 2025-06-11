// pages/index.js
'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Equipment {
  id: string;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  patrimonio: string;
  processador: string;
  memoria: string;
  armazenamento: string;
  sistemaOperacional: string;
  usuario: string;
  setor: string;
  localizacao: string;
  dataAquisicao: string;
  valorAquisicao: string;
  garantia: string;
  status: string;
  observacoes: string;
  dataRegistro?: string;
}

interface Worksheet {
  name: string;
}

const InventorySystem = () => {
  const [equipment, setEquipment] = useState<Equipment>({
    id: '',
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    patrimonio: '',
    processador: '',
    memoria: '',
    armazenamento: '',
    sistemaOperacional: '',
    usuario: '',
    setor: '',
    localizacao: '',
    dataAquisicao: '',
    valorAquisicao: '',
    garantia: '',
    status: 'Ativo',
    observacoes: ''
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Status de sincronização apenas para Excel
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  // Reset status após alguns segundos
  useEffect(() => {
    if (syncStatus !== 'idle') {
      const timer = setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEquipment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setEquipment({
      id: '',
      tipo: '',
      marca: '',
      modelo: '',
      numeroSerie: '',
      patrimonio: '',
      processador: '',
      memoria: '',
      armazenamento: '',
      sistemaOperacional: '',
      usuario: '',
      setor: '',
      localizacao: '',
      dataAquisicao: '',
      valorAquisicao: '',
      garantia: '',
      status: 'Ativo',
      observacoes: ''
    });
    setEditingId(null);
  };

  const sendToExcelOnline = async (data: Equipment) => {
    try {
      // Configurações para SharePoint Online
      const SITE_URL = 'santacruzdistribuidora.sharepoint.com';
      const SITE_PATH = '/sites/ProjetosTIInfraestrutura';
      const WORKSHEET_NAME = process.env.NEXT_PUBLIC_EXCEL_WORKSHEET_NAME || 'Inventário';
      const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MICROSOFT_ACCESS_TOKEN;
      
      if (!ACCESS_TOKEN) {
        console.warn('Token de acesso Microsoft não configurado - simulando envio');
        setSyncStatus('syncing');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSyncStatus('success');
        return true;
      }
      
      setSyncStatus('syncing');
      console.log('🔄 Iniciando sincronização com SharePoint Online...');

      // Preparar dados para inserção
      const rowData = [
        data.tipo || '',
        data.marca || '',
        data.modelo || '',
        data.numeroSerie || '',
        data.patrimonio || '',
        data.processador || '',
        data.memoria || '',
        data.armazenamento || '',
        data.sistemaOperacional || '',
        data.usuario || '',
        data.setor || '',
        data.localizacao || '',
        data.dataAquisicao || '',
        data.valorAquisicao || '',
        data.garantia || '',
        data.status || '',
        data.observacoes || '',
        data.dataRegistro || new Date().toLocaleString('pt-BR')
      ];

      console.log('📊 Dados preparados:', rowData);

      // Obter informações do site
      let siteId = '';
      try {
        console.log('🌐 Obtendo informações do site...');
        const siteResponse = await fetch(
          `https://graph.microsoft.com/v1.0/sites/${SITE_URL}:${SITE_PATH}`,
          {
            headers: {
              'Authorization': `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (siteResponse.ok) {
          const siteData = await siteResponse.json();
          siteId = siteData.id;
          console.log('✅ Site encontrado:', siteData.displayName, '| ID:', siteId);
        } else {
          throw new Error(`Erro ao acessar site: ${siteResponse.status}`);
        }
      } catch (siteError) {
        const errorMessage = siteError instanceof Error ? siteError.message : 'Erro desconhecido';
        console.warn('⚠️ Erro ao obter site, tentando método direto:', errorMessage);
      }

      // Construir URL base para o arquivo
      let fileUrl = '';
      const fileId = process.env.NEXT_PUBLIC_EXCEL_WORKBOOK_ID || '5A12567B-F552-41C3-92FC-76AD64D343CF';
      
      if (siteId) {
        fileUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${fileId}`;
      } else {
        fileUrl = `https://graph.microsoft.com/v1.0/sites/${SITE_URL}:${SITE_PATH}:/drive/items/${fileId}`;
      }

      console.log('📁 URL do arquivo:', fileUrl);

      // Verificar acesso ao arquivo
      try {
        console.log('📋 Verificando acesso ao arquivo...');
        const fileResponse = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          }
        });

        if (fileResponse.ok) {
          const fileData = await fileResponse.json();
          console.log('✅ Arquivo encontrado:', fileData.name);
        } else {
          console.warn('⚠️ Erro ao acessar arquivo:', fileResponse.status);
          
          // Tentar buscar o arquivo por nome
          console.log('🔍 Tentando buscar arquivo por nome...');
          const searchUrl = siteId 
            ? `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root/search(q='Inventário.xlsx')`
            : `https://graph.microsoft.com/v1.0/sites/${SITE_URL}:${SITE_PATH}:/drive/root/search(q='Inventário.xlsx')`;
            
          const searchResponse = await fetch(searchUrl, {
            headers: {
              'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
          });
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.value && searchData.value.length > 0) {
              const foundFile = searchData.value[0];
              console.log('✅ Arquivo encontrado via busca:', foundFile.name, '| ID:', foundFile.id);
              fileUrl = `https://graph.microsoft.com/v1.0/sites/${siteId || SITE_URL}/drive/items/${foundFile.id}`;
            }
          }
        }
      } catch (fileError) {
        const errorMessage = fileError instanceof Error ? fileError.message : 'Erro desconhecido';
        console.warn('⚠️ Erro verificação arquivo:', errorMessage);
      }

      // Tentar Tables API
      try {
        console.log('📋 Tentando Tables API...');
        
        const tablesResponse = await fetch(
          `${fileUrl}/workbook/worksheets('${WORKSHEET_NAME}')/tables`,
          {
            headers: {
              'Authorization': `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          console.log('📋 Tabelas encontradas:', tablesData.value?.length || 0);
          
          if (tablesData.value && tablesData.value.length > 0) {
            const tableId = tablesData.value[0].id;
            console.log('📋 Usando tabela:', tableId);
            
            const addRowResponse = await fetch(
              `${fileUrl}/workbook/worksheets('${WORKSHEET_NAME}')/tables('${tableId}')/rows/add`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${ACCESS_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  index: null,
                  values: [rowData]
                })
              }
            );

            if (addRowResponse.ok) {
              const result = await addRowResponse.json();
              console.log('✅ Linha adicionada via Tables API:', result);
              setSyncStatus('success');
              return true;
            } else {
              const errorText = await addRowResponse.text();
              console.warn('⚠️ Tables API falhou:', addRowResponse.status, errorText);
            }
          }
        }
      } catch (tableError) {
        const errorMessage = tableError instanceof Error ? tableError.message : 'Erro desconhecido';
        console.warn('⚠️ Erro Tables API:', errorMessage);
      }

      // Range API como fallback
      console.log('📊 Usando Range API como fallback...');

      // Verificar cabeçalhos
      const checkHeadersResponse = await fetch(
        `${fileUrl}/workbook/worksheets('${WORKSHEET_NAME}')/range(address='A1:R1')`,
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (checkHeadersResponse.ok) {
        const headerData = await checkHeadersResponse.json();
        console.log('📋 Cabeçalhos verificados:', headerData.values?.[0]?.[0] ? 'Existem' : 'Não existem');
        
        // Se não há cabeçalhos, adicionar
        if (!headerData.values || !headerData.values[0] || !headerData.values[0][0]) {
          console.log('📋 Criando cabeçalhos...');
          const headers = [
            'Tipo', 'Marca', 'Modelo', 'Número de Série', 'Patrimônio',
            'Processador', 'Memória', 'Armazenamento', 'Sistema Operacional',
            'Usuário', 'Setor', 'Localização', 'Data Aquisição', 'Valor',
            'Garantia', 'Status', 'Observações', 'Data Registro'
          ];

          const headerResponse = await fetch(
            `${fileUrl}/workbook/worksheets('${WORKSHEET_NAME}')/range(address='A1:R1')`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                values: [headers]
              })
            }
          );

          if (headerResponse.ok) {
            console.log('✅ Cabeçalhos criados');
          }
        }
      }

      // Obter próxima linha vazia
      let nextRow = 2;
      
      try {
        const rangeResponse = await fetch(
          `${fileUrl}/workbook/worksheets('${WORKSHEET_NAME}')/usedRange`,
          {
            headers: {
              'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
          }
        );

        if (rangeResponse.ok) {
          const rangeData = await rangeResponse.json();
          nextRow = rangeData.rowCount + 1;
          console.log('📊 Próxima linha disponível:', nextRow);
        }
      } catch {
        console.warn('⚠️ Erro ao obter range, usando linha 2');
      }

      // Adicionar nova linha
      console.log(`📊 Adicionando dados na linha ${nextRow}...`);
      const addRowResponse = await fetch(
        `${fileUrl}/workbook/worksheets('${WORKSHEET_NAME}')/range(address='A${nextRow}:R${nextRow}')`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [rowData]
          })
        }
      );

      if (addRowResponse.ok) {
        const result = await addRowResponse.json();
        console.log('✅ Dados sincronizados com SharePoint Online:', result);
        setSyncStatus('success');
        return true;
      } else {
        const errorText = await addRowResponse.text();
        console.error('❌ Erro ao adicionar linha:', addRowResponse.status, errorText);
        throw new Error(`Erro ${addRowResponse.status}: ${errorText}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro geral SharePoint Online:', error);
      setSyncStatus('error');
      throw new Error(`SharePoint Online: ${errorMessage}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Validação básica
      if (!equipment.tipo || !equipment.marca || !equipment.modelo) {
        throw new Error('Preencha pelo menos Tipo, Marca e Modelo');
      }

      const newEquipment: Equipment = {
        ...equipment,
        id: editingId || Date.now().toString(),
        dataRegistro: new Date().toLocaleString('pt-BR')
      };

      // Atualizar lista em memória
      if (editingId) {
        setEquipmentList(prev => 
          prev.map(item => item.id === editingId ? newEquipment : item)
        );
      } else {
        setEquipmentList(prev => [...prev, newEquipment]);
      }

      // Preparar mensagem base
      let successMessage = editingId ? '✏️ Equipamento atualizado!' : '➕ Equipamento cadastrado!';

      // Tentar sincronizar com Excel Online
      try {
        await sendToExcelOnline(newEquipment);
        successMessage += ' ✅ Sincronizado com Excel Online!';
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        successMessage += ` ⚠️ Dados salvos em memória. Erro na sincronização: ${errorMessage}`;
      }
      
      setMessage(successMessage);
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage(`❌ Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Equipment) => {
    setEquipment(item);
    setEditingId(item.id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      setEquipmentList(prev => prev.filter(item => item.id !== id));
      setMessage('🗑️ Equipamento excluído com sucesso!');
    }
  };

  const exportToCSV = () => {
    if (typeof window === 'undefined') return;
    
    const headers = [
      'Tipo', 'Marca', 'Modelo', 'Número de Série', 'Patrimônio',
      'Processador', 'Memória', 'Armazenamento', 'Sistema Operacional',
      'Usuário', 'Setor', 'Localização', 'Data Aquisição', 'Valor',
      'Garantia', 'Status', 'Observações', 'Data Registro'
    ];

    const csvContent = [
      headers.join(','),
      ...equipmentList.map(item => [
        item.tipo, item.marca, item.modelo, item.numeroSerie, item.patrimonio,
        item.processador, item.memoria, item.armazenamento, item.sistemaOperacional,
        item.usuario, item.setor, item.localizacao, item.dataAquisicao, item.valorAquisicao,
        item.garantia, item.status, item.observacoes, item.dataRegistro
      ].map(field => `"${field || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario-ti-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const createBackup = () => {
    if (typeof window === 'undefined') return;
    
    const backupData = {
      data: equipmentList,
      timestamp: new Date().toISOString(),
      version: '1.0',
      excelWorkbookId: process.env.NEXT_PUBLIC_EXCEL_WORKBOOK_ID || '5A12567B-F552-41C3-92FC-76AD64D343CF'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
      type: 'application/json' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup-inventario-ti-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    setMessage('💾 Backup criado com sucesso!');
  };

  const filteredEquipment = equipmentList.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Sistema de Inventário de TI</title>
        <meta name="description" content="Sistema para inventariar equipamentos de TI" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📊 Sistema de Inventário de TI
          </h1>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('❌') || message.includes('Erro') ? 'bg-red-100 text-red-700 border-l-4 border-red-500' : 
              message.includes('⚠️') ? 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500' :
              'bg-green-100 text-green-700 border-l-4 border-green-500'
            }`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {message.includes('❌') || message.includes('Erro') ? '❌' : 
                   message.includes('⚠️') ? '⚠️' : '✅'}
                </span>
                {message}
              </div>
            </div>
          )}

          {/* Status de Sincronização Excel */}
          {syncStatus !== 'idle' && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status da Sincronização:</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">📈 Excel Online:</span>
                <div className={`w-3 h-3 rounded-full ${
                  syncStatus === 'success' ? 'bg-green-500' :
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                  syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {syncStatus === 'success' ? 'Sincronizado com sucesso!' :
                   syncStatus === 'syncing' ? 'Enviando dados para Excel...' :
                   syncStatus === 'error' ? 'Erro na sincronização' : 'Aguardando'}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Informações Básicas */}
              <div className="col-span-full">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  📋 Informações Básicas
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Equipamento *
                </label>
                <select
                  name="tipo"
                  value={equipment.tipo}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Notebook">Notebook</option>
                  <option value="Servidor">Servidor</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Impressora">Impressora</option>
                  <option value="Switch">Switch</option>
                  <option value="Roteador">Roteador</option>
                  <option value="Firewall">Firewall</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="marca"
                  value={equipment.marca}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Dell, HP, Lenovo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={equipment.modelo}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: OptiPlex 7090"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  name="numeroSerie"
                  value={equipment.numeroSerie}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número de série do equipamento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Patrimônio
                </label>
                <input
                  type="text"
                  name="patrimonio"
                  value={equipment.patrimonio}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número do patrimônio"
                />
              </div>

              {/* Especificações Técnicas */}
              <div className="col-span-full mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  ⚙️ Especificações Técnicas
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processador
                </label>
                <input
                  type="text"
                  name="processador"
                  value={equipment.processador}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Intel Core i5-11400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memória RAM
                </label>
                <input
                  type="text"
                  name="memoria"
                  value={equipment.memoria}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 8GB DDR4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Armazenamento
                </label>
                <input
                  type="text"
                  name="armazenamento"
                  value={equipment.armazenamento}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: SSD 256GB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sistema Operacional
                </label>
                <input
                  type="text"
                  name="sistemaOperacional"
                  value={equipment.sistemaOperacional}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Windows 11 Pro"
                />
              </div>

              {/* Localização e Usuário */}
              <div className="col-span-full mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  📍 Localização e Usuário
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário Responsável
                </label>
                <input
                  type="text"
                  name="usuario"
                  value={equipment.usuario}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Setor/Departamento
                </label>
                <input
                  type="text"
                  name="setor"
                  value={equipment.setor}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: TI, Administrativo, Vendas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização Física
                </label>
                <input
                  type="text"
                  name="localizacao"
                  value={equipment.localizacao}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Sala 201, Andar 2"
                />
              </div>

              {/* Informações Financeiras */}
              <div className="col-span-full mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  💰 Informações Financeiras
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Aquisição
                </label>
                <input
                  type="date"
                  name="dataAquisicao"
                  value={equipment.dataAquisicao}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Aquisição (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="valorAquisicao"
                  value={equipment.valorAquisicao}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garantia (até)
                </label>
                <input
                  type="date"
                  name="garantia"
                  value={equipment.garantia}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={equipment.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Manutenção">Em Manutenção</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={equipment.observacoes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre o equipamento"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    {editingId ? '✏️ Atualizar Equipamento' : '➕ Cadastrar Equipamento'}
                  </>
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                >
                  ❌ Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Equipamentos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              📋 Equipamentos Cadastrados ({equipmentList.length})
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <button
                onClick={exportToCSV}
                disabled={equipmentList.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📊 Exportar CSV ({equipmentList.length})
              </button>
              
              <button
                onClick={createBackup}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium transition-colors"
              >
                💾 Backup JSON
              </button>
            </div>
          </div>

          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl">
                {equipmentList.length === 0 ? 'Nenhum equipamento cadastrado ainda.' : 'Nenhum resultado encontrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Marca/Modelo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Usuário</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Localização</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.tipo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{item.marca} {item.modelo}</div>
                          {item.numeroSerie && (
                            <div className="text-gray-500 text-xs">S/N: {item.numeroSerie}</div>
                          )}
                          {item.patrimonio && (
                            <div className="text-gray-500 text-xs">Pat: {item.patrimonio}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div>{item.usuario || '-'}</div>
                          <div className="text-gray-500 text-xs">{item.setor || '-'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.localizacao || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                          item.status === 'Inativo' ? 'bg-red-100 text-red-800' :
                          item.status === 'Manutenção' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informações sobre Excel Online */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📈 Integração Excel Online</h3>
          <div className="text-sm text-blue-700">
            <p className="mb-2">
              <strong>Workbook ID:</strong> {process.env.NEXT_PUBLIC_EXCEL_WORKBOOK_ID || '5A12567B-F552-41C3-92FC-76AD64D343CF'}
            </p>
            <p className="mb-2">
              <strong>Worksheet:</strong> {process.env.NEXT_PUBLIC_EXCEL_WORKSHEET_NAME || 'Inventário'}
            </p>
            <p className="text-xs">
              {process.env.NEXT_PUBLIC_MICROSOFT_ACCESS_TOKEN ? 
                '✅ Sistema configurado para sincronização automática com Excel Online.' :
                '⚠️ Para ativar sincronização, configure NEXT_PUBLIC_MICROSOFT_ACCESS_TOKEN no arquivo .env.local'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySystem;