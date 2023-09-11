import { useDrop } from 'react-dnd';
import { useState } from 'react';
import { Box, Typography, Divider, IconButton } from '@mui/material';
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

    // Define column colors based on category
    let columnColor;
    switch (category) {
        case "toDo":
            columnColor = "bg-gradient-to-b from-pink-100 to-red-100";
            break;
        case "inProgress":
            columnColor = "bg-gradient-to-b from-yellow-100 to-orange-100";
            break;
        case "done":
            columnColor = "bg-gradient-to-b from-green-100 to-teal-100";
            break;
        default:
            columnColor = "bg-gradient-to-b from-blue-100 to-indigo-100";
            break;
    }

    return (
        <Box ref={dropRef} className={`flex flex-col w-1/3 ${columnColor} p-6 rounded-lg shadow-md space-y-4`}>
            <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="text-blue-700 font-bold">
                    {title}
                </Typography>
                {category === "toDo" && (
                    <IconButton
                        color="primary"
                        onClick={handleAddButtonClick}
                    >
                        <AddIcon />
                    </IconButton>
                )}
            </div>
            
            <Divider style={{ marginBottom: '16px' }} />

            {showNewTaskForm && <NewTask onAdd={handleTaskAdded} />}   {/* Conditionally render NewTask form based on state */}

            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <Task
                            key={task._id}
                            task={task}
                            onDelete={onDelete}
                            onMove={onMove}
                            onCollect={onCollect}   
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
