import { useDrag } from 'react-dnd';
import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectIcon from '@mui/icons-material/Archive';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import CommentIcon from '@mui/icons-material/Comment';
import DownloadIcon from '@mui/icons-material/FileDownload';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const TASK_TYPE = "TASK";

function Task({ task, onDelete, onMove, category, onCollect }) {
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const [downloading, setDownloading] = useState(false);
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

const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    
    const page = pdfDoc.addPage([230, 230]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const defaultColor = rgb(0, 0, 0);

    // Starting point for the text
    let yPosition = page.getHeight() - 50; // 50 units from the top

    // Draw text without centering
    page.drawText(task.patientName, { x: 10, y: yPosition, size: 18, color: defaultColor, font });
    yPosition -= 25; // move down 25 units for next line
    
    page.drawText(`Praticien: ${task.practitionerName}`, { x: 10, y: yPosition, size: 14, color: defaultColor, font });
    yPosition -= 20;
    
    page.drawText(`Date: ${new Date(task.impressionDate).toLocaleDateString()}`, { x: 10, y: yPosition, size: 12, color: defaultColor, font });
    yPosition -= 20;
    
    page.drawText(`Type: ${task.taskType}`, { x: 10, y: yPosition, size: 12, color: defaultColor, font });
    yPosition -= 20;
    
    page.drawText(`Quantité: ${task.quantity}`, { x: 10, y: yPosition, size: 12, color: defaultColor, font });
    yPosition -= 20;
    
    page.drawText(`Numéro de lot: ${task.numeroDeLot}`, { x: 10, y: yPosition, size: 12, color: defaultColor, font });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, `${task.patientName}.pdf`);
};

    


const handleConfirm = () => {
    if (actionToConfirm === 'delete') {
        handleDelete();
    } else if (actionToConfirm === 'collect') {
        handleCollect(task._id, task);
    }
    setActionToConfirm(null);
};

    const handleDownload = async (key) => {
        setDownloading(true);
        const response = await fetch(`/api/uploads/download?key=${key}`);
        if (response.ok) {
          const { url } = await response.json();
          window.location.href = url;  // Redirect to the signed URL for download
        } else {
          alert('Failed to download file.');
        }
        setDownloading(false);
      };
      

    let cardColor = "bg-gray-50";
    let textColor = "text-gray-800";
    switch(task.taskType) {
        case "Contention": cardColor = "bg-blue-100"; break;
        case "Bruxisme": cardColor = "bg-green-100"; break;
        case "Blanchiment": cardColor = "bg-yellow-100"; break;
        case "Smile Secure": cardColor = "bg-pink-100"; break;
    }

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

    return (
        <div ref={dragRef} className={`transform transition-transform duration-300 border rounded-lg p-4 shadow-sm relative mb-4 ${textColor} ${cardColor} ${isDragging ? 'opacity-50 scale-105' : 'opacity-100 scale-100'}`}>
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
                    {actionToConfirm === 'delete' 
                        ? 'Voulez-vous vraiment supprimer cette tâche ?' 
                        : 'Voulez-vous vraiment collecter cette tâche ?'}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionToConfirm(null)} color="primary">Annuler</Button>
                    <Button onClick={handleConfirm} color="primary">Confirmer</Button>
                </DialogActions>
            </Dialog>
            <h3 className="font-semibold text-xl text-blue-300 mb-2"><PersonIcon fontSize="small" color="primary" /> {task.patientName}</h3>
            <p className="text-sm mb-2 mt-2"><WorkIcon fontSize="small" color="primary" /> Praticien: {task.practitionerName}</p>
            <p className="text-sm mb-2"> Type de Travail: {task.taskType}</p>
            <p className="text-sm mb-2"> Date Empreinte: {new Date(task.impressionDate).toLocaleDateString()}</p>
            <p className="text-sm mb-2"><CalendarTodayIcon fontSize="small" color="primary" /> Date Travail: {new Date(task.fittingDate).toLocaleDateString()}</p>
            <p className="text-sm mb-2"> Priorité: {task.priority}
                {task.priority === "Urgent" && <WarningIcon fontSize="small" color="error" style={{ marginLeft: '8px' }} />}
            </p>
            {task.upperImpression && task.lowerImpression ? (
                <p className="text-sm mb-2">
                    Empreinte: 
                    <span onClick={() => handleDownload(task.arcade.upperImpressionGCSKey)} className="text-blue-500 hover:underline cursor-pointer ml-2">Haut</span>
                    {' & '}
                    <span onClick={() => handleDownload(task.arcade.lowerImpressionGCSKey)} className="text-blue-500 hover:underline cursor-pointer ml-2">Bas</span>
                </p>
            ) : (
                <>
                    {task.arcade.upperImpression && (
                        <p className="text-sm mb-2">
                            Empreinte: 
                            <span onClick={() => handleDownload(task.arcade.upperImpression)} className="text-blue-500 hover:underline cursor-pointer ml-2">Haut</span>
                        </p>
                    )}
                    {task.arcade.lowerImpression && (
                        <p className="text-sm mb-2">
                            Empreinte: 
                            <span onClick={() => handleDownload(task.arcade.lowerImpression)} className="text-blue-500 hover:underline cursor-pointer ml-2">Bas</span>
                        </p>
                    )}
                </>
            )}
            <p className="text-sm mb-2"> Quantité: {task.quantity}</p>
            {task.comment && <p className="text-sm italic"><CommentIcon fontSize="small" color="primary" /> {task.comment}</p>}
            <div className="absolute bottom-2 right-2 cursor-pointer" onClick={generatePDF}>
                <DownloadIcon style={{ color: 'blue' }} />
            </div>
        </div>
    );    
}

export default Task;
