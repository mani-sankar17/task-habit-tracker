import React, { useState } from 'react';
import { Button, TextField, Box, Stack } from '@mui/material';
import { addTask } from '../api';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await addTask({ 
      title, 
      description, 
      deadline: deadline?.toISOString() 
    });
    setTitle('');
    setDescription('');
    setDeadline(null);
    onTaskAdded();
  };

  return (
    <Box component="form" className="task-form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Stack spacing={2}>
        <TextField
          label="Task Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Description"
          variant="outlined"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Deadline"
            value={deadline}
            onChange={(newValue) => setDeadline(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            minDateTime={new Date()}
          />
        </LocalizationProvider>
        <Button type="submit" variant="contained" size="large">
          Add Task
        </Button>
      </Stack>
    </Box>
  );
}