import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/mockApi';
import { Militar, Arranchamento } from '../types';
import { getNextDays, formatDate, formatDisplayDate } from '../utils/dateUtils';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';

interface DailyReport {
    [date: string]: {
        count: number;
        militares: string[];
    };
}

export const FiscSuView: React.FC = () => {
  const { user } = useAuth();
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [arranchamentos, setArranchamentos] = useState<Arranchamento[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(getNextDays(1)[0]);
  const [isLoading, setIsLoading] = useState(true);
  
  const dates = getNextDays(15);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const [militaresData, arranchamentosData] = await Promise.all([
        api.getMilitaresBySetor(user.setor_id),
        api.getArranchamentosBySetor(user.setor_id)
    ]);
    setMilitares(
        militaresData
            .filter(m => m.perfil === 'Militar')
            .sort((a, b) => a.nome.localeCompare(b.nome))
    );
    setArranchamentos(arranchamentosData);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleArranchamento = async (militarCpf: string, date: string) => {
    await api.toggleArranchamento(militarCpf, date);
    fetchData(); // Refresh data
  };

  // FIX: The `date` parameter is already a formatted string, so it should not be passed to `formatDate` again.
  const getMilitaresArranchadosParaData = (date: string) => {
      return militares.filter(m => 
        arranchamentos.some(a => a.militar_cpf === m.cpf && a.data_almoco === date)
      );
  }

  const selectedDateStr = formatDate(selectedDate);
  const militaresArranchados = getMilitaresArranchadosParaData(selectedDateStr);

  if (isLoading) {
    return <div className="p-8"><Spinner /></div>;
  }

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Relatório Diário">
           <label htmlFor="date-select" className="block text-sm font-medium text-neutral-gray mb-2">Selecione uma data:</label>
           <select 
             id="date-select"
             value={selectedDateStr}
             onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
             className="w-full p-2 bg-navy-blue-dark border border-neutral-gray-dark rounded-md text-neutral-gray focus:ring-military-green focus:border-military-green"
           >
                {dates.map(date => (
                    <option key={formatDate(date)} value={formatDate(date)}>
                        {formatDisplayDate(date)}
                    </option>
                ))}
           </select>
           <div className="mt-6 text-center">
              <p className="text-neutral-gray">Total de arranchados:</p>
              <p className="text-5xl font-bold text-military-green">{militaresArranchados.length}</p>
              <p className="text-sm text-neutral-gray-dark mt-1">em {formatDisplayDate(selectedDate)}</p>
           </div>
           <div className="mt-4">
                <h4 className="font-semibold text-neutral-gray mb-2">Lista Nominal:</h4>
                {militaresArranchados.length > 0 ? (
                    <ul className="text-sm space-y-1 text-neutral-gray list-disc list-inside">
                        {militaresArranchados.map(m => <li key={m.cpf}>{m.nome}</li>)}
                    </ul>
                ) : (
                    <p className="text-sm text-neutral-gray-dark">Nenhum militar arranchado para esta data.</p>
                )}
           </div>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card title={`Ajuste Manual - ${formatDisplayDate(selectedDate)}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-navy-blue-dark uppercase text-xs text-neutral-gray-dark">
                        <tr>
                            <th className="px-4 py-2">Militar</th>
                            <th className="px-4 py-2">Situação</th>
                            <th className="px-4 py-2 text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-blue">
                        {militares.map(militar => {
                            const isArranchado = arranchamentos.some(a => a.militar_cpf === militar.cpf && a.data_almoco === selectedDateStr);
                            return (
                                <tr key={militar.cpf} className="bg-navy-blue hover:bg-navy-blue-dark/50">
                                    <td className="px-4 py-3 font-medium text-neutral-gray">{militar.nome} <span className="text-xs text-neutral-gray-dark block">{militar.posto_grad}</span></td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${isArranchado ? 'bg-green-800 text-white' : 'bg-red-800 text-white'}`}>
                                            {isArranchado ? 'Arranchado' : 'Não Arranchado'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => handleToggleArranchamento(militar.cpf, selectedDateStr)}
                                            className={`font-bold py-1 px-3 rounded text-xs transition duration-300 ${isArranchado ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                        >
                                            {isArranchado ? 'Desarranchar' : 'Arranchar'}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </div>
  );
};