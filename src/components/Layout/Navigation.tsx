import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Settings, Users } from 'lucide-react';
import clsx from 'clsx';

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navigationItems = [
    {
      name: 'Agendamentos',
      href: '/coordinator',
      icon: Calendar,
      current: location.pathname === '/coordinator'
    },
    {
      name: 'Gerenciar Horários',
      href: '/coordinator/schedule',
      icon: Settings,
      current: location.pathname === '/coordinator/schedule'
    }
  ];

  return (
    <nav className="bg-gray-50 border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
      <div className="px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={clsx(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                  item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 h-6 w-6 flex-shrink-0',
                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};