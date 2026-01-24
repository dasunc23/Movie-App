// Import mongoose
const mongoose = require('mongoose');

/**
 * WATCH PARTY SCHEMA
 * For group movie recommendations - friends answer questions together
 */
const watchPartySchema = new mongoose.Schema(
  {
    // Name of the watch party
    name: {
      type: String,
      required: [true, 'Party must have a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    // User who created the party
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // List of members in the party
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        // Member's name (if they're not registered users)
        guestName: {
          type: String,
          default: null
        },
        // Has this member submitted their preferences?
        hasResponded: {
          type: Boolean,
          default: false
        },
        // When they joined the party
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Preference answers from all members
    preferences: {
      // What genres does the group prefer?
      genres: {
        type: [String],
        default: []
      },
      // Mood/vibe the group wants
      moods: {
        type: [String],
        default: []
      },
      // Any movies to avoid?
      avoid: {
        type: [String],
        default: []
      }
    },

    // AI-generated group recommendation based on all answers
    groupRecommendation: {
      movies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Movie'
        }
      ],
      // AI's explanation for group picks
      explanation: {
        type: String,
        default: null
      }
    },

    // Scheduled date/time for the watch party (optional)
    scheduledFor: {
      type: Date,
      default: null
    },

    // Party status
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },

    // Unique invite code for joining party
    inviteCode: {
      type: String,
      unique: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * METHOD: Generate random invite code
 */
watchPartySchema.methods.generateInviteCode = function () {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * MIDDLEWARE: Generate invite code before saving
 */
watchPartySchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = this.generateInviteCode();
  }
  next();
});

/**
 * INDEX: Find parties by invite code quickly
 */
watchPartySchema.index({ inviteCode: 1 });

/**
 * INDEX: Find parties created by a user
 */
watchPartySchema.index({ createdBy: 1, status: 1 });

// Export the WatchParty model
module.exports = mongoose.model('WatchParty', watchPartySchema);
