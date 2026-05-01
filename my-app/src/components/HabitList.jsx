import { useState, useEffect } from 'react';
import HabitForm from './HabitForm';

export default function HabitList() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/habits');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) return <div>Loading habits...</div>;
  if (error) return <div>Error: {error}</div>;

const handleComplete = (id) => {
  setUpdatingId(id);
  fetch(`http://127.0.0.1:5000/habits/${id}/complete`, {
    method: 'PATCH'
  })
  .then(res => res.json())
  .then(updated => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, ...updated } : h
    ));
  })
  .catch(err => console.error(err))
  .finally(() => setUpdatingId(null));
};

const handleDelete = (id) => {
  setUpdatingId(id);
  fetch(`http://127.0.0.1:5000/habits/${id}`, {
    method: 'DELETE'
  })
  .then(res => {
    if (res.ok) {
      setHabits(habits.filter(h => h.id !== id));
    } else {
      throw new Error('Failed to delete habit');
    }
  })
  .catch(err => setError(err.message))
  .finally(() => setUpdatingId(null));
};

 return (
  <div className="py-2">
    <HabitForm onHabitAdded={fetchHabits} />
    {habits.length === 0 ? (
      <div>No habits found</div>
    ) : (
      <div className='container'> 
        <div className='row'>
          {
        habits.map(habit => (
        <div key={habit.id} className="p-4 col-4 border rounded-lg">
          <h3 className="font-bold">{habit.title}</h3>
          <p>Current Streak: {habit.streak} days</p>
          <p>Best Streak: {habit.best_streak} days</p>
          <div className='d-flex gap-2'>
          <button
            onClick={() => handleComplete(habit.id)}
            disabled={updatingId === habit.id}
            className={`mt-2 px-3 py-1 btn btn-success text-white rounded ${
              updatingId === habit.id ? 'opacity-50' : ''
            }`}
          >
            {updatingId === habit.id ? 'Updating...' : '✅ Complete Today'}
          </button>
          <button
            onClick={() => handleDelete(habit.id)}
            disabled={updatingId === habit.id}
            className={`mt-2 px-3 py-1 btn btn-danger text-white rounded ml-2 ${
              updatingId === habit.id ? 'opacity-50' : ''
            }`}
          >
            🗑️ Delete
          </button>  
          </div>
        </div>
      ))}
        </div>
      </div>
    )}
  </div>
);
}