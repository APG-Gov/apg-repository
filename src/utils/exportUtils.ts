import { Appointment, Unit } from '../types';
import { TimeSlotDTO } from '../services/timeSlotService';

export const exportToCSV = (appointments: Appointment[], units: Unit[], timeSlotMap: Record<string, TimeSlotDTO>) => {
  const headers = [
    'Unidade',
    'Data',
    'Horário',
    'Nome Completo',
    'E-mail',
    'Telefone',
    'CPF',
    'Disciplina',
    'Status',
    'Job ID',
    'Application ID'
  ];

  const rows = appointments.map(appointment => {
    const unit = units.find(u => u.id === appointment.unit_id);
    const timeSlot = timeSlotMap[appointment.time_slot_id];

    return [
      unit?.name || '',
      timeSlot?.date || '',
      timeSlot?.time || '',
      `${appointment.first_name} ${appointment.last_name}`,
      appointment.email,
      appointment.phone,
      appointment.cpf,
      appointment.subject,
      appointment.status === 'scheduled' ? 'Agendado' : 
      appointment.status === 'rescheduled' ? 'Reagendado' : 'Cancelado',
      appointment.job_id,
      appointment.application_id
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `agendamentos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};