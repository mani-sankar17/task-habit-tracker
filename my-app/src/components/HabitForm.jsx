import { useState } from 'react';

export default function HabitForm({ onHabitAdded }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5000/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
      .then(res => res.json())
      .then(newHabit => {
        if (onHabitAdded) onHabitAdded();
        setTitle('');
      });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3 d-flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Drink 8 glasses of water"
        className="p-2 border rounded flex-grow-1"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 btn btn-primary"
      >
        Add Habit
      </button>
    </form>
  );
}