require('dotenv').config();

/**
 * API Key authentication middleware
 * Validates requests contain a valid API key
 */
function apiKeyAuth(req, res, next) {
  // Get API key from header
  const apiKey = req.headers['x-api-key'];
  
  // Check if API key exists and matches expected value
  if (!apiKey || apiKey !== process.env.API_KEY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  
  // API key is valid, proceed to next middleware
  next();
}

module.exports = { apiKeyAuth }; 