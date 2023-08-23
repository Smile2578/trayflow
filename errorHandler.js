// errorHandler.js
module.exports = (err, req, res, next) => {
    // Log the error details for debugging
    console.error(err.stack);
  
    // If it's a known error, use the status code and message from the error
    if (err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
  
    // If it's a validation error, return a 400 status code with the validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages });
    }
  
    // For other types of errors, return a 500 status code with a generic message
    return res.status(500).json({ message: 'Une erreur serveur est survenue' });
  };
  