import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/mockApi';
import { Setor, Arranchamento, Militar } from '../types';
import { getNextDays, formatDate, formatDisplayDate } from '../utils/dateUtils';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';

type AdminView = 'report' | 'approvals' | 'sectors';

const generatePrintableReport = (date: Date, scheduledUsers: (Arranchamento & { militar: Militar | undefined })[], setores: Setor[]) => {
    const presentUsers = scheduledUsers.filter(u => u.presenca);
    const absentUsers = scheduledUsers.filter(u => !u.presenca);
    const getSetorName = (id: number) => setores.find(f => f.id === id)?.nome || 'N/A';

    const reportHtml = `
      <html>
        <head>
          <title>Relatório de Arranchamento - ${formatDisplayDate(date)}</title>
          <style>
            body { font-family: sans-serif; margin: 2rem; }
            h1, h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .present { color: green; }
            .absent { color: red; }
            @media print {
                button { display: none; }
            }
          </style>
        </head>
        <body>
          <button onclick="window.print()">Imprimir Relatório</button>
          <h1>Relatório de Arranchamento</h1>
          <p><strong>Data:</strong> ${formatDisplayDate(date)}</p>
          
          <h2>Militares Presentes (${presentUsers.length})</h2>
          <table>
            <thead><tr><th>Nome de Guerra</th><th>Posto/Grad</th><th>Setor/Subunidade</th></tr></thead>
            <tbody>
              ${presentUsers.map(u => `
                <tr>
                  <td>${u.militar?.nome_guerra || u.militar?.nome}</td>
                  <td>${u.militar?.posto_grad}</td>
                  <td>${getSetorName(u.militar?.setor_id || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Militares Ausentes (${absentUsers.length})</h2>
          <table>
            <thead><tr><th>Nome de Guerra</th><th>Posto/Grad</th><th>Setor/Subunidade</th></tr></thead>
            <tbody>
              ${absentUsers.map(u => `
                <tr>
                  <td>${u.militar?.nome_guerra || u.militar?.nome}</td>
                  <td>${u.militar?.posto_grad}</td>
                  <td>${getSetorName(u.militar?.setor_id || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const reportWindow = window.open('', '_blank');
    reportWindow?.document.write(reportHtml);
    reportWindow?.document.close();
};

const ApprovalModal: React.FC<{ militar: Militar, onApprove: Function, onCancel: Function }> = ({ militar, onApprove, onCancel }) => {
    const [nome, setNome] = useState('');
    const [nomeGuerra, setNomeGuerra] = useState('');
    const [postoGrad, setPostoGrad] = useState('');
    const [setorNome, setSetorNome] = useState('');

    const handleSubmit = () => {
        if (nome && nomeGuerra && postoGrad && setorNome) {
            onApprove(militar.cpf, nome, nomeGuerra, postoGrad, setorNome);
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-navy-blue-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold text-military-green mb-4">Aprovar Usuário</h3>
                <p className="text-neutral-gray mb-4">CPF: <span className="font-mono">{militar.cpf}</span></p>
                <div className="space-y-4">
                    <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2 bg-navy-blue border border-neutral-gray-dark rounded" />
                    <input type="text" placeholder="Nome de Guerra" value={nomeGuerra} onChange={e => setNomeGuerra(e.target.value)} className="w-full p-2 bg-navy-blue border border-neutral-gray-dark rounded" />
                    <input type="text" placeholder="Posto/Graduação" value={postoGrad} onChange={e => setPostoGrad(e.target.value)} className="w-full p-2 bg-navy-blue border border-neutral-gray-dark rounded" />
                    <input type="text" placeholder="Setor/Subunidade" value={setorNome} onChange={e => setSetorNome(e.target.value)} className="w-full p-2 bg-navy-blue border border-neutral-gray-dark rounded" />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={() => onCancel()} className="bg-neutral-gray-dark hover:bg-neutral-gray text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button onClick={handleSubmit} className="bg-military-green hover:bg-military-green-dark text-white font-bold py-2 px-4 rounded">Aprovar</button>
                </div>
            </div>
        </div>
    );
};

const SpecialArrangeModal: React.FC<{ selectedDate: Date, onArrange: Function, onCancel: Function }> = ({ selectedDate, onArrange, onCancel }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = () => {
        if (name.trim() && quantity > 0) {
            onArrange(formatDate(selectedDate), name, quantity);
        } else {
            alert('Por favor, preencha o nome/descrição e uma quantidade válida.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-navy-blue-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold text-military-green mb-4">Arranchamento Especial</h3>
                <p className="text-neutral-gray mb-4">Data: <span className="font-semibold">{formatDisplayDate(selectedDate)}</span></p>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Nome/Descrição (Ex: Visitante, Cb João)" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full p-2 bg-navy-blue border border-neutral-gray-dark rounded" 
                    />
                    <input 
                        type="number" 
                        placeholder="Quantidade" 
                        value={quantity} 
                        onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                        min="1"
                        className="w-full p-2 bg-navy-blue border border-neutral-gray-dark rounded" 
                    />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={() => onCancel()} className="bg-neutral-gray-dark hover:bg-neutral-gray text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button onClick={handleSubmit} className="bg-military-green hover:bg-military-green-dark text-white font-bold py-2 px-4 rounded">Adicionar</button>
                </div>
            </div>
        </div>
    );
};

const NavButton: React.FC<{isActive: boolean, onClick: () => void, children: React.ReactNode}> = ({isActive, onClick, children}) => (
    <button 
        onClick={onClick}
        className={`px-3 py-2 text-sm font-semibold rounded-t-md transition-colors focus:outline-none ${
            isActive 
            ? 'bg-navy-blue text-military-green border-b-2 border-military-green' 
            : 'text-neutral-gray hover:bg-navy-blue-light/20'
        }`}
    >
        {children}
    </button>
);


export const AdmLocalView: React.FC = () => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [allArranchamentos, setAllArranchamentos] = useState<Arranchamento[]>([]);
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [pendingMilitares, setPendingMilitares] = useState<Militar[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState<Militar | null>(null);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [newSetorName, setNewSetorName] = useState('');
  const [activeView, setActiveView] = useState<AdminView>('report');
  const [editingSectorId, setEditingSectorId] = useState<number | null>(null);
  const [editingSectorName, setEditingSectorName] = useState('');

  const dates = getNextDays(30, 0); // Show next 30 days including today

  const fetchData = useCallback(async () => {
    // Keep loading true if it's the initial load
    const initialLoad = isLoading;
    if (!initialLoad) setIsLoading(true);

    const [setoresData, arranchamentosData, militaresData, pendingData] = await Promise.all([
      api.getSetores(),
      api.getAllArranchamentos(),
      api.getAllMilitares(),
      api.getPendingMilitares(),
    ]);
    setSetores(setoresData);
    setAllArranchamentos(arranchamentosData);
    setMilitares(militaresData);
    setPendingMilitares(pendingData);
    setIsLoading(false);
  }, [isLoading]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeny = async (cpf: string) => {
    if(window.confirm('Tem certeza que deseja recusar e excluir este usuário?')) {
        await api.denyMilitar(cpf);
        fetchData();
    }
  };

  const handleApprove = async (cpf: string, nome: string, nomeGuerra: string, postoGrad: string, setorNome: string) => {
    await api.approveMilitar(cpf, nome, nomeGuerra, postoGrad, setorNome);
    setShowApprovalModal(null);
    fetchData();
  };

  const handleTogglePresence = async (arranchamentoId: string, currentPresence: boolean) => {
    await api.markPresence(arranchamentoId, !currentPresence);
    fetchData();
  };
  
  const handleSpecialArrange = async (date: string, name: string, quantity: number) => {
    await api.addSpecialArranchamento(date, name, quantity);
    setShowSpecialModal(false);
    fetchData();
  };

  const handleCreateSetor = async () => {
    if (!newSetorName.trim()) {
        alert("O nome do setor não pode estar vazio.");
        return;
    }
    try {
        await api.createSetor(newSetorName);
        setNewSetorName('');
        fetchData();
    } catch (error: any) {
        alert(error.message);
    }
  };

  const handleDeleteSetor = async (id: number) => {
      if(window.confirm('Tem certeza que deseja excluir este setor?')) {
        try {
            await api.deleteSetor(id);
            fetchData();
        } catch (error: any) {
            alert(error.message);
        }
    }
  };

  const handleStartEditSetor = (setor: Setor) => {
    setEditingSectorId(setor.id);
    setEditingSectorName(setor.nome);
  };

  const handleUpdateSetor = async () => {
    if (!editingSectorId || !editingSectorName.trim()) return;
    try {
        await api.updateSetor(editingSectorId, editingSectorName);
        setEditingSectorId(null);
        setEditingSectorName('');
        fetchData();
    } catch (error: any) {
        alert(error.message);
    }
  };


  const arranchadosNoDia = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return allArranchamentos
      .filter(a => a.data_almoco === dateStr)
      .map(a => ({
        ...a,
        militar: militares.find(m => m.cpf === a.militar_cpf),
      }))
      .filter(a => a.militar) // Filter out cases where military might not be found
      .sort((a, b) => (a.militar?.nome || '').localeCompare(b.militar?.nome || ''));
  }, [selectedDate, allArranchamentos, militares]);

  if (isLoading) {
    return <div className="p-8"><Spinner /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
       {showApprovalModal && <ApprovalModal militar={showApprovalModal} onApprove={handleApprove} onCancel={() => setShowApprovalModal(null)} />}
       {showSpecialModal && <SpecialArrangeModal selectedDate={selectedDate} onArrange={handleSpecialArrange} onCancel={() => setShowSpecialModal(false)} />}
       
        <div className="flex space-x-1 border-b-2 border-navy-blue-light">
            <NavButton isActive={activeView === 'report'} onClick={() => setActiveView('report')}>
                Relatório Diário
            </NavButton>
            <NavButton isActive={activeView === 'approvals'} onClick={() => setActiveView('approvals')}>
                Solicitações 
                {pendingMilitares.length > 0 && 
                    <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{pendingMilitares.length}</span>
                }
            </NavButton>
            <NavButton isActive={activeView === 'sectors'} onClick={() => setActiveView('sectors')}>
                Gerenciar Setores
            </NavButton>
        </div>

        {activeView === 'approvals' && (
            <Card title={`Aprovações Pendentes (${pendingMilitares.length})`}>
                {pendingMilitares.length > 0 ? (
                    <div className="divide-y divide-navy-blue">
                        {pendingMilitares.map(m => (
                            <div key={m.cpf} className="p-2 flex justify-between items-center">
                                <span className="font-mono text-sm text-neutral-gray">{m.cpf}</span>
                                <div className="space-x-2">
                                    <button onClick={() => setShowApprovalModal(m)} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1 px-3 rounded">Aprovar</button>
                                    <button onClick={() => handleDeny(m.cpf)} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1 px-3 rounded">Recusar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-center text-neutral-gray-dark p-2">Nenhuma solicitação pendente.</p>}
            </Card>
        )}

        {activeView === 'sectors' && (
            <Card title="Gerenciar Setores/Subunidades">
                <div className="mb-4 space-y-2">
                    <h4 className='text-neutral-gray'>Adicionar Novo Setor/Subunidade</h4>
                    <div className='flex gap-2'>
                        <input 
                            type="text" 
                            value={newSetorName}
                            onChange={(e) => setNewSetorName(e.target.value)}
                            placeholder="Nome do Setor/SU" 
                            className="flex-grow p-2 bg-navy-blue border border-neutral-gray-dark rounded"
                        />
                        <button onClick={handleCreateSetor} className="bg-military-green hover:bg-military-green-dark text-white font-bold py-2 px-4 rounded">Adicionar</button>
                    </div>
                </div>
                <div>
                    <h4 className='text-neutral-gray mb-2'>Setores Existentes</h4>
                    <div className="max-h-60 overflow-y-auto divide-y divide-navy-blue-dark bg-navy-blue-dark/50 rounded p-2">
                        {setores.length > 0 ? setores.map(s => (
                            <div key={s.id} className="p-2 flex justify-between items-center">
                                {editingSectorId === s.id ? (
                                    <input 
                                        type="text"
                                        value={editingSectorName}
                                        onChange={(e) => setEditingSectorName(e.target.value)}
                                        className="flex-grow p-1 bg-navy-blue border border-military-green rounded"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-sm text-neutral-gray">{s.nome}</span>
                                )}
                                
                                {editingSectorId === s.id ? (
                                    <div className="space-x-2 flex-shrink-0 ml-2">
                                        <button onClick={handleUpdateSetor} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1 px-2 rounded">Salvar</button>
                                        <button onClick={() => setEditingSectorId(null)} className="bg-neutral-gray-dark hover:bg-neutral-gray text-white font-bold text-xs py-1 px-2 rounded">Cancelar</button>
                                    </div>
                                ) : (
                                     <div className="space-x-2 flex-shrink-0 ml-2">
                                        <button onClick={() => handleStartEditSetor(s)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1 px-2 rounded">Editar</button>
                                        <button onClick={() => handleDeleteSetor(s.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1 px-2 rounded">Excluir</button>
                                     </div>
                                )}
                            </div>
                        )) : <p className="text-sm text-center text-neutral-gray-dark p-2">Nenhum setor cadastrado.</p>}
                    </div>
                </div>
            </Card>
        )}


        {activeView === 'report' && (
            <Card title="Relatório Logístico Diário">
                <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-grow">
                        <label htmlFor="date-select" className="block text-sm font-medium text-neutral-gray mb-1">Selecione uma data:</label>
                        <select 
                            id="date-select"
                            value={formatDate(selectedDate)}
                            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                            className="w-full p-2 bg-navy-blue-dark border border-neutral-gray-dark rounded-md text-neutral-gray focus:ring-military-green focus:border-military-green"
                        >
                            {dates.map(date => (
                                <option key={formatDate(date)} value={formatDate(date)}>
                                    {formatDisplayDate(date)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => generatePrintableReport(selectedDate, arranchadosNoDia, setores)} className="w-full sm:w-auto self-end bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Gerar PDF
                    </button>
                </div>

                <p className="text-center my-4">
                    <span className="text-3xl font-bold text-military-green">{arranchadosNoDia.length}</span>
                    <span className="text-neutral-gray"> militares arranchados para {formatDisplayDate(selectedDate)}</span>
                </p>

                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-navy-blue-dark uppercase text-xs text-neutral-gray-dark">
                    <tr>
                        <th className="px-4 py-2">Militar</th>
                        <th className="px-4 py-2 text-center">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-blue">
                    {arranchadosNoDia.map(item => (
                        <tr key={item.id} className="bg-navy-blue hover:bg-navy-blue-dark/50">
                        <td className="px-4 py-3 font-medium text-neutral-gray">{item.militar?.nome || item.militar?.nome_guerra} <span className="text-xs text-neutral-gray-dark block">{item.militar?.posto_grad}</span></td>
                        <td className="px-4 py-3 text-center space-x-2">
                            <button 
                                onClick={() => handleTogglePresence(item.id, item.presenca)}
                                disabled={item.presenca}
                                className={`font-bold py-1 px-2 rounded text-xs transition duration-300 ${item.presenca ? 'bg-green-700 text-white cursor-default' : 'bg-yellow-500 hover:bg-yellow-600 text-black'}`}
                            >
                                {item.presenca ? '✓ OK' : 'OK'}
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {arranchadosNoDia.length === 0 && <p className="text-center text-neutral-gray-dark py-4">Nenhum militar arranchado para esta data.</p>}
                </div>
                <div className="mt-4">
                    <button onClick={() => setShowSpecialModal(true)} className="w-full bg-military-green hover:bg-military-green-dark text-icon-white font-bold py-2 px-4 rounded transition duration-300">
                        Arranchar (Especial)
                    </button>
                </div>
            </Card>
        )}
    </div>
  );
};