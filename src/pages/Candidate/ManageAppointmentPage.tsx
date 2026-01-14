import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Layout/Header';
import { TimeSlotGrid } from '../../components/Calendar/TimeSlotGrid';
import { TimeSlot } from '../../types';
import { Calendar, Clock, MapPin, User, Mail, Phone, FileText, AlertTriangle } from 'lucide-react';
import { formatDateTime, isPastDateTime } from '../../utils/dateUtils';

export const ManageAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { units, timeSlots, appointments, updateAppointment, cancelAppointment, loading, error } = useApp();
  
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedNewTimeSlot, setSelectedNewTimeSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const appointmentId = searchParams.get('id');
  const appointment = appointments.find(a => a.id === appointmentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Agendamento não encontrado" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Agendamento não encontrado</h2>
            <p className="mt-2 text-gray-600">O agendamento especificado não foi encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  const unit = units.find(u => u.id === appointment.unit_id);
  const currentTimeSlot = timeSlots.find(ts => ts.id === appointment.time_slot_id);
  const availableTimeSlots = timeSlots.filter(slot => 
    slot.unit_id === appointment.unit_id && 
    slot.available && 
    !isPastDateTime(slot.date, slot.time)
  );

  const handleReschedule = async () => {
    if (!selectedNewTimeSlot) return;

    setIsProcessing(true);
    
    try {
      await updateAppointment(appointment.id, {
        timeSlotId: selectedNewTimeSlot.id,
        status: 'rescheduled'
      });

      setShowReschedule(false);
      setSelectedNewTimeSlot(null);
    } catch (err) {
      console.error('Error rescheduling:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta aula teste?')) return;

    setIsProcessing(true);
    
    try {
      await cancelAppointment(appointment.id);
    } catch (err) {
      console.error('Error cancelling:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!unit || !currentTimeSlot) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Erro" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Dados incompletos</h2>
            <p className="mt-2 text-gray-600">Não foi possível carregar as informações do agendamento.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentDate = currentTimeSlot.date;
  const currentTime = currentTimeSlot.time;
  const isAppointmentPast = isPastDateTime(currentDate, currentTime);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Gerenciar Agendamento" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {appointment.status === 'cancelled' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Este agendamento foi cancelado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Past Appointment Banner */}
        {isAppointmentPast && appointment.status !== 'cancelled' && (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6">
            <div className="flex">
              <Clock className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  Esta aula teste já foi realizada.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Detalhes do Agendamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Data e Horário</p>
                  <p className="font-medium">{formatDateTime(currentDate, currentTime)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Local</p>
                  <p className="font-medium">{unit.name}</p>
                  <p className="text-sm text-gray-600">{unit.address}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="font-medium">{unit.duration} minutos</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Candidato</p>
                  <p className="font-medium">
                    {appointment.first_name} {appointment.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-medium">{appointment.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{appointment.phone}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Disciplina</p>
                  <p className="font-medium">{appointment.subject}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {appointment.status !== 'cancelled' && !isAppointmentPast && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ações
            </h3>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowReschedule(true)}
                disabled={isProcessing}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors duration-200"
              >
                Reagendar
              </button>
              
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors duration-200"
              >
                {isProcessing ? 'Processando...' : 'Cancelar Agendamento'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Reagendar Aula Teste
              </h2>
            </div>

            <div className="px-6 py-4">
              <TimeSlotGrid
                timeSlots={availableTimeSlots}
                onSelectTimeSlot={setSelectedNewTimeSlot}
                selectedTimeSlot={selectedNewTimeSlot}
                isForCandidateScheduling={true}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReschedule(false);
                  setSelectedNewTimeSlot(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReschedule}
                disabled={!selectedNewTimeSlot || isProcessing}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Reagendando...' : 'Confirmar Reagendamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};