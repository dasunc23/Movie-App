// Import Groq SDK
const Groq = require('groq-sdk');

// Initialize Groq client with API key from environment variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate movie recommendations based on user's mood/description
 * @param {String} userPrompt - User's mood/vibe description
 * @param {Object} userPreferences - User's genre/language preferences (optional)
 * @returns {Object} - AI recommendations with movie titles and explanations
 */
exports.generateRecommendations = async (userPrompt, userPreferences = {}) => {
  try {
    // Build system prompt
    const systemPrompt = `You are an expert movie recommendation AI. Your job is to suggest movies based on the user's mood, vibe, or description.

IMPORTANT RULES:
1. Suggest 5-8 movies that match the user's mood/description
2. For each movie, provide:
   - Movie title and year (e.g., "Inception (2010)")
   - Brief explanation (1-2 sentences) why it matches their mood
   - A "vibe match" score out of 10
3. Consider the user's genre preferences if provided, but prioritize mood match
4. Keep responses engaging, fun, and 100% spoiler-free
5. Format as a clean numbered list

RESPONSE FORMAT EXAMPLE:
1. **Inception (2010)** - Vibe Match: 9/10
   A mind-bending thriller that keeps you guessing. Perfect for when you want something intellectually stimulating with stunning visuals.

2. **The Prestige (2006)** - Vibe Match: 8/10
   Dark, mysterious, and full of twists. Great if you enjoy psychological drama with a magical twist.

(Continue for 5-8 movies total)`;

    // Build user message with preferences
    let userMessage = `Current mood/vibe: ${userPrompt}`;
    
    if (userPreferences.genres && userPreferences.genres.length > 0) {
      userMessage += `\nPreferred genres: ${userPreferences.genres.join(', ')}`;
    }
    
    if (userPreferences.languages && userPreferences.languages.length > 0) {
      userMessage += `\nPreferred languages: ${userPreferences.languages.join(', ')}`;
    }

    userMessage += '\n\nRecommend movies now!';

    // Call Groq API

    const completion = await groq.chat.completions.create({
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
    ],
    model: 'llama-3.3-70b-versatile', 
    temperature: 0.8,
    max_tokens: 1000,
    });

    // Extract AI response
    const aiResponse = completion.choices[0]?.message?.content || 'No recommendations generated.';

    // Parse movie titles from the response
    // This extracts movie names in format "Title (Year)"
    const movieTitles = extractMovieTitles(aiResponse);

    return {
      aiResponse,
      movieTitles, // Array of movie titles for fetching from TMDB
      model: 'llama-3.3-70b-versatile'
    };
  } catch (error) {
    console.error('Groq AI error:', error);
    throw new Error('Failed to generate recommendations from AI');
  }
};

/**
 * Helper function to extract movie titles from AI response
 * Looks for patterns like "Title (Year)" or "**Title (Year)**"
 * @param {String} text - AI response text
 * @returns {Array} - Array of movie titles
 */
function extractMovieTitles(text) {
  // Regex to match movie titles in format: "Title (Year)" or "**Title (Year)**"
  const regex = /\*\*([^*]+)\s\((\d{4})\)\*\*|([^*\n]+)\s\((\d{4})\)/g;
  const titles = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Extract title (could be in group 1 or 3)
    const title = (match[1] || match[3]).trim();
    titles.push(title);
  }

  return titles;
}

/**
 * Generate group movie recommendations for watch parties
 * @param {Array} memberPreferences - Array of preference objects from all members
 * @returns {Object} - AI recommendations for the group
 */
exports.generateGroupRecommendations = async (memberPreferences) => {
  try {
    // Combine all member preferences
    const genresCount = {};
    const moodsCount = {};
    
    memberPreferences.forEach((pref) => {
      // Count genre preferences
      if (pref.genres) {
        pref.genres.forEach((genre) => {
          genresCount[genre] = (genresCount[genre] || 0) + 1;
        });
      }
      
      // Count mood preferences
      if (pref.moods) {
        pref.moods.forEach((mood) => {
          moodsCount[mood] = (moodsCount[mood] || 0) + 1;
        });
      }
    });

    // Find most common preferences
    const topGenres = Object.entries(genresCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    const topMoods = Object.entries(moodsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mood]) => mood);

    // Build group prompt
    const systemPrompt = `You are recommending movies for a GROUP watch party. Suggest movies that will appeal to EVERYONE based on their combined preferences.

RULES:
1. Suggest 5-7 movies that balance everyone's tastes
2. For each movie, explain why it works for the GROUP
3. Prioritize movies that are fun to watch together
4. Format as numbered list with title, year, and group appeal explanation`;

    const userMessage = `Group preferences:
- Popular genres: ${topGenres.join(', ')}
- Popular moods/vibes: ${topMoods.join(', ')}
- Number of people: ${memberPreferences.length}

Recommend movies perfect for this group watch party!`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No recommendations generated.';
    const movieTitles = extractMovieTitles(aiResponse);

    return {
      aiResponse,
      movieTitles,
      groupPreferences: {
        topGenres,
        topMoods,
        memberCount: memberPreferences.length
      }
    };
  } catch (error) {
    console.error('Groq group recommendations error:', error);
    throw new Error('Failed to generate group recommendations');
  }
};