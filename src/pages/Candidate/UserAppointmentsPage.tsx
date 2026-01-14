import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Layout/Header';
import { TimeSlotGrid } from '../../components/Calendar/TimeSlotGrid';
import { TimeSlot, Appointment } from '../../types';
import { Calendar, Clock, MapPin, User, Mail, Phone, FileText, AlertTriangle, CreditCard as Edit, Trash2 } from 'lucide-react';
import { formatDateTime, isPastDateTime } from '../../utils/dateUtils';
import clsx from 'clsx';

export const UserAppointmentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { units, timeSlots, appointments, updateAppointment, cancelAppointment, loading, error } = useApp();
  
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [selectedNewTimeSlot, setSelectedNewTimeSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get URL parameters
  const jobId = searchParams.get('jobId') || '';
  const applicationId = searchParams.get('applicationId') || '';
  const unitParam = searchParams.get('unidade') || '';

  // Filter appointments for this specific candidate
  const userAppointments = appointments.filter(appointment => 
    appointment.job_id === jobId && 
    appointment.application_id === applicationId &&
    appointment.unit_id === unitParam
  );

  const unit = units.find(u => u.id === unitParam);
  const availableTimeSlots = timeSlots.filter(slot => 
    slot.unit_id === unitParam && 
    slot.available && 
    !isPastDateTime(slot.date, slot.time)
  );

  const handleReschedule = async (appointmentId: string) => {
    if (!selectedNewTimeSlot) return;

    setIsProcessing(true);
    
    try {
      await updateAppointment(appointmentId, {
        timeSlotId: selectedNewTimeSlot.id,
        status: 'rescheduled'
      });

      setShowReschedule(null);
      setSelectedNewTimeSlot(null);
    } catch (err) {
      console.error('Error rescheduling:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta aula teste?')) return;

    setIsProcessing(true);
    
    try {
      await cancelAppointment(appointmentId);
    } catch (err) {
      console.error('Error cancelling:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'rescheduled':
        return 'Reagendado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Erro" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Erro ao carregar dados</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Meus Agendamentos" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            ← Voltar
          </button>
        </div>

        {/* Unit Information */}
        {unit && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {unit.name}
            </h2>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{unit.address}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Duração: {unit.duration} minutos</span>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Reuniões Agendadas ({userAppointments.length})
          </h3>

          {userAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600">
                Você ainda não possui agendamentos para esta unidade.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userAppointments.map(appointment => {
                const currentTimeSlot = timeSlots.find(ts => ts.id === appointment.time_slot_id);
                
                if (!currentTimeSlot) return null;

                const isAppointmentPast = isPastDateTime(currentTimeSlot.date, currentTimeSlot.time);

                return (
                  <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6">
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

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            Aula Teste - {appointment.subject}
                          </h4>
                          <p className="text-gray-600">
                            {formatDateTime(currentTimeSlot.date, currentTimeSlot.time)}
                          </p>
                        </div>
                      </div>
                      
                      <span className={clsx(
                        'px-3 py-1 text-xs font-medium rounded-full border',
                        getStatusColor(appointment.status)
                      )}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{appointment.first_name} {appointment.last_name}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{appointment.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{appointment.phone}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{appointment.subject}</span>
                        </div>
                        <div className="text-gray-600">
                          <span>CPF: {appointment.cpf}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {appointment.status !== 'cancelled' && !isAppointmentPast && (
                      <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowReschedule(appointment.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Reagendar
                        </button>
                        
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isProcessing ? 'Processando...' : 'Cancelar'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selecione um novo horário:
              </h3>
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
                  setShowReschedule(null);
                  setSelectedNewTimeSlot(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => showReschedule && handleReschedule(showReschedule)}
                disabled={!selectedNewTimeSlot || isProcessing}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
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