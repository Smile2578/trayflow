const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  practitionerName: {
    type: String,
    required: true,
  },
  taskType: {
    type: String,
    required: true,
    enum: ['Contention', 'Blanchiment', 'Bruxisme', 'Smile Secure']
  },
  impressionDate: {
    type: Date,
    required: true
  },
  fittingDate: {
    type: Date,
    default: function() { return new Date(this.impressionDate.getTime() + 7*24*60*60*1000) }
  },
  upperImpression: String,
  upperImpressionReady: {
    type: Boolean,
    default: false
  },
  lowerImpression: String,
  lowerImpressionReady: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['Normal', 'Urgent']
  },
  status: {
    type: String,
    required: true,
    enum: ['A faire', 'En Cours', 'Prêt', 'Récupéré'],
    default: 'A faire'
  },
  comment: String
}, {
  timestamps: true  // This will create 'createdAt' and 'updatedAt' fields
});

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);

