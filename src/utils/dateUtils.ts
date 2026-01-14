import {
  format,
  parseISO,
  addDays,
  isSameDay,
  isValid
} from 'date-fns';

/**
 * Formata uma data ISO (YYYY-MM-DD) para dd/MM/yyyy
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Data inválida';

  const date = parseISO(dateString);

  if (!isValid(date)) return 'Data inválida';

  return format(date, 'dd/MM/yyyy');
};

/**
 * Retorna o horário como string (mantido simples por padrão)
 */
export const formatTime = (time: string): string => {
  if (!time) return 'Horário inválido';
  return time;
};

/**
 * Formata data + hora de forma segura
 * Ex: 25/09/2025 às 14:00
 */
export const formatDateTime = (date: string, time: string): string => {
  if (!date || !time) {
    return 'Data inválida';
  }

  const dateTime = new Date(`${date}T${time}`);

  if (!isValid(dateTime)) {
    return 'Data inválida';
  }

  return `${format(dateTime, 'dd/MM/yyyy')} às ${format(
    dateTime,
    'HH:mm'
  )}`;
};

/**
 * Retorna os próximos 7 dias a partir de uma data
 */
export const getWeekDays = (startDate: Date): Date[] => {
  if (!isValid(startDate)) return [];

  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }

  return days;
};

/**
 * Verifica se uma data ISO é o dia de hoje
 */
export const isSameDayAsToday = (dateString: string): boolean => {
  if (!dateString) return false;

  const date = parseISO(dateString);

  if (!isValid(date)) return false;

  return isSameDay(date, new Date());
};

/**
 * Verifica se uma data e hora já passaram
 */
export const isPastDateTime = (dateString: string, timeString: string): boolean => {
  if (!dateString || !timeString) return false;

  const dateTime = new Date(`${dateString}T${timeString}`);
  
  if (!isValid(dateTime)) return false;

  return dateTime < new Date();
};

/**
 * Verifica se uma data já passou (considera apenas a data, não o horário)
 */
export const isPastDate = (dateString: string): boolean => {
  if (!dateString) return false;

  const date = parseISO(dateString);
  
  if (!isValid(date)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  return compareDate < today;
};

/**
 * Verifica se uma data está dentro do período permitido para agendamento
 * (dia atual + 3 dias úteis posteriores)
 */
export const isWithinAllowedPeriod = (dateString: string): boolean => {
  if (!dateString) return false;

  const date = parseISO(dateString);
  if (!isValid(date)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Não pode ser no passado
  if (targetDate < today) return false;

  // Calcular 3 dias úteis a partir de hoje
  let businessDaysCount = 0;
  let currentDate = new Date(today);

  while (businessDaysCount < 4) { // Hoje + 3 dias
    const dayOfWeek = currentDate.getDay();
    
    // Se for dia útil (segunda a sexta: 1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (currentDate.getTime() === targetDate.getTime()) {
        return true;
      }
      businessDaysCount++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return false;
};

/**
 * Verifica se um horário está dentro do limite de 12h de antecedência
 */
export const isWithin12HoursAdvance = (dateString: string, timeString: string): boolean => {
  if (!dateString || !timeString) return false;

  const dateTime = new Date(`${dateString}T${timeString}`);
  if (!isValid(dateTime)) return false;

  const now = new Date();
  const timeDifference = dateTime.getTime() - now.getTime();
  const hoursInMs = 12 * 60 * 60 * 1000; // 12 horas em milissegundos

  return timeDifference <= hoursInMs;
};

/**
 * Gera uma lista de datas de dias úteis a partir de hoje (incluindo hoje)
 * até o limite de 4 dias úteis
 */
export const getBusinessDaysFromToday = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let businessDaysCount = 0;
  let currentDate = new Date(today);

  while (businessDaysCount < 4) {
    const dayOfWeek = currentDate.getDay();
    
    // Se for dia útil (segunda a sexta: 1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(new Date(currentDate));
      businessDaysCount++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};