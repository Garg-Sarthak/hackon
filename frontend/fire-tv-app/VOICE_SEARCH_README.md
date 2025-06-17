# Fire TV App - Voice Search Integration

This Fire TV app now includes advanced voice search functionality powered by Google Gemini AI and TMDB (The Movie Database) API.

## New Features

### 🎤 Voice Search
- Click the "Voice" button in the header to open voice search overlay
- Speak naturally (e.g., "Show me action movies", "I want something funny")
- AI processes your speech and finds relevant content
- Results are displayed in a beautiful overlay with movie/show details

### 🧠 AI-Powered Search Understanding
- Uses Google Gemini to understand search intent
- Handles specific title searches ("Find Stranger Things")
- Understands mood-based queries ("I'm feeling adventurous")
- Supports genre searches ("Show me comedies")
- Actor/director searches ("Movies with Tom Hanks")

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend/fire-tv-app
npm install
```

### 2. Get API Keys

#### TMDB API Key
1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account and go to Settings > API
3. Request an API key (it's free)
4. Copy your API key

#### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy your API key

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   ```env
   VITE_TMDB_API_KEY=your_actual_tmdb_api_key_here
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

### 4. Run the Application
```bash
npm run dev
```

## How Voice Search Works

### 1. Voice Input
- User clicks "Voice" button
- Speech recognition captures user's voice input
- Text is displayed in real-time

### 2. AI Processing
- Voice input is sent to Google Gemini API
- AI analyzes the intent and extracts:
  - Search type (specific title, genre, actor, etc.)
  - Content type preference (movies, TV shows, or both)
  - Relevant keywords and genres

### 3. Smart Search
- Based on AI analysis, appropriate TMDB API calls are made:
  - **Specific titles**: Direct search API
  - **Genre/mood**: Discover API with genre filters
  - **Actor/director**: Multi-search API
  - **General queries**: Multi-search with processed keywords

### 4. Results Display
- Results are formatted and displayed in an overlay
- Each result shows poster, title, rating, year, and description
- Users can navigate back to home screen

## Voice Search Examples

Try these voice commands:
- "Show me action movies"
- "I want to watch something funny"
- "Find romantic comedies"
- "Search for Stranger Things"
- "Movies with Leonardo DiCaprio"
- "I'm in the mood for thriller"
- "Show me sci-fi shows"

## Browser Compatibility

The voice search feature requires:
- Modern browsers with Web Speech API support
- HTTPS connection (for microphone access)
- Microphone permissions

Supported browsers:
- Chrome (recommended)
- Edge
- Safari (limited support)
- Firefox (limited support)

## Troubleshooting

### Voice Recognition Not Working
- Ensure you're using HTTPS (required for microphone access)
- Check microphone permissions in browser settings
- Try using Chrome for best compatibility

### API Errors
- Verify your API keys are correct in `.env` file
- Check that your TMDB API key has proper permissions
- Ensure Gemini API key is valid and has quota available

### Search Results Empty
- Check browser console for API errors
- Verify internet connection
- Try different search terms

## File Structure

```
src/
├── components/
│   ├── VoiceSearch.jsx          # Voice search overlay component
│   ├── VoiceSearch.css          # Voice search styling
│   ├── SearchResults.jsx       # Search results overlay
│   ├── SearchResults.css       # Search results styling
│   └── ...
├── services/
│   └── api.js                   # API integration (TMDB + Gemini)
└── App.jsx                      # Main app with voice search integration
```

## Contributing

When adding new features:
1. Update voice search examples in the overlay
2. Enhance AI prompts in `api.js` for better understanding
3. Add new genre mappings as needed
4. Update this README with new functionality

## Next Steps

Potential enhancements:
- Add voice feedback (text-to-speech responses)
- Implement user preferences for better recommendations
- Add watch history integration
- Support for multiple languages
- Advanced filtering options in search results
