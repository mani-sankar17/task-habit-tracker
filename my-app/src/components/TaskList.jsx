import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { getTasks } from '../api';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '80vh', width: '100%', gap: 2 }}>
      {/* Left: Task Form */}
      <Box sx={{ width: '50%', minWidth: 320, maxWidth: 480, position: 'sticky', top: 0, alignSelf: 'flex-start', background: '#f8f9fa', p: 3, borderRadius: 2, boxShadow: 1, height: 'fit-content' }}>
        <Typography variant="h5" component="h5" className='text-primary fw-bold text-center text-uppercase' gutterBottom>
          Add Task
        </Typography>
        <TaskForm onTaskAdded={fetchTasks} />
      </Box>
      {/* Right: Task List */}
      <Box sx={{ flex: 1, overflowY: 'auto', background: '#fff', p: 3, borderRadius: 2, boxShadow: 1, height: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Task List
        </Typography>
        {tasks.length === 0 ? (
          <Typography>No tasks yet. Add one on the left!</Typography>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} onTaskUpdated={fetchTasks} />
          ))
        )}
      </Box>
    </Box>
  );
}