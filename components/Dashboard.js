import { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Column from './Column';

function Dashboard({ onLogout }) {
    const [tasks, setTasks] = useState([]);

    // Fetch all tasks from the backend
    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks/fetchtask');
            const data = await res.json();
            setTasks(data);
            console.log(data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const toDoTasks = tasks.filter(task => task.status === 'A faire');
    const inProgressTasks = tasks.filter(task => task.status === 'En Cours');
    const doneTasks = tasks.filter(task => task.status === 'Prêt');

    const moveTask = async (id, targetStatus) => {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: targetStatus }),
            });
            fetchTasks();
        } catch (err) {
            console.error("Error moving task:", err);
        }
    };

    const handleCollect = async (id) => {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Récupéré' }), 
            });
            fetchTasks();
        } catch (err) {
            console.error("Error collecting task:", err);
        }
    };

    return (
        <Container>
            <Box className="flex justify-between items-center mb-8">
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                <IconButton onClick={onLogout} color="error">
                    <LogoutIcon />
                </IconButton>
            </Box>
            <Box className="flex justify-between space-x-4">
                <Column
                    key={toDoTasks.length}
                    title="A faire"
                    category="toDo"
                    tasks={toDoTasks}
                    onMove={moveTask}
                    onAddTask={(newTask) => setTasks(prev => [...prev, newTask])}  // Update the tasks state directly
                    onDelete={(id) => setTasks(prevTasks => prevTasks.filter(task => task._id !== id))}  // Update tasks state when a task is deleted
                />
                <Column
                    title="En Cours"
                    category="inProgress"
                    tasks={inProgressTasks}
                    onMove={moveTask}
                    onDelete={(id) => setTasks(prevTasks => prevTasks.filter(task => task._id !== id))}  // Update tasks state when a task is deleted
                />
                <Column
                    title="Prêt"
                    category="done"
                    tasks={doneTasks}
                    onMove={moveTask}
                    onDelete={(id) => setTasks(prevTasks => prevTasks.filter(task => task._id !== id))}  // Update tasks state when a task is deleted
                />
            </Box>
        </Container>
    );
}

export default Dashboard;
