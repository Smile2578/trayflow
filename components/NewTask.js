import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Snackbar, CssBaseline, Paper, IconButton } from '@mui/material';
import Alert from '@mui/material/Alert';

function NewTask({ onAdd, onClose }) {
    const [users, setUsers] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [practitionerName, setPractitionerName] = useState('');
    const [taskType, setTaskType] = useState('');
    const [impressionDate, setImpressionDate] = useState(new Date().toISOString().slice(0, 10));
    const [arcade, setArcade] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [priority, setPriority] = useState('Normal');
    const [comment, setComment] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('error');
    const [upperFile, setUpperFile] = useState(null);
    const [lowerFile, setLowerFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users/fetchuser');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        fetchUsers();
    }, []);


    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        let contentType = '';  // initialize to empty string
    
        if (file) {
            if (file.name.endsWith('.stl')) {
                contentType = 'model/stl';
            } else if (file.name.endsWith('.jpg')) {
                contentType = 'image/jpeg';
            } else {
                // Handle other file types if necessary
            }
            
            console.log("Set Content Type:", contentType);
            document.getElementById(type + 'FileName').innerText = file.name;
        }
    
        if (type === 'upper') {
            setUpperFile(file);
        } else if (type === 'lower') {
            setLowerFile(file);
        }
    };
    

    const handleFileRemove = (type) => {
        document.getElementById(type + 'Impression').value = '';
        document.getElementById(type + 'FileName').innerText = '';
    }

    const handleUpload = async (file) => {
        const response = await fetch(`/api/uploads/uploadToGCS`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
            }),
            credentials: 'include',
        });
    
        if (!response.ok) {
            throw new Error('Failed to get signed URL for GCS.');
        }
    
        const { signedUrl } = await response.json();
        
        // Upload the file directly to the server endpoint
        const uploadResponse = await fetch(`/api/uploads/uploadToGCS`, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
            credentials: 'include',
        });
    
        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file.');
        }
    
        return signedUrl.split("?")[0]; // Return the GCS file path
    };
    

    const handleAddTask = async (e) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        e.preventDefault();
    
        let arcadeData = {
            upperImpression: '',
            upperImpressionGCSKey: '',
            lowerImpression: '',
            lowerImpressionGCSKey: ''
        };
    
        try {
            if ((arcade === 'upper' || arcade === 'both') && upperFile) {
                const upperImpressionKey = await handleUpload(upperFile, 'upper');
                if (!upperImpressionKey) {
                    throw new Error('Failed to upload upper impression.');
                }
                arcadeData.upperImpression = upperFile.name;
                arcadeData.upperImpressionGCSKey = upperImpressionKey;
            }
    
            if ((arcade === 'lower' || arcade === 'both') && lowerFile) {
                const lowerImpressionKey = await handleUpload(lowerFile, 'lower');
                if (!lowerImpressionKey) {
                    throw new Error('Failed to upload lower impression.');
                }
                arcadeData.lowerImpression = lowerFile.name;
                arcadeData.lowerImpressionGCSKey = lowerImpressionKey;
            }
    
            const taskData = {
                patientName,
                practitionerName,
                taskType,
                impressionDate,
                quantity,
                priority,
                comment,
                arcade: arcadeData, // Use arcadeData here
                status: 'A faire',
            };
    
            const response = await fetch('/api/tasks/createtask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });
    
            if (!response.ok) {
                throw new Error('Failed to add task.');
            }
    
            const data = await response.json();
            onAdd(data);
            onClose();
    
            setPatientName('');
            setTaskType('');
            setImpressionDate(new Date().toISOString().slice(0, 10));
            setArcade('');
            setQuantity(1);
            setPriority('Normal');
            setComment('');
    
            setOpenSnackbar(true);
            setSnackbarMessage('Task created successfully.');
            setSnackbarSeverity('success');
        } catch (error) {
            setOpenSnackbar(true);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    
    return (
        <Paper elevation={3} style={{ padding: '20px', borderRadius: '15px' }}>
            <CssBaseline />
            <form onSubmit={handleAddTask}>
                <TextField 
                    fullWidth
                    margin="normal"
                    label="Nom du Patient"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    required
                    variant="outlined"
                />

                    <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel>Praticien</InputLabel>
                        <Select
                            value={practitionerName}
                            onChange={e => setPractitionerName(e.target.value)}
                            label="Praticien"
                            required
                        >
                            {users.map(user => (
                                <MenuItem key={user._id} value={user.userName} style={{ color: 'black' }}>
                                    {user.userName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


            <FormControl fullWidth margin="normal">
                <InputLabel>Type de travail</InputLabel>
                <Select
                    value={taskType}
                    onChange={e => setTaskType(e.target.value)}
                    required
                >
                    <MenuItem value="Contention">Contention</MenuItem>
                    <MenuItem value="Blanchiment">Blanchiment</MenuItem>
                    <MenuItem value="Bruxisme">Bruxisme</MenuItem>
                    <MenuItem value="SmileSecure">SmileSecure</MenuItem>
                </Select>
            </FormControl>

            <TextField 
                fullWidth
                margin="normal"
                type="date"
                label="Date Empreinte"
                value={impressionDate}
                onChange={e => setImpressionDate(e.target.value)}
                required
            />

            <TextField 
                fullWidth
                margin="normal"
                type="number"
                label="Quantité"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Priorité</InputLabel>
                <Select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    required
                >
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
            </FormControl>

            
            <FormControl fullWidth margin="normal">
        <InputLabel>Arcade</InputLabel>
        <Select
            value={arcade}
            onChange={e => setArcade(e.target.value)}
            required
        >
            <MenuItem value="upper">Haut</MenuItem>
            <MenuItem value="lower">Bas</MenuItem>
            <MenuItem value="both">Haut et Bas</MenuItem>
        </Select>
    </FormControl>
    
    {(arcade === 'upper' || arcade === 'both') && (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="upperImpression">
                Upload Arcade Haut (.stl or .jpg)
            </label>
            <div className="flex items-center">
                <input 
                    type="file" 
                    id="upperImpression"
                    accept=".stl,.jpg" 
                    onChange={e => handleFileChange(e, 'upper')} 
                    required
                    className="hidden" 
                />
                <label htmlFor="upperImpression" className="mr-2 cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                    Selectionner un fichier
                </label>
                <span id="upperFileName" className="mr-2 overflow-hidden">
                    
                </span>
                <IconButton onClick={() => handleFileRemove('upper')} size="small">
                    <DeleteIcon />
                </IconButton>
            </div>
        </div>
    )}

    {(arcade === 'lower' || arcade === 'both') && (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lowerImpression">
                Upload Arcade Bas (.stl or .jpg)
            </label>
            <div className="flex items-center">
                <input 
                    type="file" 
                    id="lowerImpression"
                    accept=".stl,.jpg" 
                    onChange={e => handleFileChange(e, 'lower')} 
                    required
                    className="hidden"
                />
                <label htmlFor="lowerImpression" className="mr-2 cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                    Selectionner un fichier
                </label>
                <span id="lowerFileName" className="mr-2 overflow-hidden">
                    
                </span>
                <IconButton onClick={() => handleFileRemove('lower')} size="small">
                    <DeleteIcon />
                </IconButton>
            </div>
        </div>
    )}


            <TextField 
                fullWidth
                margin="normal"
                multiline
                rows={3}
                label="Commentaires"
                value={comment}
                onChange={e => setComment(e.target.value)}
            />

                <Button 
                    type="submit" 
                    variant="contained" 
                    style={{ backgroundColor: '#3f51b5', color: 'white' }}
                    className="mt-4"
                    fullWidth
                >
                    Créer nouvelle tâche
                </Button>

                <Snackbar 
                    open={openSnackbar} 
                    autoHideDuration={3000} 
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </form>
        </Paper>
    );
}

export default NewTask;
