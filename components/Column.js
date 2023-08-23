import { useDrop } from 'react-dnd';
import { useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Task from './Task';
import NewTask from './NewTask';

const TASK_TYPE = "TASK";

function Column({ title, category, tasks, onDelete, onMove, onAddTask, onCollect }) {
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);

    const [, dropRef] = useDrop({
        accept: TASK_TYPE,
        drop: (item) => {
            if (onMove) {
                onMove(item.id, title);
            }
        }
    });
    
    const handleAddButtonClick = () => {
        setShowNewTaskForm(prevState => !prevState);
    };

    const handleTaskAdded = (newTask) => {
        onAddTask(newTask);
        setShowNewTaskForm(false);
    }

    const filteredTasks = tasks.filter(task => task.status === title);

    return (
        <Box ref={dropRef} className="flex flex-col w-1/3 bg-gray-100 p-4 rounded-lg shadow-lg space-y-4">
            <div className="flex justify-between items-center">
                <Typography variant="h6">
                    {title}
                </Typography>
                {category === "toDo" && (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddButtonClick}
                    >
                        Nouvelle tâche
                    </Button>
                )}
            </div>
            <Divider />

            {showNewTaskForm && <NewTask onAdd={handleTaskAdded} />}   {/* Conditionally render NewTask form based on state */}

            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <Task
                            key={task._id}
                            task={task}
                            onDelete={onDelete}
                            onMove={onMove}
                            onCollect={onCollect}   // Pass onCollect prop to Task
                            category={category}
                        />
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary" className="text-center">
                        Rien à faire !
                    </Typography>
                )}
            </div>
        </Box>
    );
}

export default Column;
