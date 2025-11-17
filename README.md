# React Internal Chat

A modern ChatGPT-style chat interface built with React, TypeScript, Tailwind CSS v4, and Supabase. Features real-time messaging, chain-of-thought display, and seamless N8N webhook integration.

## Features

- **Real-time Messaging** - Supabase real-time subscriptions for instant message updates
- **N8N Webhook Integration** - Messages route through N8N webhooks for agent processing
- **Chain-of-Thought Display** - Visual grouping of agent reasoning steps with amber-themed UI
- **Streaming Animations** - Character-by-character text reveal for agent responses
- **Session Management** - Auto-generated session titles from first message (40 char truncation)
- **Markdown Support** - Full markdown to HTML conversion with syntax highlighting
- **Dark Mode** - Complete dark mode support throughout the interface
- **Dynamic Thinking Indicator** - 40+ rotating playful messages during agent processing
- **Modern UI** - Built with Tailwind CSS v4 and Framer Motion animations

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Production version with @tailwindcss/vite plugin
- **Framer Motion** - Animation library
- **Supabase** - PostgreSQL database with real-time subscriptions
- **shadcn/ui** - UI component system
- **marked** - Markdown to HTML conversion
- **Lucide React** - Icon library

## Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  content_html TEXT,
  type TEXT DEFAULT 'message' CHECK (type IN ('message', 'system', 'error', 'tool', 'function')),
  final BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Setup

1. **Clone the repository**
```bash
git clone git@github.com:DanielRSnell/react-internal-chat.git
cd react-internal-chat
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

4. **Set up the database**

Run the SQL scripts in your Supabase SQL editor:
```bash
# Initial schema
psql < setup.sql

# Additional columns for chain-of-thought
psql < update.sql
```

5. **Start the development server**
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   └── chat/
│       ├── ChatInterface.tsx      # Main container component
│       ├── ChatSidebar.tsx        # Session list sidebar
│       ├── ChatMessages.tsx       # Message list with grouping logic
│       ├── ChatMessage.tsx        # Individual message component
│       ├── ChatInput.tsx          # Message input field
│       └── ThinkingIndicator.tsx  # Loading state component
├── lib/
│   ├── supabase.ts               # Supabase client & types
│   ├── markdown.ts               # Markdown to HTML conversion
│   └── utils.ts                  # Utility functions
├── services/
│   └── webhookService.ts         # N8N webhook integration
└── styles/
    └── global.css                # Global styles & Tailwind imports
```

## Key Features Explained

### Chain-of-Thought Display

Messages with `final: false` are automatically grouped into chain-of-thought sections with:
- Amber-themed visual styling
- Lightbulb icon indicator
- Step count display
- Compact message layout

### Streaming Animation

Agent messages animate character-by-character with:
- Adaptive speed based on message length
- Blinking cursor during streaming
- One-time animation per message
- Smooth scrolling during animation

### Session Management

- Auto-created on first message
- Title generated from first message (40 char max)
- Sorted by last updated time
- Delete functionality with confirmation

### Message Flow

1. User types message in ChatInput
2. Message sent to N8N webhook via `webhookService.ts`
3. N8N processes and inserts messages to Supabase
4. Supabase real-time subscription pushes updates to UI
5. Messages animate and display in ChatMessages

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_N8N_WEBHOOK_URL` | Your N8N webhook endpoint URL |

## License

MIT

## Credits

Built with Claude Code
