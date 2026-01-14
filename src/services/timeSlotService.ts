import { supabase } from '../lib/supabase';

export interface TimeSlotDTO {
  id: string;
  date: string;
  time: string;
}

/**
 * Busca todos os time slots usados nos agendamentos
 */
export async function fetchTimeSlotsByIds(
  timeSlotIds: string[]
): Promise<Record<string, TimeSlotDTO>> {
  if (timeSlotIds.length === 0) return {};

  const { data, error } = await supabase
    .from('time_slots')
    .select('id, date, time')
    .in('id', timeSlotIds);

  if (error) {
    console.error('Erro ao buscar time slots:', error);
    return {};
  }

  // transforma em mapa { [id]: { date, time } }
  return data.reduce<Record<string, TimeSlotDTO>>((acc, slot) => {
    acc[slot.id] = slot;
    return acc;
  }, {});
}