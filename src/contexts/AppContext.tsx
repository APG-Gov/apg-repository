import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppContextType, Unit, TimeSlot, Appointment, CandidateForm } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load units
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (unitsError) throw unitsError;

      // Load time slots
      const { data: timeSlotsData, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('*')
        .order('date, time');

      if (timeSlotsError) throw timeSlotsError;

      // Load appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      setUnits(unitsData || []);
      setTimeSlots(timeSlotsData || []);
      setAppointments(appointmentsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const addAppointment = async (appointmentData: {
    unitId: string;
    timeSlotId: string;
    jobId: string;
    applicationId: string;
    candidate: CandidateForm;
  }) => {
    try {
      setError(null);

      // Verificar se o candidato já tem agendamento para esta unidade
      const existingAppointment = appointments.find(
        a => a.job_id === appointmentData.jobId && 
             a.application_id === appointmentData.applicationId &&
             a.unit_id === appointmentData.unitId &&
             a.status !== 'cancelled'
      );

      if (existingAppointment) {
        throw new Error('Você já possui um agendamento para esta unidade. Cancele o agendamento atual para criar um novo.');
      }

      // Create appointment
      const { data: appointmentResult, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          unit_id: appointmentData.unitId,
          time_slot_id: appointmentData.timeSlotId,
          job_id: appointmentData.jobId,
          application_id: appointmentData.applicationId,
          first_name: appointmentData.candidate.firstName,
          last_name: appointmentData.candidate.lastName,
          email: appointmentData.candidate.email,
          phone: appointmentData.candidate.phone,
          cpf: appointmentData.candidate.cpf,
          subject: appointmentData.candidate.subject,
          status: 'scheduled'
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Mark time slot as unavailable
      const { error: timeSlotError } = await supabase
        .from('time_slots')
        .update({ available: false })
        .eq('id', appointmentData.timeSlotId);

      if (timeSlotError) throw timeSlotError;

      // Refresh data
      await refreshData();
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
      throw err;
    }
  };

  const updateAppointment = async (id: string, updates: { status?: string; timeSlotId?: string }) => {
    try {
      setError(null);

      const appointment = appointments.find(a => a.id === id);
      if (!appointment) throw new Error('Agendamento não encontrado');

      // If changing time slot, handle availability
      if (updates.timeSlotId && updates.timeSlotId !== appointment.time_slot_id) {
        // Make old time slot available
        await supabase
          .from('time_slots')
          .update({ available: true })
          .eq('id', appointment.time_slot_id);

        // Make new time slot unavailable
        await supabase
          .from('time_slots')
          .update({ available: false })
          .eq('id', updates.timeSlotId);
      }

      // Update appointment
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.timeSlotId) updateData.time_slot_id = updates.timeSlotId;

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await refreshData();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar agendamento');
      throw err;
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      setError(null);

      const appointment = appointments.find(a => a.id === id);
      if (!appointment) throw new Error('Agendamento não encontrado');

      // Make time slot available again
      await supabase
        .from('time_slots')
        .update({ available: true })
        .eq('id', appointment.time_slot_id);

      // Update appointment status
      await updateAppointment(id, { status: 'cancelled' });
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cancelar agendamento');
    }
  };

  const addTimeSlot = async (timeSlotData: { unitId: string; date: string; time: string }) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('time_slots')
        .insert({
          unit_id: timeSlotData.unitId,
          date: timeSlotData.date,
          time: timeSlotData.time,
          available: true
        });

      if (error) throw error;

      await refreshData();
    } catch (err) {
      console.error('Error adding time slot:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar horário');
      throw err;
    }
  };

  const updateTimeSlot = async (id: string, updates: { available?: boolean }) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('time_slots')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await refreshData();
    } catch (err) {
      console.error('Error updating time slot:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar horário');
      throw err;
    }
  };

  const removeTimeSlot = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refreshData();
    } catch (err) {
      console.error('Error removing time slot:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover horário');
    }
  };

  const updateUnit = async (id: string, updates: { name?: string; address?: string; duration?: number }) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await refreshData();
    } catch (err) {
      console.error('Error updating unit:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar unidade');
      throw err;
    }
  };

  const value: AppContextType = {
    units,
    timeSlots,
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    addTimeSlot,
    updateTimeSlot,
    removeTimeSlot,
    updateUnit,
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};