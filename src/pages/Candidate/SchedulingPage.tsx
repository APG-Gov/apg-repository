import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Layout/Header';
import { TimeSlotGrid } from '../../components/Calendar/TimeSlotGrid';
import { CandidateForm } from '../../components/Forms/CandidateForm';
import { TimeSlot, CandidateForm as CandidateFormType } from '../../types';
import { isPastDateTime, isWithinAllowedPeriod, isWithin12HoursAdvance } from '../../utils/dateUtils';
import { Clock, MapPin, CheckCircle } from 'lucide-react';

export const SchedulingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { units, timeSlots, appointments, addAppointment, loading, error } = useApp();
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get URL parameters
  const jobId = searchParams.get('jobId') || '';
  const applicationId = searchParams.get('applicationId') || '';
  const unitParam = searchParams.get('unidade') || '';

  // Find the unit
  const unit = units.find(u => u.id === unitParam);
  
  // Check if candidate already has an appointment
  const existingAppointment = appointments.find(
    a => a.job_id === jobId && 
         a.application_id === applicationId &&
         a.unit_id === unitParam &&
         a.status !== 'cancelled'
  );
  
  const availableTimeSlots = timeSlots.filter(slot => 
    slot.unit_id === unitParam && 
    slot.available &&
    !isPastDateTime(slot.date, slot.time) &&
    isWithinAllowedPeriod(slot.date) &&
    isWithin12HoursAdvance(slot.date, slot.time)
  );

  useEffect(() => {
    if (!unit) {
      // Redirect to error page or show error message
      console.error('Unit not found:', unitParam);
    }
  }, [unit, unitParam]);

  // If candidate already has an appointment, show message
  if (existingAppointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={`Aula Teste – ${unit?.name || 'Unidade'}`} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CheckCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Você já possui um agendamento
            </h2>
            <p className="text-gray-600 mb-6">
              Você já tem uma aula teste agendada para esta unidade. Para agendar uma nova aula, cancele o agendamento atual primeiro.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/candidato/agendamentos?jobId=${jobId}&applicationId=${applicationId}&unidade=${unitParam}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-center"
              >
                Ver Meus Agendamentos
              </Link>
              <button
                onClick={() => window.close()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowForm(true);
  };

  const handleFormSubmit = async (candidateData: CandidateFormType) => {
    if (!selectedTimeSlot) return;

    setIsSubmitting(true);
    
    try {
      await addAppointment({
        unitId: selectedTimeSlot.unit_id,
        timeSlotId: selectedTimeSlot.id,
        jobId,
        applicationId,
        candidate: candidateData
      });

      setShowForm(false);
      setShowConfirmation(true);
    } catch (err) {
      console.error('Error submitting appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedTimeSlot(null);
  };

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

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Erro" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Unidade não encontrada</h2>
            <p className="mt-2 text-gray-600">A unidade especificada não foi encontrada.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={`Aula Teste – ${unit.name}`} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Agendamento Confirmado!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua aula teste foi agendada com sucesso. Você receberá um e-mail de confirmação em breve.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/candidato/agendamentos?jobId=${jobId}&applicationId=${applicationId}&unidade=${unitParam}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-center"
              >
                Ver Agendamentos
              </Link>
              <button
                onClick={() => window.close()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={`Aula Teste – ${unit.name}`} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unit Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
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
          </div>
        </div>

        {/* Available Time Slots */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Horários Disponíveis
          </h3>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Regras de agendamento:</strong>
                </p>
                <ul className="text-sm text-blue-600 mt-1 list-disc list-inside">
                  <li>Agendamento disponível apenas para os próximos 4 dias úteis</li>
                  <li>Máximo de 12 horas de antecedência</li>
                  <li>Apenas 1 aula teste por candidato</li>
                </ul>
              </div>
            </div>
          </div>
          <TimeSlotGrid
            timeSlots={availableTimeSlots}
            onSelectTimeSlot={handleTimeSlotSelect}
            selectedTimeSlot={selectedTimeSlot}
            isForCandidateScheduling={true}
          />
        </div>
      </div>

      {/* Forms */}
      {showForm && (
        <CandidateForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};