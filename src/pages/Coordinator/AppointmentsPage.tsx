import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Layout/Header';
import { Navigation } from '../../components/Layout/Navigation';
import { exportToCSV } from '../../utils/exportUtils';
import { formatDateTime } from '../../utils/dateUtils';
import { fetchTimeSlotsByIds, TimeSlotDTO } from '../../services/timeSlotService';
import {
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Phone,
  FileText,
  Calendar
} from 'lucide-react';
import clsx from 'clsx';

export const AppointmentsPage: React.FC = () => {
  const { units, appointments, loading } = useApp();
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [timeSlotMap, setTimeSlotMap] = useState<Record<string, TimeSlotDTO>>({});

  /* ==============================
     Busca horários no Supabase
  ============================== */
  useEffect(() => {
    const loadTimeSlots = async () => {
      const ids = Array.from(
        new Set(appointments.map(a => a.time_slot_id).filter(Boolean))
      );

      const map = await fetchTimeSlotsByIds(ids);
      setTimeSlotMap(map);
    };

    loadTimeSlots();
  }, [appointments]);

  const handleExport = () => {
    exportToCSV(appointments, units, timeSlotMap);
  };

  const toggleUnitExpanded = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      next.has(unitId) ? next.delete(unitId) : next.add(unitId);
      return next;
    });
  };

  const getAppointmentsForUnit = (unitId: string) =>
    appointments.filter(a => a.unit_id === unitId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Painel do Coordenador" showExportButton onExport={handleExport} />

      <div className="flex">
        <div className="w-64">
          <Navigation />
        </div>

        <div className="flex-1 p-6 space-y-6">
          {units.map(unit => {
            const unitAppointments = getAppointmentsForUnit(unit.id);
            const expanded = expandedUnits.has(unit.id);

            return (
              <div key={unit.id} className="bg-white rounded-lg border shadow-sm">
                <button
                  onClick={() => toggleUnitExpanded(unit.id)}
                  className="w-full px-6 py-4 flex justify-between hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">{unit.name}</h3>
                    <p className="text-sm text-gray-500">
                      {unitAppointments.length} agendamento(s)
                    </p>
                  </div>
                  {expanded ? <ChevronDown /> : <ChevronRight />}
                </button>

                {expanded && (
                  <div className="px-6 pb-4 space-y-4">
                    {unitAppointments.map(appointment => {
                      const slot = timeSlotMap[appointment.time_slot_id];

                      return (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">
                              {slot
                                ? formatDateTime(slot.date, slot.time)
                                : 'Horário não encontrado'}
                            </span>
                            <span
                              className={clsx(
                                'ml-3 px-2 py-1 text-xs rounded-full',
                                getStatusColor(appointment.status)
                              )}
                            >
                              {getStatusText(appointment.status)}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <p><User className="inline h-4 w-4 mr-1" /> {appointment.first_name} {appointment.last_name}</p>
                              <p><Mail className="inline h-4 w-4 mr-1" /> {appointment.email}</p>
                              <p><Phone className="inline h-4 w-4 mr-1" /> {appointment.phone}</p>
                            </div>
                            <div className="text-gray-600 space-y-1">
                              <p><FileText className="inline h-4 w-4 mr-1" /> {appointment.subject}</p>
                              <p>CPF: {appointment.cpf}</p>
                              <p>Job ID: {appointment.job_id}</p>
                              <p>Application ID: {appointment.application_id}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
