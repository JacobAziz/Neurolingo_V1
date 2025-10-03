# 🧠 NeuroLingo Hub - German Mastery Platform

A comprehensive German language learning web application featuring AI-powered sentence analysis and real-life scenario dialogue generation.

**Status:** ✅ Fully Refactored & Production Ready  
**Last Updated:** October 3, 2025  
**Version:** 2.1 (User History Dashboard Added)

> 📝 **See [ProjectSummary-1.md](./ProjectSummary-1.md)** for complete refactoring details and session notes.

---

## 📋 Table of Contents
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Setup Instructions](#-setup-instructions)
- [Module Documentation](#-module-documentation)
- [API Integration](#-api-integration)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)

---

## ✨ Features

### 1. **Authentication System**
- Email/password authentication
- Google OAuth integration
- Session management with Supabase

### 2. **Language Analyzer**
- Deep grammatical analysis of German sentences
- Multi-layered translations (word-for-word + proper translation)
- Vocabulary breakdown with case types and parts of speech
- Sentence structure analysis
- Deeper linguistic insights (verb placement, idiomatic expressions, difficulty levels)
- Linguistic nuggets (untranslatable particles, reflexiveness, cultural expressions)
- Plug & Play reusable phrases
- Text-to-speech with multiple voice options
- Database caching for instant retrieval

### 3. **Scenarios Generator**
- 26+ real-life scenarios (supermarket, restaurant, pharmacy, etc.)
- AI-powered context suggestions
- Customizable dialogue format and length
- Generated dialogues with German text + English translations
- TTS support for each dialogue line

### 4. **User History Dashboard**
- Personal history tracking for all analyses and scenarios
- View previously analyzed German sentences
- Access previously generated dialogue scenarios
- Organized by type (analyses vs. scenarios) with timestamps
- Reopen and review past work instantly
- Delete unwanted history items
- Fully scoped to authenticated user (privacy-protected)

### 5. **Text-to-Speech**
- 8 different German voice options
- Audio playback for words, phrases, and full sentences
- Download audio as WAV files
- High-quality audio using Google Gemini TTS

---

## 📁 Project Structure

```
neurolingo-gem-canvas/
│
├── index.html                      # Main HTML file
│
├── styles/                         # CSS Stylesheets
│   ├── variables.css               # CSS custom properties (colors, theme)
│   ├── base.css                    # Base styles (body, containers)
│   ├── components.css              # Component styles (buttons, inputs, cards, tabs)
│   └── animations.css              # Animations & transitions (loader, screen transitions)
│
├── scripts/                        # JavaScript Modules (ES6)
│   ├── main.js                     # Application entry point & initialization
│   ├── config.js                   # Configuration (API keys, constants)
│   ├── supabase.js                 # Supabase client initialization
│   ├── auth.js                     # Authentication logic
│   ├── navigation.js               # Screen navigation management
│   ├── analyzer.js                 # Language analyzer core logic
│   ├── analyzer-renderer.js        # Analyzer results rendering
│   ├── scenarios.js                # Scenarios generator logic
│   ├── history.js                  # User history management
│   ├── tts.js                      # Text-to-speech functionality
│   ├── audio-utils.js              # Audio processing utilities (base64, PCM to WAV)
│   └── ui-helpers.js               # UI utility functions (copy, show/hide elements)
│
├── data/                           # Static Data
│   └── scenarios.js                # List of 26 real-life scenarios
│
└── README.md                       # Project documentation (this file)
```

---

## 🛠️ Technologies Used

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, flexbox, grid
- **Tailwind CSS** (CDN) - Utility-first styling
- **Vanilla JavaScript (ES6 Modules)** - Modular, clean code

### **Backend & APIs**
- **Supabase** - Authentication & database (PostgreSQL)
- **Google Gemini API 2.5 Flash** - AI text generation & TTS
  - Model: `gemini-2.5-flash-preview-05-20` (text generation)
  - Model: `gemini-2.5-flash-preview-tts` (text-to-speech)

### **External Libraries**
- **@supabase/supabase-js@2** (CDN) - Supabase client
- **Google Fonts** - Inter typeface

---

## 🚀 Setup Instructions

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/JacobAziz/Neurolingo_V1.git
cd Neurolingo_V1
```

### **Step 2: Configure API Keys**

#### **2.1 Create Configuration File**
1. Navigate to the `scripts/` directory
2. Copy `config.template.js` and rename it to `config.js`:
   ```bash
   cp scripts/config.template.js scripts/config.js
   ```
3. Open `scripts/config.js` in your editor

> **⚠️ Important:** The `config.js` file is git-ignored for security. Never commit API keys to version control!

#### **2.2 Supabase Setup**
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to **Settings → API**
4. Copy your **Project URL** and **anon/public key**
5. In `scripts/config.js`, update:
   ```javascript
   export const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_PROJECT_URL',  // Example: https://xxxxx.supabase.co
       anonKey: 'YOUR_SUPABASE_ANON_KEY'  // Starts with eyJhbGc...
   };
   ```

6. **Create Required Database Tables:**
   
   a. Create the analysis cache table:
   ```sql
   CREATE TABLE german_analysis (
       sentence TEXT PRIMARY KEY,
       analysis_data JSONB NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );
   ```
   
   b. Create the user history table (see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete setup):
   ```sql
   CREATE TABLE user_history (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       type TEXT NOT NULL CHECK (type IN ('analysis', 'scenario')),
       sentence TEXT,
       scenario_title TEXT,
       content JSONB NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   -- Plus indexes and RLS policies (see DATABASE_SETUP.md)
   ```

#### **2.3 Google Gemini API Setup**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. In `scripts/config.js`, update:
   ```javascript
   export const GEMINI_CONFIG = {
       apiKey: 'YOUR_GEMINI_API_KEY',  // Starts with AIzaSy...
       ttsModel: 'gemini-2.5-flash-preview-tts',
       genModel: 'gemini-2.5-pro'
   };
   ```

> **Note:** The app uses **Gemini 2.5 Pro** for text generation (analysis, scenarios, context suggestions) and **Gemini 2.5 Flash** for TTS (audio generation).

#### **2.4 Enable Google OAuth (Optional)**
1. In your Supabase project dashboard, go to **Authentication → Providers**
2. Enable **Google** provider
3. Follow Supabase's instructions to configure OAuth credentials
4. Add authorized redirect URLs in Google Cloud Console

### **Step 3: Run the Application**

#### **Option A: Using a Local Server (Recommended)**
Since the project uses ES6 modules, you need to run it on a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

#### **Option B: Using VS Code Live Server**
1. Install the "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 📚 Module Documentation

### **1. Configuration (`scripts/config.js`)**
Centralizes all configuration settings:
- Supabase credentials
- Gemini API keys & endpoints
- TTS voice options
- App constants (retry attempts, table names)

### **2. Supabase Client (`scripts/supabase.js`)**
- Initializes the Supabase client
- Exports a getter function for other modules to access the client

### **3. Authentication (`scripts/auth.js`)**
Handles all authentication flows:
- Email/password login & signup
- Google OAuth login
- Session management
- Auth state change listeners
- UI updates based on auth state

### **4. Navigation (`scripts/navigation.js`)**
Manages screen transitions:
- Three main screens: Selection, Analyzer, Scenarios
- Smooth fade transitions
- Prevents unnecessary re-renders

### **5. Language Analyzer (`scripts/analyzer.js`)**
Core analysis logic:
- Checks database cache first
- Calls Gemini API if not cached
- Saves results to database
- Retry logic with exponential backoff
- Complex JSON schema for structured analysis

### **6. Analyzer Renderer (`scripts/analyzer-renderer.js`)**
Renders analysis results:
- Tab management (Essential/Supporting, sub-tabs)
- Translation layers rendering
- Vocabulary table
- Structure analysis
- Deeper insights
- Linguistics nuggets
- Plug & Play phrases

### **7. Scenarios Generator (`scripts/scenarios.js`)**
Dialogue generation:
- Scenario selection
- AI context suggestions
- Dialogue generation with customizable format/length
- Renders speaker-based dialogue with TTS buttons
- Saves generated scenarios to user history

### **8. User History (`scripts/history.js`)**
History management:
- Loads user's previously analyzed sentences
- Loads user's previously generated scenarios
- Displays history in categorized tabs (Analyses/Scenarios)
- Allows viewing previous work (reopens in respective screen)
- Allows deleting history items
- Saves new analyses and scenarios to database
- All queries scoped to authenticated user

### **9. Text-to-Speech (`scripts/tts.js`)**
Audio functionality:
- Calls Gemini TTS API
- Converts base64 PCM to WAV
- Plays audio inline
- Downloads audio files
- Manages audio playback state

### **10. Audio Utilities (`scripts/audio-utils.js`)**
Low-level audio processing:
- Base64 to ArrayBuffer conversion
- PCM to WAV conversion
- WAV header generation

### **11. UI Helpers (`scripts/ui-helpers.js`)**
Common UI operations:
- Copy to clipboard with visual feedback
- Show/hide elements
- Error display management

---

## 🔌 API Integration

### **Gemini API - Text Generation**
**Model:** Gemini 2.5 Pro  
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent`

**Request Format:**
```json
{
  "contents": [{ "parts": [{ "text": "Analyze this sentence: ..." }] }],
  "systemInstruction": { "parts": [{ "text": "You are a German linguistics expert..." }] },
  "generationConfig": { "responseMimeType": "application/json" }
}
```

**Use Cases:**
- Language analysis
- Context suggestions
- Dialogue generation

### **Gemini API - Text-to-Speech**
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent`

**Request Format:**
```json
{
  "contents": [{ "parts": [{ "text": "Say this in German: ..." }] }],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": {
      "voiceConfig": { "prebuiltVoiceConfig": { "voiceName": "Gacrux" } }
    }
  }
}
```

**Response:** Returns base64-encoded PCM audio data

---

## 🗄️ Database Schema

### **Table: `german_analysis`**

| Column         | Type      | Description                          |
|----------------|-----------|--------------------------------------|
| `sentence`     | TEXT      | German sentence (PRIMARY KEY)        |
| `analysis_data`| JSONB     | Complete analysis result as JSON     |
| `created_at`   | TIMESTAMP | Auto-generated timestamp             |

**Purpose:** Cache for sentence analyses to avoid redundant API calls.

**Example `analysis_data` structure:**
```json
{
  "translation_layers": { "word_for_word": "...", "proper_translation": "..." },
  "vocab_breakdown": [{ "german_word": "...", "meaning": "...", "case_type": "...", "part_of_speech": "..." }],
  "structure_analysis": { "title": "...", "explanation": "...", "breakdown": [...] },
  "deeper_analysis": { "sentence_type": {...}, "verb_placement": {...}, ... },
  "linguistics_nuggets": { "untranslatable_particles": {...}, "reflexiveness": {...}, ... },
  "plug_and_play": [{ "german_phrase": "...", "english_meaning": "..." }]
}
```

### **Table: `user_history`**

| Column           | Type      | Description                                    |
|------------------|-----------|------------------------------------------------|
| `id`             | UUID      | Primary key (auto-generated)                   |
| `user_id`        | UUID      | Foreign key to auth.users                      |
| `type`           | TEXT      | 'analysis' or 'scenario'                       |
| `sentence`       | TEXT      | German sentence (for analysis type)            |
| `scenario_title` | TEXT      | Scenario title (for scenario type)             |
| `content`        | JSONB     | Complete analysis or scenario data             |
| `created_at`     | TIMESTAMP | Auto-generated timestamp                       |

**Purpose:** Stores user's personal history of analyzed sentences and generated scenarios.

**Security:** Row Level Security (RLS) enabled - users can only access their own records.

**Setup Instructions:** See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete SQL schema and setup guide.

---

## 🎨 Design System

### **Color Palette**
- **Primary Background:** `#0a192f` (Dark Navy)
- **Secondary Background:** `#112240` (Light Navy)
- **Accent:** `#64ffda` (Cyan)
- **Text:** `#a8b2d1` (Light Slate)

### **Typography**
- **Font Family:** Inter (Google Fonts)
- **Weights:** 400, 500, 600, 700, 800

### **Components**
- **Dark Cards:** Navy background with subtle borders
- **Primary Buttons:** Cyan background with hover lift effect
- **Secondary Buttons:** Outlined cyan with hover fill
- **Tabs:** Underline-style with cyan active state
- **Inputs:** Dark background with cyan focus ring

---

## 🐛 Troubleshooting

### **Issue: ES6 Module errors in browser**
**Solution:** Make sure you're running the app on a local server, not via `file://` protocol.

### **Issue: API calls failing**
**Solution:** 
1. Check that API keys are correctly set in `scripts/config.js`
2. Verify your Gemini API key has quota remaining
3. Check browser console for specific error messages

### **Issue: Supabase authentication not working**
**Solution:**
1. Verify Supabase URL and anon key are correct
2. Check that auth is enabled in your Supabase project
3. For Google OAuth, ensure redirect URLs are configured

### **Issue: TTS not playing audio**
**Solution:**
1. Ensure a voice is selected
2. Check browser console for audio errors
3. Some browsers require user interaction before playing audio

### **Issue: Server stops working**
**Solution:**
1. Check if the Python server is still running
2. Restart with: `python3 -m http.server 8000`
3. Make sure port 8000 is not being used by another application

---

## 📝 Code Style & Best Practices

This project follows clean code principles:

✅ **Modular Design** - Each module has a single responsibility  
✅ **ES6 Modules** - No global namespace pollution  
✅ **Code Block Marking** - Clear start/end comments for logic blocks  
✅ **Error Handling** - Try-catch blocks with retry logic  
✅ **Responsive Design** - Mobile-first with Tailwind utilities  
✅ **Accessibility** - Semantic HTML, ARIA labels  
✅ **No Duplication** - Reusable utilities and helpers  

---

## 🚧 Future Enhancements

Potential features for future development:
- [x] User progress tracking *(completed)*
- [x] Saved sentences and favorites *(completed)*
- [ ] Flashcard generation from analyzed sentences
- [ ] Speech recognition for pronunciation practice
- [ ] More language support (French, Spanish, etc.)
- [ ] Mobile app version
- [ ] Offline mode with service workers
- [ ] Gamification (streaks, achievements)

---

## 📄 License

This project is for educational purposes. Please ensure you comply with:
- Google Gemini API Terms of Service
- Supabase Terms of Service
- Tailwind CSS License (MIT)

---

## 👤 Author

**Aziz**  
German Language Learning Enthusiast

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for seamless authentication and database
- **Tailwind CSS** for rapid UI development
- **Inter Font** by Rasmus Andersson

---

**Happy Learning! 🎓🇩🇪**


