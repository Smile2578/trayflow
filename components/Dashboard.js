import { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton, Menu, MenuItem, Checkbox } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import FilterListIcon from '@mui/icons-material/FilterList';
import Column from './Column';
import Image from 'next/image';

function Dashboard({ onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState({
        Contention: true,
        Bruxisme: true,
        Blanchiment: true,
        'Smile Secure': true
    });
    const [anchorEl, setAnchorEl] = useState(null);

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

    const handleCollect = async (id, task) => {
        try {
            // Delete the associated files from GCS
            if (task.upperImpression) {
                await fetch(`/api/uploads/delete?key=${task.upperImpression}`, { method: 'DELETE' });
            }
            if (task.lowerImpression) {
                await fetch(`/api/uploads/delete?key=${task.lowerImpression}`, { method: 'DELETE' });
            }
    
            // Update the task status to 'Récupéré'
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Récupéré' }), 
            });
            
            // Fetch updated tasks
            fetchTasks();
        } catch (err) {
            console.error("Error collecting task:", err);
        }
    };
    

    const handleFilterChange = (taskType) => {
        setFilters(prev => ({ ...prev, [taskType]: !prev[taskType] }));
    };

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };

    const filteredTasks = tasks.filter(task => filters[task.taskType]);

    const toDoTasks = filteredTasks.filter(task => task.status === 'A faire');
    const inProgressTasks = filteredTasks.filter(task => task.status === 'En Cours');
    const doneTasks = filteredTasks.filter(task => task.status === 'Prêt');

    return (
        <Container className="bg-gradient-to-r from-peach-200 to-peach-400 p-4 rounded-lg">
            <Box className="flex justify-between items-center mb-8">
                <Image src="/trayflowlogo.png" alt="Trayflow Logo" width={150} height={50} />
                <div className="flex space-x-4">
                    <IconButton onClick={handleFilterClick} color="primary">
                        <FilterListIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleFilterClose}
                    >
                        {Object.keys(filters).map(taskType => (
                            <MenuItem key={taskType}>
                                <Checkbox
                                    checked={filters[taskType]}
                                    onChange={() => handleFilterChange(taskType)}
                                />
                                {taskType}
                            </MenuItem>
                        ))}
                    </Menu>
                    <IconButton onClick={onLogout} color="error">
                        <LogoutIcon />
                    </IconButton>
                </div>
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
                    onCollect={handleCollect}
                />
            </Box>
        </Container>
    );
}

export default Dashboard;
