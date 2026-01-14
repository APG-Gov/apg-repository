import React from 'react';
import { useForm } from 'react-hook-form';
import { CandidateForm as CandidateFormType } from '../../types';

interface CandidateFormProps {
  onSubmit: (data: CandidateFormType) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CandidateFormType>();

  const subjects = [
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Ciências',
    'Física',
    'Química',
    'Biologia',
    'Inglês',
    'Espanhol',
    'Arte',
    'Educação Física',
    'Filosofia',
    'Sociologia'
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Dados do Candidato
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName', { required: 'Nome é obrigatório' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Sobrenome *
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName', { required: 'Sobrenome é obrigatório' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail *
            </label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'E-mail é obrigatório',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'E-mail inválido'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefone *
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone', { required: 'Telefone é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="(11) 99999-9999"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
              CPF *
            </label>
            <input
              type="text"
              id="cpf"
              {...register('cpf', { required: 'CPF é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="000.000.000-00"
            />
            {errors.cpf && (
              <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Disciplina *
            </label>
            <select
              id="subject"
              {...register('subject', { required: 'Disciplina é obrigatória' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione uma disciplina</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};