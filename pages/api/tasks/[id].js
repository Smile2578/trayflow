import connectToDatabase from '../../../utils/db';
import Task from '../../../models/Task';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "No ID provided." });
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error("Database connection error:", dbError);
    return res.status(500).json({ message: 'Failed to connect to database.', error: dbError.message });
  }


  switch (req.method) {
    case 'GET':
      try {
        const task = await Task.findById(id);
        if (!task) {
          return res.status(404).json({ message: 'Tache non trouvé.' });
        }
        res.status(200).json(task);
      } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'PUT':
      try {
        if (req.body.action) {
          switch (req.body.action) {
            case 'move':
              if (!['A faire', 'En Cours', 'Prêt', 'Récupéré'].includes(req.body.status)) {
                return res.status(400).json({ message: 'Invalid status.' });
              }
              const movedTask = await Task.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
              if (!movedTask) {
                return res.status(404).json({ message: 'Task not found.' });
              }
              res.status(200).json({ message: 'Task moved successfully', task: movedTask });
              break;

            case 'collect':
              const collectedTask = await Task.findByIdAndUpdate(id, { status: 'Récupéré' }, { new: true });
              if (!collectedTask) {
                return res.status(404).json({ message: 'Task not found.' });
              }
              res.status(200).json({ message: 'Task collected successfully', task: collectedTask });
              break;

            default:
              res.status(400).json({ message: 'Invalid action.' });
          }
        } else {
          const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
          if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found.' });
          }
          res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
        }
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedTask = await Task.findByIdAndRemove(id);
        if (!deletedTask) {
          return res.status(404).json({ message: 'Tache non trouvé' });
        }
        res.status(200).json({ message: 'Tâche supprimée !' });
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'POST':
      if (req.body.action && req.body.action === 'move') {
        // Handle the move logic here
        // ...
      } else {
        res.status(400).json({ message: 'Invalid action.' });
      }
      break;

     default:
      console.warn("Method not allowed:", req.method);
      res.status(405).end();  // Method Not Allowed
      break;
  }
}