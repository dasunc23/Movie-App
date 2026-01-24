// Import mongoose
const mongoose = require('mongoose');

/**
 * RECOMMENDATION SCHEMA
 * Stores AI-generated movie recommendations based on user's mood/description
 */
const recommendationSchema = new mongoose.Schema(
  {
    // Reference to the user who requested recommendations
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links to User model
      required: true
    },

    // User's input (mood/description)
    // e.g., "I want something thrilling with plot twists"
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
      maxlength: [500, 'Prompt cannot exceed 500 characters']
    },

    // Array of recommended movie IDs
    recommendedMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie' // Links to Movie model
      }
    ],

    // AI's explanation for why these movies were recommended
    aiResponse: {
      type: String,
      required: true
    },

    // Optional: Store the AI model used (for future reference)
    aiModel: {
      type: String,
      default: 'claude-sonnet-4' // or 'gpt-4', etc.
    },

    // User feedback on recommendations (optional)
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      comment: {
        type: String,
        maxlength: 200
      }
    }
  },
  {
    timestamps: true // When recommendation was created
  }
);

/**
 * INDEX: Find all recommendations by a specific user
 */
recommendationSchema.index({ user: 1, createdAt: -1 });

// Export the Recommendation model
module.exports = mongoose.model('Recommendation', recommendationSchema);