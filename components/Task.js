import { useDrag } from 'react-dnd';
import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectIcon from '@mui/icons-material/Archive';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const TASK_TYPE = "TASK";

function Task({ task, onDelete, onMove, category, onCollect }) {
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const [upperDownloadLink, setUpperDownloadLink] = useState(null);
    const [lowerDownloadLink, setLowerDownloadLink] = useState(null);
    const [{ isDragging }, dragRef] = useDrag({
        type: TASK_TYPE,
        item: { id: task._id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });


    const handleDelete = async () => {
        const response = await fetch(`/api/tasks/${task._id}`, { 
            method: 'DELETE',
        });
        if (response.ok) {
            onDelete(task._id);
        } else {
            alert("Failed to delete the task.");
        }
    };

    const handleCollect = async () => {
        // Delete associated files when task is collected
        if (task.upperImpression) {
            await fetch(`/api/uploads/upload/${task.upperImpression}`, { method: 'DELETE' });
        }
        if (task.lowerImpression) {
            await fetch(`/api/uploads/upload/${task.lowerImpression}`, { method: 'DELETE' });
        }
        // Call the passed in onCollect function to update the task's status to "Récupéré"
        onCollect(task._id);
    };

    const handleConfirm = () => {
        if (actionToConfirm === 'delete') {
            handleDelete();
        } else if (actionToConfirm === 'collect') {
            handleCollect();
        }
        setActionToConfirm(null);
    };

    let cardColor = "bg-gray-50";
    switch(task.taskType) {
        case "Contention": cardColor = "bg-blue-50"; break;
        case "Bruxisme": cardColor = "bg-green-50"; break;
        case "Blanchiment": cardColor = "bg-yellow-50"; break;
        case "Smile Secure": cardColor = "bg-pink-50"; break;
    }

    return (
        <div ref={dragRef} className={`transform transition-transform duration-300 border rounded-lg p-4 shadow-md relative mb-4 ${cardColor} ${isDragging ? 'opacity-50 scale-105' : 'opacity-100 scale-100'}`}>
            <div className="absolute top-2 right-2 cursor-pointer" onClick={() => setActionToConfirm('delete')}>
                <DeleteIcon style={{ color: 'red' }} />
            </div>
            {category === 'done' && (
                <div className="absolute top-2 right-10 cursor-pointer" onClick={() => setActionToConfirm('collect')}>
                    <CollectIcon style={{ color: 'green' }} />
                </div>
            )}
            <Dialog open={actionToConfirm !== null} onClose={() => setActionToConfirm(null)}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionToConfirm === 'delete' ? 'Voulez-vous vraiment supprimer cette tâche ?' : 'Voulez-vous vraiment collecter cette tâche ?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionToConfirm(null)} color="primary">Annuler</Button>
                    <Button onClick={handleConfirm} color="primary">Confirmer</Button>
                </DialogActions>
            </Dialog>
            <h3 className="font-semibold text-xl mb-2">{task.patientName}</h3>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs">{task.status}</span>
            <p className="text-sm mb-2 mt-2"><span className="font-medium">Praticien:</span> {task.practitionerName}</p>
            <p className="text-sm mb-2"><span className="font-medium">Type de Travail:</span> {task.taskType}</p>
            <p className="text-sm mb-2"><span className="font-medium">Date Empreinte:</span> {new Date(task.impressionDate).toLocaleDateString()}</p>
            <p className="text-sm mb-2"><span className="font-medium">Date Travail:</span> {new Date(task.fittingDate).toLocaleDateString()}</p>
            <p className="text-sm mb-2"><span className="font-medium">Priorité:</span> {task.priority}</p>
            {task.upperImpression || task.lowerImpression ? (
        <>
            <p className="text-sm mb-2">
                <span className="font-medium">Empreinte:</span> 
                {task.upperImpression && <a href={`/api/uploads/download?key=${task.upperImpression}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-2">Haut</a>}
                {task.upperImpression && task.lowerImpression && ' & '}
                {task.lowerImpression && <a href={`/api/uploads/download?key=${task.lowerImpression}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Bas</a>}

            </p>
        </>
    ) : (
            <p className="text-sm mb-2">
                <span className="font-medium">Empreinte:</span> {task.upperImpression ? 'Haut' : task.lowerImpression ? 'Bas' : 'Haut & Bas'}
            </p>
        )}
            <p className="text-sm mb-2"><span className="font-medium">Quantité:</span> {task.quantity}</p>
            {task.comment && <p className="text-sm italic">{task.comment}</p>}
        </div>
    );    
}

export default Task;
