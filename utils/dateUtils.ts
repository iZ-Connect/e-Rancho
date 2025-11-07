
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getNextDays = (count: number, offset: number = 1): Date[] => {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => addDays(today, i + offset));
};

export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, "eeee, dd/MM", { locale: ptBR });
};