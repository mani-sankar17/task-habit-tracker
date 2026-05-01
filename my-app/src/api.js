import axios from 'axios';

const API_URL = 'http://localhost:5000/tasks';

export const getTasks = async () => {
  try {
    const response = await axios.get('http://localhost:5000/tasks', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.data;
    
  } catch (error) {
    console.error('API Error Details:', error.response?.data || error.message);
    throw new Error('Failed to fetch tasks. Check console for details.');
  }
};
export const addTask = async (task) => {
  const response = await axios.post(API_URL, {
    title: task.title,
    description: task.description,
    deadline: task.deadline  // Include deadline in request
  });
  return response.data;
};
export const completeTask = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/complete`);
  return response.data;
};

export const deleteTask = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

export const updateTask = async (id, task) => {
  const response = await axios.put(`${API_URL}/${id}`, {
    title: task.title,
    description: task.description,
    deadline: task.deadline  // Include deadline in update
  });
  return response.data;
};
export const updateTaskStatus = async (id, isCompleted) => {
  const response = await axios.patch(`${API_URL}/${id}/status`, {
    is_completed: isCompleted
  });
  return response.data;
};
