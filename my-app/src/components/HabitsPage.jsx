import { useState } from 'react';
import HabitForm from '../components/HabitForm';
import HabitList from '../components/HabitList';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Habit Tracker</h1>
      <HabitList habits={habits} />
    </div>
  );
}