import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ClassroomSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Classroom name is required'],
    trim: true,
    minlength: [3, 'Classroom name must be at least 3 characters'],
    maxlength: [100, 'Classroom name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Generate a unique classroom code before saving
ClassroomSchema.pre('save', async function(next) {
  // Only generate code if it doesn't exist
  if (!this.code) {
    // Generate a random 6-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    this.code = code;
    
    // Check if code already exists and regenerate if needed
    try {
      const existingClass = await mongoose.model('Classroom').findOne({ code });
      if (existingClass) {
        return this.pre('save', next); // Regenerate code
      }
    } catch (err) {
      return next(err);
    }
  }
  
  next();
});

export default mongoose.model('Classroom', ClassroomSchema);