import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/mockApi';
import { getNextDays, formatDate, formatDisplayDate } from '../utils/dateUtils';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { 
    addMonths, 
    eachDayOfInterval, 
    endOfMonth, 
    endOfWeek, 
    format, 
    isSameDay,
    isSameMonth, 
    isSaturday, 
    isSunday, 
    isToday, 
    parseISO,
    startOfMonth, 
    startOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type MilitarViewType = 'schedule' | 'confirmed' | 'profile';

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


// ===================
// MEUS DADOS COMPONENT
// ===================
const ProfileView: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedNome, setEditedNome] = useState(user?.nome || '');
    const [editedNomeGuerra, setEditedNomeGuerra] = useState(user?.nome_guerra || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');

    const handleProfileSave = async () => {
        if (!user || !editedNome.trim() || !editedNomeGuerra.trim()) {
            setProfileError('Nome e Nome de Guerra não podem estar em branco.');
            return;
        }
        setProfileError('');
        setIsSavingProfile(true);
        try {
            const updatedUser = await api.updateMilitarProfile(user.cpf, editedNome, editedNomeGuerra);
            updateUser(updatedUser);
            setIsEditingProfile(false);
        } catch (error: any) {
            setProfileError(error.message || 'Falha ao atualizar o perfil.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setEditedNome(user?.nome || '');
        setEditedNomeGuerra(user?.nome_guerra || '');
        setProfileError('');
    };
    
    return (
         <Card title="Meus Dados">
            {profileError && <p className="text-red-500 text-sm mb-4">{profileError}</p>}
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-neutral-gray-dark">Nome Completo</label>
                    {isEditingProfile ? (
                        <input 
                            type="text"
                            value={editedNome}
                            onChange={(e) => setEditedNome(e.target.value)}
                            className="w-full p-2 bg-navy-blue-dark border border-neutral-gray-dark rounded-md text-neutral-gray focus:ring-military-green focus:border-military-green"
                        />
                    ) : (
                        <p className="text-neutral-gray">{user?.nome}</p>
                    )}
                </div>
                <div>
                    <label className="text-xs text-neutral-gray-dark">Nome de Guerra</label>
                    {isEditingProfile ? (
                        <input 
                            type="text"
                            value={editedNomeGuerra}
                            onChange={(e) => setEditedNomeGuerra(e.target.value)}
                            className="w-full p-2 bg-navy-blue-dark border border-neutral-gray-dark rounded-md text-neutral-gray focus:ring-military-green focus:border-military-green"
                        />
                    ) : (
                        <p className="text-neutral-gray">{user?.nome_guerra}</p>
                    )}
                </div>
                <div>
                    <label className="text-xs text-neutral-gray-dark">Posto/Graduação</label>
                    <p className="text-neutral-gray">{user?.posto_grad}</p>
                </div>
                <div>
                    <label className="text-xs text-neutral-gray-dark">CPF</label>
                    <p className="font-mono text-neutral-gray">{user?.cpf}</p>
                </div>
            </div>
            <div className="mt-6">
                {isEditingProfile ? (
                    <div className="flex gap-4">
                        <button onClick={handleProfileSave} disabled={isSavingProfile} className="flex-1 bg-military-green hover:bg-military-green-dark text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50">
                            {isSavingProfile ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button onClick={handleCancelEdit} className="flex-1 bg-neutral-gray-dark hover:bg-neutral-gray text-white font-bold py-2 px-4 rounded transition duration-300">
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditingProfile(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                        Editar Nome
                    </button>
                )}
            </div>
        </Card>
    )
};


// ======================
// ARRACHADO COMPONENT
// ======================
const ConfirmedView: React.FC = () => {
    const { user } = useAuth();
    const [arranchamentos, setArranchamentos] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState<string | null>(null);

    const fetchConfirmed = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        const userArranchamentos = await api.getArranchamentosByMilitar(user.cpf);
        const today = startOfDay(new Date());
        const futureDates = userArranchamentos
            .map(a => a.data_almoco)
            .filter(dateStr => {
                const date = parseISO(dateStr);
                return date >= today;
            })
            .sort();
        setArranchamentos(futureDates);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchConfirmed();
    }, [fetchConfirmed]);

    const handleCancel = async (dateStr: string) => {
        if (!user) return;
        setIsCancelling(dateStr);
        await api.toggleArranchamento(user.cpf, dateStr);
        await fetchConfirmed(); // Refetch to update the list
        setIsCancelling(null);
    }

    const startOfDay = (date: Date) => {
        date.setHours(0, 0, 0, 0);
        return date;
    }

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <Card title="Arranchado">
            {arranchamentos.length > 0 ? (
                <>
                <p className="mb-4 text-neutral-gray">Abaixo estão seus dias de arranchamento confirmados. Você pode cancelar qualquer data futura.</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {arranchamentos.map(dateStr => (
                        <div key={dateStr} className="flex justify-between items-center bg-navy-blue p-3 rounded-md">
                            <span className="font-semibold text-neutral-gray capitalize">{formatDisplayDate(parseISO(dateStr))}</span>
                            <button 
                                onClick={() => handleCancel(dateStr)} 
                                disabled={isCancelling === dateStr}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1 px-3 rounded transition duration-300 disabled:opacity-50"
                            >
                               {isCancelling === dateStr ? 'Cancelando...' : 'Cancelar'}
                            </button>
                        </div>
                    ))}
                </div>
                </>
            ) : (
                <p className="text-center text-neutral-gray-dark py-4">Você não possui arranchamentos futuros.</p>
            )}
        </Card>
    );
};


// ======================
// ARRANCHAR COMPONENT
// ======================
interface CalendarProps {
    monthDate: Date;
    selectedDates: Set<string>;
    onDateClick: (dateStr: string) => void;
    selectableDates: Set<string>;
    isReadOnly?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ monthDate, selectedDates, onDateClick, selectableDates, isReadOnly = false }) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="w-full sm:w-auto flex-shrink-0">
            <h3 className="text-xl font-bold text-center text-military-green mb-4 capitalize">
                {format(monthStart, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center">
                {dayNames.map(day => <div key={day} className="font-bold text-xs text-neutral-gray-dark w-10 h-10 flex items-center justify-center">{day}</div>)}
                {days.map(day => {
                    const dateStr = formatDate(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isSelected = selectedDates.has(dateStr);
                    const isSelectable = selectableDates.has(dateStr);
                    
                    const dayClasses = `
                        w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm
                        ${isCurrentMonth ? 'text-neutral-gray' : 'text-neutral-gray-dark opacity-40'}
                        ${!isSelectable && !isReadOnly && 'opacity-50'}
                        ${(isSaturday(day) || isSunday(day)) && !isSelected && 'text-neutral-gray-dark'}
                        ${isReadOnly || !isSelectable ? 'cursor-default' : 'cursor-pointer'}
                        ${isToday(day) && 'border-2 border-military-green'}
                        ${isSelected ? 'bg-military-green text-icon-white font-bold' : ''}
                        ${!isSelected && !isReadOnly && isSelectable && isCurrentMonth && 'hover:bg-navy-blue-dark'}
                        ${isReadOnly && !isSelected && isCurrentMonth && 'text-neutral-gray-dark'}
                        ${isReadOnly && !isCurrentMonth && '!text-transparent'}
                    `;

                    return (
                        <div key={dateStr} onClick={() => !isReadOnly && isSelectable && onDateClick(dateStr)} className={dayClasses}>
                           {format(day, 'd')}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ScheduleView: React.FC = () => {
    const { user } = useAuth();
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
    const [initialDates, setInitialDates] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'editing' | 'confirmation'>('editing');

    const selectableDates = useMemo(() => {
        // Military can only schedule 7 days in advance, for the next 20 days, on weekdays.
        const days = getNextDays(20, 7);
        const weekdays = days.filter(d => !isSaturday(d) && !isSunday(d));
        return new Set(weekdays.map(d => formatDate(d)));
    }, []);

    const fetchArranchamentos = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        const userArranchamentos = await api.getArranchamentosByMilitar(user.cpf);
        const arranchadoDates = new Set(userArranchamentos.map(a => a.data_almoco));
        setSelectedDates(arranchadoDates);
        setInitialDates(arranchadoDates);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchArranchamentos();
    }, [fetchArranchamentos]);

    const handleDateToggle = (dateStr: string) => {
        setSelectedDates(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dateStr)) {
            newSet.delete(dateStr);
        } else {
            newSet.add(dateStr);
        }
        return newSet;
        });
    };
    
    const allSelectableSelected = useMemo(() => {
        if (selectableDates.size === 0) return false;
        for (const date of selectableDates) {
            if (!selectedDates.has(date)) return false;
        }
        return true;
    }, [selectedDates, selectableDates]);

    const handleSelectAll = () => {
        if (allSelectableSelected) {
            setSelectedDates(prev => {
                const newSet = new Set(prev);
                selectableDates.forEach(date => newSet.delete(date));
                return newSet;
            });
        } else {
            setSelectedDates(prev => new Set([...prev, ...selectableDates]));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        await api.updateMilitarArranchamento(user.cpf, Array.from(selectedDates));
        setInitialDates(selectedDates);
        setIsSaving(false);
        setViewMode('confirmation');
    };
    
    const monthsToShow = useMemo(() => {
        const months = new Set<string>();
        const datesToDisplay = viewMode === 'editing' ? new Set([...selectableDates, ...selectedDates]) : selectedDates;
        
        if (datesToDisplay.size === 0 && viewMode === 'editing') {
            const firstSelectableDate = getNextDays(1, 7)[0];
            months.add(format(startOfMonth(firstSelectableDate), 'yyyy-MM'));
            const lastSelectableDate = getNextDays(20, 7)[19];
            if (!isSameMonth(firstSelectableDate, lastSelectableDate)) {
                 months.add(format(addMonths(startOfMonth(firstSelectableDate), 1), 'yyyy-MM'));
            }
        } else if (datesToDisplay.size === 0 && viewMode === 'confirmation') {
             months.add(format(startOfMonth(new Date()), 'yyyy-MM'));
        }
        else {
            datesToDisplay.forEach(dateStr => {
                months.add(format(startOfMonth(new Date(dateStr + 'T12:00:00')), 'yyyy-MM'));
            });
        }

        return Array.from(months).sort().map(m => new Date(m + '-01T12:00:00'));
    }, [selectedDates, selectableDates, viewMode]);

    if (isLoading) {
        return <Spinner />;
    }

    if (viewMode === 'confirmation') {
        return (
            <Card title="Arranchamento Confirmado">
                <p className="mb-6 text-neutral-gray text-center">Seu arranchamento para os dias abaixo está confirmado.</p>
                <div className="flex flex-col md:flex-row flex-wrap justify-center items-start gap-8">
                    {monthsToShow.map(month => (
                        <Calendar 
                            key={month.toString()}
                            monthDate={month}
                            selectedDates={initialDates}
                            onDateClick={() => {}}
                            selectableDates={new Set()}
                            isReadOnly={true}
                        />
                    ))}
                </div>
                <div className="mt-8">
                    <button onClick={() => setViewMode('editing')} className="w-full bg-military-green hover:bg-military-green-dark text-icon-white font-bold py-2 px-4 rounded transition duration-300">
                        Editar Arranchamento
                    </button>
                </div>
            </Card>
        );
    }
    
    return (
        <Card title="Arranchar">
            <p className="mb-6 text-neutral-gray">Selecione no calendário os dias que deseja arranchar (Seg-Sex). O arranchamento está disponível com 7 dias de antecedência.</p>
            
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-start gap-8">
                {monthsToShow.map(month => (
                    <Calendar 
                        key={month.toString()}
                        monthDate={month}
                        selectedDates={selectedDates}
                        onDateClick={handleDateToggle}
                        selectableDates={selectableDates}
                    />
                ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={handleSelectAll} className="w-full sm:w-auto flex-1 bg-neutral-gray-dark hover:bg-neutral-gray text-icon-white font-bold py-2 px-4 rounded transition duration-300">
                {allSelectableSelected ? 'Desmarcar Todos' : 'Marcar Próximos 20 Dias'}
                </button>
                <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto flex-1 bg-military-green hover:bg-military-green-dark text-icon-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </Card>
    );
};


// ======================
// MAIN EXPORTED COMPONENT
// ======================
export const MilitarView: React.FC = () => {
    const [activeView, setActiveView] = useState<MilitarViewType>('schedule');

    return (
        <div className="p-4 md:p-8">
            <div className="flex space-x-1 border-b-2 border-navy-blue-light mb-6">
                <NavButton isActive={activeView === 'schedule'} onClick={() => setActiveView('schedule')}>
                Arranchar
                </NavButton>
                <NavButton isActive={activeView === 'confirmed'} onClick={() => setActiveView('confirmed')}>
                Arranchado
                </NavButton>
                <NavButton isActive={activeView === 'profile'} onClick={() => setActiveView('profile')}>
                Meus Dados
                </NavButton>
            </div>

            {activeView === 'schedule' && <ScheduleView />}
            {activeView === 'confirmed' && <ConfirmedView />}
            {activeView === 'profile' && <ProfileView />}
        </div>
    );
};
