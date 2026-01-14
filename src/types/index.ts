import { Database } from '../lib/database.types';

export type Unit = Database['public']['Tables']['units']['Row'];
export type TimeSlot = Database['public']['Tables']['time_slots']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];

export interface CandidateForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cpf: string;
  subject: string;
}

export interface AppContextType {
  units: Unit[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  addAppointment: (appointment: {
    unitId: string;
    timeSlotId: string;
    jobId: string;
    applicationId: string;
    candidate: CandidateForm;
  }) => Promise<void>;
  updateAppointment: (id: string, updates: { status?: string; timeSlotId?: string }) => Promise<void>;
  cancelAppointment: (id: string) => void;
  addTimeSlot: (timeSlot: { unitId: string; date: string; time: string }) => Promise<void>;
  updateTimeSlot: (id: string, updates: { available?: boolean }) => Promise<void>;
  removeTimeSlot: (id: string) => void;
  updateUnit: (id: string, updates: { name?: string; address?: string; duration?: number }) => Promise<void>;
  refreshData: () => Promise<void>;
}