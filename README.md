# PixelPillaiyar 🕉️

> Divine wisdom, in pixel-perfect form

PixelPillaiyar is an AI-powered chatbot inspired by Lord Ganesha that provides philosophical guidance through both text and voice interactions. The application features a retro pixel art aesthetic and supports real-time voice conversations with an animated avatar.

[Demo Video](https://drive.google.com/file/d/1WtjRiEJyKnrNsNHh_yaJwjO67Cn_8rge/view)
## 🌟 Features

- **Voice-to-Voice Conversations**: Speak directly to the AI and receive audio responses
- **Real-time Audio Visualization**: Dynamic waveform display during voice recording
- **Animated Avatar**: 2D sprite-based character with talking animations
- **Retro UI Design**: 8-bit style interface with pixelated buttons and retro fonts
- **Dual Input Modes**: Switch between voice and text input seamlessly
- **Message History**: Semi-Persistent conversation tracking with audio playback
- **Responsive Design**: Works across desktop and mobile devices

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation and gesture library

### UI Components
- **Radix UI** - Headless UI primitives
- **Shadcn/ui** - Pre-built component library
- **Custom 8-bit Components** - Retro-styled UI elements
- **Press Start 2P Font** - Pixel-perfect typography

### Audio Processing
- **RecordRTC** - WebRTC-based audio recording
- **Web Audio API** - Real-time audio visualization
- **MediaStream API** - Microphone access and processing

### AI & APIs
- **OpenAI GPT-4o-mini** - Text generation and conversation
- **OpenAI Whisper** - Speech-to-Text transcription
- **OpenAI TTS** - Text-to-Speech synthesis
- **Edge Runtime** - Optimized API performance

## 📁 Project Structure

```
pixel-pillaiyar/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transcribe/     # Speech-to-Text endpoint
│   │   │   └── speak/          # Text-to-Speech endpoint
│   │   ├── talk/               # Main chat interface
│   │   ├── layout.tsx          # Root layout with fonts
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles & themes
│   └── components/
│       ├── ui/
│       │   ├── 8bit/           # Custom retro components
│       │   └── [shadcn]/       # Standard UI components
│       ├── AudioWaveform.tsx   # Real-time audio visualization
│       └── Navbar.tsx          # Navigation component
├── public/
│   ├── sprites/                # Character animation assets
│   ├── RecordRTC.js           # Audio recording library
│   └── bg_removed.jpg         # Background image
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/zapds/pixel-pillaiyar.git
cd pixel-pillaiyar
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Core Workflow

### 1. Voice Input Pipeline
```
User speaks → RecordRTC captures → WebM audio → /api/transcribe → OpenAI Whisper → Text
```

### 2. AI Processing
```
Transcribed text → OpenAI GPT-4o-mini → Philosophical response
```

### 3. Voice Output Pipeline
```
AI response → /api/speak → OpenAI TTS (ballad voice) → MP3 audio → Auto-play
```

### 4. Avatar Animation
```
Voice activity → Character state (neutral ↔ talking) → Sprite switching (250ms intervals)
```

## 🎨 UI Components

### Custom 8-bit Button System
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- **Fonts**: normal, retro (Press Start 2P)
- **Effects**: Pixelated borders, shadows, active state animations

### Animation Features
- **Drag Interactions**: Mic button with gesture controls
- **Visual Feedback**: Real-time audio waveforms
- **State Transitions**: Smooth mode switching
- **Responsive Gestures**: Touch-friendly drag zones

## 📡 API Endpoints

### `/api/transcribe` (POST)
**Purpose**: Convert audio to text
- **Input**: FormData with audio file (WebM format)
- **Processing**: OpenAI Whisper (gpt-4o-mini-transcribe)
- **Output**: JSON with transcribed text
- **Runtime**: Edge

### `/api/speak` (POST)
**Purpose**: Convert text to speech
- **Input**: JSON with text string
- **Processing**: OpenAI TTS (gpt-4o-mini-tts, ballad voice)
- **Output**: MP3 audio buffer
- **Runtime**: Edge

## 🎭 Character System

### Sprite Management
- **Assets**: PNG sprites with transparent backgrounds
- **States**: neutral, talking, happy, sad, angry
- **Animation**: Frame-based switching during conversation
- **Positioning**: Centered avatar with responsive scaling

### Animation Logic
```typescript
// Talking animation cycle
if (state === "talking") {
  interval = setInterval(() => {
    setFrame(prev => prev === "neutral" ? "talking" : "neutral");
  }, 250); // 4 FPS animation
}
```

## 🔊 Audio Features

### Recording Capabilities
- **Format**: WebM audio with Opus codec
- **Quality**: Optimized for speech recognition
- **Duration**: Unlimited recording with real-time feedback
- **Controls**: Drag-based gesture interface

### Visualization
- **Real-time Waveform**: Canvas-based audio analysis
- **Visual Feedback**: Dynamic amplitude display
- **Responsive Design**: Scales across device sizes

## 🎨 Design System

### Typography
- **Primary**: Press Start 2P (pixel font)
- **Fallback**: System fonts for readability
- **Responsive**: Scales appropriately across devices

### Environment Variables
Ensure the following are set in your deployment platform:
- `OPENAI_API_KEY`


### Authors
- [Narendhar T S (EC24B1053)](https://github.com/zapds/) carry dev
- Vishwanth V (ME24B2012) existed
- Harshith (EC24B1077) ahn valthukal valthukal
