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
  arcade: {
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
    upperImpressionGCSKey: {
      type: String,
      default: null
    },
    lowerImpressionGCSKey: {
      type: String,
      default: null
    }
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
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
  comment: {
  type: String,
  timestamps: true,
  default: null
},
  numeroDeLot: {
    type: String,
    default: null
}

});


module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);
