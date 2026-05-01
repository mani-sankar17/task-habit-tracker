import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Stack, Chip } from '@mui/material';
import { Check, Delete, Edit } from '@mui/icons-material';
import { completeTask, deleteTask, updateTask , updateTaskStatus} from '../api';
import EditTaskDialog from './EditTaskDialog';

export default function TaskItem({ task, onTaskUpdated }) {
  const [editOpen, setEditOpen] = useState(false);

  const handleComplete = async () => {
    await completeTask(task.id);
    onTaskUpdated();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onTaskUpdated();
  };

  // Modify handleEditSave:
const handleEditSave = async (id, updatedTask) => {
  try {
    // Update title and description
    await updateTask(id, {
      title: updatedTask.title,
      description: updatedTask.description,
      deadline: updatedTask.deadline?.toISOString() // Convert to ISO string
    });

    // Handle status change if needed
    if (updatedTask.is_completed !== task.is_completed) {
      await updateTaskStatus(id, updatedTask.is_completed);
    }
    
    onTaskUpdated();
  } catch (error) {
    console.error('Error updating task:', error);
  }
};

  return (
    <>
      <Card variant="outlined" className='shadow' sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <div>
              <Typography variant="h6">{task.title}</Typography>
              <Typography color="text.secondary">{task.description}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
              Deadline: {task.deadline ? 
                new Date(task.deadline).toLocaleString() : 
                'No deadline'
              }
            </Typography>
              <Chip
                label={task.is_completed ? 'Completed' : 'Pending'}
                color={task.is_completed ? 'success' : 'warning'}
                size="small"
                sx={{ mt: 1 }}
              />
            </div>
            <Stack direction="row">
              <IconButton color="info" onClick={() => setEditOpen(true)}>
                <Edit />
              </IconButton>
              {!task.is_completed && (
                <IconButton color="success" onClick={handleComplete}>
                  <Check />
                </IconButton>
              )}
              <IconButton color="error" onClick={handleDelete}>
                <Delete />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <EditTaskDialog
        open={editOpen}
        task={task}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />
    </>
  );
}