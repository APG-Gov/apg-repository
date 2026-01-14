import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Layout/Header';
import { Navigation } from '../../components/Layout/Navigation';
import { TimeSlot, Unit } from '../../types';
import { Plus, Trash2, CreditCard as Edit2, Clock, MapPin } from 'lucide-react';
import { formatDate, isPastDate, getBusinessDaysFromToday } from '../../utils/dateUtils';
import clsx from 'clsx';

export const ScheduleManagementPage: React.FC = () => {
  const { units, timeSlots, addTimeSlot, removeTimeSlot, updateUnit, loading, error } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>(units[0]?.id || '');
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [showBulkAddForm, setShowBulkAddForm] = useState(false);
  const [showEditUnitForm, setShowEditUnitForm] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [bulkSlot, setBulkSlot] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    interval: 60,
    exceptions: ''
  });
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const selectedUnitData = units.find(u => u.id === selectedUnit);
  // Filter out past dates from time slots
  const unitTimeSlots = timeSlots.filter(slot => 
    slot.unit_id === selectedUnit && !isPastDate(slot.date)
  );

  const handleAddTimeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSlot.date && newSlot.time) {
      addTimeSlot({
        unitId: selectedUnit,
        date: newSlot.date,
        time: newSlot.time,
      }).then(() => {
        setNewSlot({ date: '', time: '' });
        setShowAddSlotForm(false);
      }).catch(err => {
        console.error('Error adding time slot:', err);
      });
    }
  };

  const handleBulkAddTimeSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkSlot.startDate || !bulkSlot.endDate || !bulkSlot.startTime || !bulkSlot.endTime) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const startDate = new Date(bulkSlot.startDate);
      const endDate = new Date(bulkSlot.endDate);
      const startTime = bulkSlot.startTime;
      const endTime = bulkSlot.endTime;
      const interval = bulkSlot.interval;

      // Parse exceptions
      const exceptions = bulkSlot.exceptions
        .split(',')
        .map(ex => ex.trim())
        .filter(ex => ex.length > 0);

      // Generate time slots
      const slotsToAdd = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const dateString = currentDate.toISOString().split('T')[0];
          
          // Generate time slots for this date
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          let currentTime = new Date();
          currentTime.setHours(startHour, startMinute, 0, 0);
          
          const endTimeDate = new Date();
          endTimeDate.setHours(endHour, endMinute, 0, 0);

          while (currentTime < endTimeDate) {
            const timeString = currentTime.toTimeString().slice(0, 5);
            
            // Check if this time is in exceptions
            const isException = exceptions.some(ex => {
              if (ex.includes('-')) {
                const [exStart, exEnd] = ex.split('-').map(t => t.trim());
                return timeString >= exStart && timeString <= exEnd;
              }
              return timeString === ex;
            });

            if (!isException) {
              slotsToAdd.push({
                unitId: selectedUnit,
                date: dateString,
                time: timeString
              });
            }

            currentTime.setMinutes(currentTime.getMinutes() + interval);
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Add all slots
      for (const slot of slotsToAdd) {
        await addTimeSlot(slot);
      }

      setBulkSlot({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        interval: 60,
        exceptions: ''
      });
      setShowBulkAddForm(false);
      
      alert(`${slotsToAdd.length} horários adicionados com sucesso!`);
    } catch (err) {
      console.error('Error adding bulk time slots:', err);
      alert('Erro ao adicionar horários em massa');
    }
  };
  const handleRemoveTimeSlot = (slotId: string) => {
    if (confirm('Tem certeza que deseja remover este horário?')) {
      removeTimeSlot(slotId);
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit({ ...unit });
    setShowEditUnitForm(true);
  };

  const handleUpdateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      updateUnit(editingUnit.id, {
        name: editingUnit.name,
        address: editingUnit.address,
        duration: editingUnit.duration
      }).then(() => {
        setShowEditUnitForm(false);
        setEditingUnit(null);
      }).catch(err => {
        console.error('Error updating unit:', err);
      });
    }
  };

  // Group time slots by date
  const groupedSlots = unitTimeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const sortedDates = Object.keys(groupedSlots).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Gerenciar Horários" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Gerenciar Horários" />
      
      <div className="flex">
        <div className="w-64 flex-shrink-0">
          <Navigation />
        </div>
        
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Horários</h2>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddSlotForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Horário
                </button>
                <button
                  onClick={() => setShowBulkAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar em Massa
                </button>
              </div>
            </div>

            {/* Unit Selector */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Selecionar Unidade</h3>
                {selectedUnitData && (
                  <button
                    onClick={() => handleEditUnit(selectedUnitData)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="unit-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade
                  </label>
                  <select
                    id="unit-select"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUnitData && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectedUnitData.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Duração: {selectedUnitData.duration} minutos
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Horários Disponíveis ({unitTimeSlots.length})
                </h3>
              </div>
              
              <div className="p-6">
                {sortedDates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum horário cadastrado para esta unidade
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedDates.map(date => (
                      <div key={date}>
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          {formatDate(date)}
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {groupedSlots[date]
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map(slot => (
                              <div
                                key={slot.id}
                                className={clsx(
                                  'flex items-center justify-between p-3 rounded-md border',
                                  slot.available 
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                                )}
                              >
                                <div>
                                  <span className="font-medium">{slot.time}</span>
                                  <span className={clsx(
                                    'ml-2 text-xs px-2 py-1 rounded-full',
                                    slot.available
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  )}>
                                    {slot.available ? 'Disponível' : 'Ocupado'}
                                  </span>
                                </div>
                                
                                <button
                                  onClick={() => handleRemoveTimeSlot(slot.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showAddSlotForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Adicionar Horário
              </h2>
            </div>

            <form onSubmit={handleAddTimeSlot} className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Horário
                </label>
                <input
                  type="time"
                  id="time"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSlotForm(false);
                    setNewSlot({ date: '', time: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Time Slots Modal */}
      {showBulkAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Adicionar Horários em Massa
              </h2>
            </div>

            <form onSubmit={handleBulkAddTimeSlots} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Data Inicial *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={bulkSlot.startDate}
                    onChange={(e) => setBulkSlot({ ...bulkSlot, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    Data Final *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={bulkSlot.endDate}
                    onChange={(e) => setBulkSlot({ ...bulkSlot, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Horário Inicial *
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={bulkSlot.startTime}
                    onChange={(e) => setBulkSlot({ ...bulkSlot, startTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    Horário Final *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={bulkSlot.endTime}
                    onChange={(e) => setBulkSlot({ ...bulkSlot, endTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                  Intervalo (minutos)
                </label>
                <select
                  id="interval"
                  value={bulkSlot.interval}
                  onChange={(e) => setBulkSlot({ ...bulkSlot, interval: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={120}>120 minutos</option>
                </select>
              </div>

              <div>
                <label htmlFor="exceptions" className="block text-sm font-medium text-gray-700">
                  Exceções (opcional)
                </label>
                <input
                  type="text"
                  id="exceptions"
                  value={bulkSlot.exceptions}
                  onChange={(e) => setBulkSlot({ ...bulkSlot, exceptions: e.target.value })}
                  placeholder="Ex: 12:00-13:00, 15:30"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separe múltiplas exceções por vírgula. Use formato HH:MM ou HH:MM-HH:MM para intervalos.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Observações:</strong>
                    </p>
                    <ul className="text-sm text-blue-600 mt-1 list-disc list-inside">
                      <li>Apenas dias úteis serão considerados (segunda a sexta)</li>
                      <li>Horários duplicados serão ignorados automaticamente</li>
                      <li>Use exceções para pular horários específicos (ex: almoço)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkAddForm(false);
                    setBulkSlot({
                      startDate: '',
                      endDate: '',
                      startTime: '',
                      endTime: '',
                      interval: 60,
                      exceptions: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Adicionar Horários
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Unit Modal */}
      {showEditUnitForm && editingUnit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Unidade
              </h2>
            </div>

            <form onSubmit={handleUpdateUnit} className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Unidade
                </label>
                <input
                  type="text"
                  id="name"
                  value={editingUnit.name}
                  onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <textarea
                  id="address"
                  value={editingUnit.address}
                  onChange={(e) => setEditingUnit({ ...editingUnit, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duração da Aula (minutos)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={editingUnit.duration}
                  onChange={(e) => setEditingUnit({ ...editingUnit, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="30"
                  max="180"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUnitForm(false);
                    setEditingUnit(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};