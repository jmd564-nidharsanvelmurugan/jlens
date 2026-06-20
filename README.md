# Jlens-4o Frontend

Modern React-based frontend for the Jlens AI chatbot platform with document query, general chat, workspace management, and advanced chart rendering.

**Production URL**: https://jlens4o.jmangroup.tech  
**Status**: Production Ready (243 files)  
**Port**: 3000

## Features

- **General Chat**: Conversational AI with streaming responses
- **Document Query**: RAG-based document search and Q&A
- **Workspace Management**: System, Own, and Shared workspaces with color coding
- **Multi-Model Support**: Switch between GPT-4, GPT-3.5, and custom models
- **Microsoft SSO**: Azure AD authentication
- **File Upload**: Drag & drop document upload to Azure Blob Storage
- **Advanced Charts**: 6 chart types with Python-to-JSON auto-converter
- **Interactive Documentation**: Built-in documentation with tabbed interface
- **Tour Guide**: Interactive onboarding system
- **Dark/Light Mode**: Theme switching support
- **Responsive Design**: Mobile, tablet, and desktop optimized

## Architecture

```
jlens-4o/frontend/
├── apps/jlens/                 # Main application
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── sidebar/        # Sidebar navigation
│   │   │   ├── chat-area/      # Chat interface
│   │   │   ├── header/         # Top header
│   │   │   ├── workspaces/     # Workspace UI
│   │   │   ├── tour/           # Tour guide
│   │   │   └── common/         # Shared components
│   │   ├── pages/              # Page components
│   │   │   ├── home/           # Main chat page
│   │   │   ├── settings/       # Settings page
│   │   │   ├── welcome/        # Welcome page
│   │   │   └── features/       # Documentation
│   │   ├── context/            # React contexts
│   │   │   ├── UserContext     # User state
│   │   │   ├── ModelContext    # Model selection
│   │   │   ├── WorkspaceContext# Workspace state
│   │   │   └── ConversationContext # Chat state
│   │   ├── store/              # Zustand stores
│   │   ├── routes/             # Routing config
│   │   ├── auth/               # Auth components
│   │   ├── hooks/              # Custom hooks
│   │   └── lib/                # Utilities
│   └── public/                 # Static assets
└── packages/                   # Shared packages
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite + Turborepo
- **Styling**: Tailwind CSS
- **State**: React Context + Zustand
- **Routing**: React Router v6
- **HTTP**: Axios
- **Auth**: Microsoft MSAL
- **UI**: Custom components + Radix UI
- **Icons**: Lucide React
- **Charts**: Chart.js + Custom renderer
- **Markdown**: React Markdown + Syntax highlighting

## Prerequisites

- Node.js 18+
- npm 9+
- Microsoft Azure AD app registration
- Backend API running (Tenali-AI-AZ)

## Frontend Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd jlens-4o/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cd apps/jlens
cp .env.example .env
# Edit .env with your configuration values
```

### 4. Configure Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Microsoft SSO Configuration
VITE_MSAL_CLIENT_ID=your-azure-app-client-id
VITE_MSAL_TENANT_ID=your-azure-tenant-id
VITE_MSAL_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access Application
```
http://localhost:3000
```

### 7. Verify Installation
- Frontend should load on port 3000
- Microsoft SSO should redirect properly
- API calls should connect to backend on port 8000
- Check browser console for any errors

## Configuration

### Environment Variables (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Microsoft SSO Configuration
VITE_MSAL_CLIENT_ID=your-azure-app-client-id
VITE_MSAL_TENANT_ID=your-azure-tenant-id
VITE_MSAL_REDIRECT_URI=http://localhost:3000/auth/callback

# Optional: Additional API endpoints
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
```

### Microsoft Azure AD Setup

1. **Register Application** in Azure AD
2. **Configure Redirect URIs**:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
3. **Enable Implicit Grant**: ID tokens and Access tokens
4. **Set API Permissions**: User.Read (Microsoft Graph)

## Key Features & Components

### Sidebar Navigation
- **Workspace List**: Color-coded by type (System/Own/Shared)
- **Folder Organization**: Colored icons matching workspace type
- **File Management**: Gray icons for files
- **Profile Section**: Help dropdown with Tour Guide + Documentation
- **New Chat Button**: Create conversations

### Chat Interface
- **Message Streaming**: Real-time AI responses
- **Chart Rendering**: 6 chart types (bar, horizontal-bar, line, pie, donut, area)
- **Python Converter**: Auto-converts matplotlib code to JSON
- **Enhanced Markdown**: Tables, code blocks, syntax highlighting
- **Message History**: Conversation persistence

### Workspace Management
- **System Workspaces**: Pre-configured templates (#19105B)
- **Own Workspaces**: User-created (#A16BDB - Amethyst)
- **Shared Workspaces**: Shared with others (#FF6196 - Rose)
- **File Upload**: Drag & drop with Azure Blob Storage
- **Folder Organization**: Hierarchical structure
- **Sharing**: Share with view/edit/admin permissions

### Header Controls
- **Model Selector**: Switch between AI models
- **Chat Type Toggle**: General / Document Query
- **Workspace Selector**: Quick workspace switching

### Advanced Features
- **Interactive Documentation**: Tabbed interface with guides
- **Tour Guide System**: Step-by-step onboarding
- **Conversation Titles**: Auto-generated from first 50 chars
- **Chart System**: JSON-based with 6 types + Python fallback

## Authentication Flow

### Microsoft SSO
1. User clicks "Sign in with Microsoft"
2. Redirects to Microsoft login
3. Returns to `/auth/callback`
4. Exchanges token with backend
5. Stores JWT in sessionStorage
6. Redirects to `/app/chat`

### Session Management
- JWT tokens stored in sessionStorage
- Automatic token refresh
- Protected routes with authentication guards

## State Management

### Context Providers

**ModelContext** (`src/context/ModelContext.tsx`)
```typescript
{
  selectedModel: Model | null
  availableModels: Model[]
  chatType: "General" | "Document Query"
  setSelectedModel: (model: Model) => void
  setChatType: (type: string) => void
}
```

**WorkspaceContext** (`src/context/WorkspaceContext.tsx`)
```typescript
{
  workspaces: Workspace[]
  selectedWorkspace: Workspace | null
  workspaceType: "system" | "own" | "shared"
  setSelectedWorkspace: (workspace: Workspace) => void
}
```

**ConversationContext** (`src/context/ConversationContext.tsx`)
```typescript
{
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  createConversation: () => void
  sendMessage: (text: string) => void
}
```

**UserContext** (`src/context/UserContext.tsx`)
```typescript
{
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials) => void
  logout: () => void
}
```

## Routing

### Route Structure
```typescript
/                           # Redirects to /welcome or /
/welcome                    # Welcome/login page
/auth/callback             # Microsoft SSO callback
/                          # Main chat interface (protected)
/settings                  # Settings page (protected)
/features/documentation    # Documentation page (protected)
```

### Route Protection
- **Public Routes**: `/welcome`, `/auth/callback`
- **Protected Routes**: All others require authentication
- **Auto-redirect**: Unauthenticated users → `/welcome`

## Color Scheme & Styling

### Workspace Colors
- **System**: `#19105B` (Deep Purple) - Pre-configured templates
- **Own**: `#A16BDB` (Amethyst) - User-created workspaces
- **Shared**: `#FF6196` (Rose) - Shared workspaces

### Tailwind Classes
```css
/* Workspace Tags */
.workspace-system { @apply bg-[#19105B] text-white; }
.workspace-own { @apply bg-[#A16BDB] text-white; }
.workspace-shared { @apply bg-[#FF6196] text-white; }

/* Folder Icons */
.folder-system { @apply text-[#19105B]; }
.folder-own { @apply text-[#A16BDB]; }
.folder-shared { @apply text-[#FF6196]; }

/* File Icons */
.file-icon { @apply text-gray-500; }

/* Sidebar */
.sidebar { @apply bg-white dark:bg-gray-900; }

/* Buttons */
.btn-primary { @apply bg-purple-600 hover:bg-purple-700; }
```

### Theme Support
- Light mode: White backgrounds, dark text
- Dark mode: Gray-900 backgrounds, light text
- Automatic theme detection
- Manual theme toggle

## Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column, collapsible sidebar)
- **Tablet**: 768px - 1024px (optimized layout)
- **Desktop**: > 1024px (full sidebar, multi-column)

### Mobile Optimizations
- Touch-friendly interface
- Swipe gestures for sidebar
- Responsive chat interface
- Mobile file upload
- Optimized chart rendering

## Build & Deployment

### Development
```bash
cd frontend
npm install
cd apps/jlens
npm run dev              # Start dev server (port 3000)
```

### Production Build
```bash
cd apps/jlens
npm run build            # Build for production
npm run preview          # Preview production build
```

### Docker Deployment
```bash
# Build image
docker build -t jlens-frontend:latest .

# Run container
docker run -d -p 80:80 jlens-frontend:latest
```

### Docker Compose
```bash
# From project root
docker-compose up -d
```

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [static files]
```

## Testing

```bash
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run lint              # ESLint
npm run type-check        # TypeScript check
```

## Troubleshooting

### Common Issues

**CORS Errors**
- Check backend CORS configuration
- Verify `VITE_API_URL` in .env

**Microsoft SSO Issues**
- Verify Azure AD app configuration
- Check redirect URIs match exactly
- Validate `VITE_MSAL_CLIENT_ID` and `VITE_MSAL_TENANT_ID`

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .turbo dist`
- Check TypeScript errors: `npm run type-check`

**Chart Not Rendering**
- Verify JSON format matches chart schema
- Check Python converter for matplotlib code
- Review browser console for errors

### Debug Mode
```bash
VITE_DEBUG=true npm run dev
```

## Key Files

### Components
- `src/components/sidebar/index.tsx` - Main sidebar
- `src/components/chat-area/index.tsx` - Chat interface
- `src/components/chat-area/chart-renderer.tsx` - Chart system
- `src/components/chat-area/enhanced-markdown.tsx` - Markdown renderer
- `src/pages/features/documentation/index.tsx` - Documentation page

### Context
- `src/context/ModelContext.tsx` - Model state (chatType: "General")
- `src/context/WorkspaceContext.tsx` - Workspace state
- `src/context/ConversationContext.tsx` - Chat state
- `src/context/UserContext.tsx` - User state

### Utilities
- `src/lib/python-to-chart-converter.ts` - Python to JSON converter
- `src/hooks/useRandomBackground.ts` - Random background hook

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes with TypeScript strict mode
4. Run tests and linting
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component documentation

## License

MIT License - see LICENSE file for details.

## Support

- Create an issue in the repository
- Check `/features/documentation` in the app
- Review Q session context files in `q-session/`

## Related

- **Backend**: Tenali-AI-AZ (FastAPI)
- **Production**: https://jlens4o.jmangroup.tech
- **API Docs**: https://api-url/docs
