import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Stack
} from '@mui/material';

import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function EditTaskDialog({ open, task, onClose, onSave }) {
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    is_completed: task.is_completed,
    deadline: task.deadline ? new Date(task.deadline) : null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (newValue) => {
    setEditedTask(prev => ({ ...prev, deadline: newValue }));
  };

  const handleSave = () => {
    onSave(task.id, editedTask);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            name="title"
            label="Task Title"
            fullWidth
            value={editedTask.title}
            onChange={handleChange}
          />
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editedTask.description}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="is_completed"
                checked={editedTask.is_completed}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Mark as completed"
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Deadline"
              value={editedTask.deadline}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField {...params} fullWidth />
              )}
              minDateTime={new Date()}
            />
          </LocalizationProvider>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}