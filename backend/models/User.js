// Import mongoose to create schema and model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * USER SCHEMA
 * Defines the structure for user documents in MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true, // Removes whitespace from both ends
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    // User's email (used for login)
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true, // No two users can have the same email
      lowercase: true, // Converts email to lowercase
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },

    // User's password (will be hashed before saving)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't include password in queries by default (security)
    },

    // User's movie preferences (genres they like)
    preferences: {
      genres: {
        type: [String], // Array of genre names
        default: [] // Empty array by default
      },
      languages: {
        type: [String], // Preferred languages (e.g., ['English', 'Spanish'])
        default: ['English']
      }
    },

    // User's profile image URL (optional)
    avatar: {
      type: String,
      default: 'https://via.placeholder.com/150' // Default placeholder image
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

/**
 * MIDDLEWARE: Hash password before saving to database
 * This runs automatically before user.save()
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * METHOD: Compare entered password with hashed password in database
 * Used during login to verify credentials
 * @param {String} enteredPassword - The password user entered
 * @returns {Boolean} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);