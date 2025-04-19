import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for Location
interface ILocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  radius?: number; // in meters
  placeId?: string;
  name?: string;
}

// Interface for Reminder
interface IReminder {
  type: 'time' | 'location' | 'both';
  triggerAt?: Date;
  isTriggered?: boolean;
  notificationSent?: boolean;
}

// Interface for Attachment
interface IAttachment {
  url: string;
  type: 'image' | 'document' | 'audio' | 'other';
  name?: string;
}

// Interface for Recurrence
interface IRecurrence {
  pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | null;
  endDate?: Date;
  customPattern?: string;
}

// Interface for Collaborator
interface ICollaborator {
  user: Types.ObjectId;
  permission: 'view' | 'edit';
}

// Interface for History Item
interface IHistoryItem {
  action: string;
  changedField: string;
  oldValue: any;
  newValue: any;
  changedBy: Types.ObjectId;
  changedAt: Date;
}

// Main Todo Interface extending Mongoose Document
interface ITodo extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'shopping' | 'health' | 'other';
  dueDate?: Date;
  isCompleted: boolean;
  location?: ILocation;
  reminders: Types.Array<IReminder>;
  tags: Types.Array<string>;
  attachments: Types.Array<IAttachment>;
  recurrence?: IRecurrence;
  collaborators: Types.Array<ICollaborator>;
  history: Types.Array<IHistoryItem>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID']
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'shopping', 'health', 'other'],
    default: 'personal'
  },
  dueDate: Date,
  isCompleted: {
    type: Boolean,
    default: false
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    },
    address: String,
    radius: {
      type: Number, // in meters
      default: 100
    },
    placeId: String,
    name: String
  },
  reminders: [{
    type: {
      type: String,
      enum: ['time', 'location', 'both'],
      required: true
    },
    triggerAt: Date, // For time-based reminders
    isTriggered: {
      type: Boolean,
      default: false
    },
    notificationSent: {
      type: Boolean,
      default: false
    }
  }],
  tags: [String],
  attachments: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'document', 'audio', 'other']
    },
    name: String
  }],
  recurrence: {
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom', null]
    },
    endDate: Date,
    customPattern: String
  },
  collaborators: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }],
  history: [{
    action: String,
    changedField: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create location index for geospatial queries
TodoSchema.index({ location: '2dsphere' });

// Add reverse populate with virtuals
TodoSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'todo',
  justOne: false
});

// Create the model
const Todo = mongoose.model<ITodo>('Todo', TodoSchema);

export default Todo;