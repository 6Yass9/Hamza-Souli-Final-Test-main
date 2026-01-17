import React, { useEffect, useMemo, useState } from 'react';
import { Appointment, User } from '../types';
import { api } from '../services/api';
import { Calendar as CalendarIcon, CalendarDays, Clock, LogOut, StickyNote } from 'lucide-react';
import { StaffCalendar } from './StaffCalendar';

interface StaffDashboardProps {
  user: User;

  // Keep your existing prop (accented) to avoid breaking your current wiring
  onDéconnexion?: () => void;

  // Also support the more standard prop name, in case App.tsx uses it
  onLogout?: () => void;
}

const sortByTime = (a: Appointment, b: Appointment) => {
  const ta = a.time || '00:00';
  const tb = b.time || '00:00';
  return ta.localeCompare(tb);
};

const formatDateFR = (yyyyMmDd: string) => {
  // yyyy-mm-dd -> dd/mm/yyyy
  const [y, m, d] = (yyyyMmDd || '').split('-');
  if (!y || !m || !d) return yyyyMmDd;
  return `${d}/${m}/${y}`;
};

const statusLabel = (s: Appointment['status']) => {
  switch (s) {
    case 'pending':
      return 'En attente';
    case 'confirmed':
      return 'Confirmé';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    default:
      return s;
  }
};

const statusPillClass = (s: Appointment['status']) => {
  switch (s) {
    case 'confirmed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'pending':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'completed':
      return 'bg-stone-100 text-stone-700 border-stone-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
};

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, onDéconnexion, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssigned = async () => {
      const assigned = await api.getStaffAppointments(user.id);
      setAppointments(assigned);
    };
    fetchAssigned();
  }, [user.id]);

  const appointmentsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return appointments.filter((a) => a.date === selectedDate).sort(sortByTime);
  }, [appointments, selectedDate]);

  const upcomingNext = useMemo(() => {
    const now = new Date();
    const candidates = appointments
      .filter((a) => a.status !== 'cancelled')
      .map((a) => {
        const dt = new Date(`${a.date}T${a.time || '00:00'}:00`);
        return { a, dt };
      })
      .filter(({ dt }) => !Number.isNaN(dt.getTime()) && dt >= now)
      .sort((x, y) => x.dt.getTime() - y.dt.getTime());

    return candidates[0]?.a || null;
  }, [appointments]);

  const handleLogout = () => {
    // Always clear app_token in case the parent handler forgets
    try {
      localStorage.removeItem('app_token');
    } catch {
      // ignore
    }

    // Support both prop names; prefer onLogout if provided
    if (typeof onLogout === 'function') return onLogout();
    if (typeof onDéconnexion === 'function') return onDéconnexion();

    // As a last resort, reload to force app state reset
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header (match admin sidebar tone) */}
      <header className="bg-stone-900 text-stone-100 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Hamza Souli" className="h-6 w-auto" />
          <span className="font-sans text-xs uppercase tracking-wide border-l border-stone-700/70 pl-4 text-stone-200">
            Espace Staff
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-stone-200 hidden md:inline">Connecté en tant que {user.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-200 hover:text-white transition-colors"
            type="button"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 shadow-sm border border-stone-100 rounded-lg">
              <h3 className="font-serif text-2xl mb-6 flex items-center gap-2 text-stone-900">
                <CalendarDays size={20} className="text-stone-400" />
                Mon planning
              </h3>
              <StaffCalendar appointments={appointments} onDateSelect={setSelectedDate} />
              <p className="mt-4 text-[11px] text-stone-400">
                Cliquez sur une date pour voir vos rendez-vous assignés.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500">Assignations</p>
                  <p className="text-3xl font-serif text-stone-900 mt-2">{appointments.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-stone-500">Prochain RDV</p>
                  {upcomingNext ? (
                    <p className="text-sm text-stone-700 mt-2">
                      {formatDateFR(upcomingNext.date)} • {upcomingNext.time || '--:--'}
                    </p>
                  ) : (
                    <p className="text-sm text-stone-400 mt-2">Aucun</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-stone-100 rounded-lg h-full min-h-[520px] overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <div>
                  <h2 className="font-serif text-2xl text-stone-900">
                    {selectedDate ? `Rendez-vous du ${formatDateFR(selectedDate)}` : 'Mes rendez-vous'}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mt-1">
                    {selectedDate ? 'Vue par date' : 'Sélectionnez une date à gauche'}
                  </p>
                </div>
              </div>

              <div className="p-6">
                {appointmentsOnSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {appointmentsOnSelectedDate.map((app) => (
                      <div key={app.id} className="border border-stone-200 rounded-lg overflow-hidden">
                        <div className="p-5 bg-stone-50">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] uppercase tracking-widest bg-stone-900 text-white px-2 py-1 rounded">
                                  {app.type}
                                </span>
                                <span
                                  className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${statusPillClass(
                                    app.status
                                  )}`}
                                >
                                  {statusLabel(app.status)}
                                </span>
                              </div>

                              <h3 className="font-serif text-2xl text-stone-900 mt-2">{app.clientName}</h3>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-stone-600 md:mt-1">
                              <Clock size={16} className="text-stone-400" />
                              <span className="font-medium">{app.time || '--:--'}</span>
                            </div>
                          </div>

                          {app.staffNote?.trim() ? (
                            <div className="mt-4 border-t border-stone-200 pt-4">
                              <div className="flex items-start gap-2 text-stone-700">
                                <StickyNote size={16} className="mt-0.5 text-stone-400" />
                                <div>
                                  <p className="text-xs uppercase tracking-widest text-stone-500">Note de l’admin</p>
                                  <p className="text-sm text-stone-700 mt-1 whitespace-pre-wrap">{app.staffNote}</p>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-400 text-center">
                    <CalendarIcon size={48} className="mb-4 opacity-20" />
                    {selectedDate
                      ? 'Aucun rendez-vous assigné à cette date.'
                      : 'Sélectionnez une date pour voir vos assignations.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
