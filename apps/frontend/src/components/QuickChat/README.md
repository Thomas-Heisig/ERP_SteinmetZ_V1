# UnifiedQuickChat

Unified AI assistant chat component for ERP SteinmetZ - merged from QuickChat and QuickChatAlt.

## 🏗️ Architecture

- **UnifiedQuickChat.tsx** - Main component with UI (444 lines)
- **UnifiedQuickChatContext.tsx** - State management and API integration (456 lines)
- **UnifiedQuickChatTypes.ts** - TypeScript type definitions (187 lines)
- **UnifiedQuickChat.module.css** - Component styles (752 lines)
- **index.ts** - Public exports

## ✨ Features

✅ **Modern Design** - Glassmorphism with dark mode support  
✅ **Full TypeScript** - 0 `any` types, strict mode compliant  
✅ **CSS Modules** - 0 inline styles, scoped styling  
✅ **Backend Integration** - Connected to `/api/ai/*` endpoints  
✅ **Command System** - Slash commands with autocomplete  
✅ **Keyboard Navigation** - Arrow keys, Tab, Enter, Escape, Ctrl+Enter  
✅ **Multi-Session** - Create, switch, and manage chat sessions  
✅ **Model Selection** - Switch between AI models and providers  
✅ **ARIA Compliant** - Accessible for screen readers  
✅ **Responsive** - Mobile, tablet, and desktop support  
✅ **Animations** - Smooth transitions and loading states

## 📦 Usage

```tsx
import {
  UnifiedQuickChat,
  UnifiedQuickChatProvider,
} from "./components/QuickChat";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <UnifiedQuickChatProvider>
      <UnifiedQuickChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </UnifiedQuickChatProvider>
  );
}
```

## 🎮 Commands

| Command     | Description          | Category |
| ----------- | -------------------- | -------- |
| `/rechnung` | Rechnung erstellen   | ERP      |
| `/angebot`  | Angebot erstellen    | ERP      |
| `/bericht`  | Bericht generieren   | Reports  |
| `/idee`     | Idee parken          | Notes    |
| `/termin`   | Termin erstellen     | Calendar |
| `/suche`    | Im System suchen     | Search   |
| `/hilfe`    | Hilfe anzeigen       | System   |
| `/new`      | Neue Session starten | System   |
| `/clear`    | Nachrichten löschen  | System   |

### Command Usage

1. Type `/` to trigger autocomplete
2. Use `ArrowUp`/`ArrowDown` to navigate commands
3. Press `Tab` or `Enter` to select
4. Press `Escape` to cancel
5. Press `Ctrl+Enter` to send message

## 🔌 API Endpoints

```typescript
// Sessions
GET    /api/ai/sessions              // List all sessions
POST   /api/ai/sessions              // Create new session
GET    /api/ai/sessions/:id          // Load specific session
DELETE /api/ai/sessions/:id          // Delete session
POST   /api/ai/sessions/:id/messages // Send message

// Models & Providers
GET    /api/ai/models                // Available models
GET    /api/ai/providers             // Provider status

// Settings & Status
PUT    /api/ai/settings              // Update settings
GET    /api/ai/system/status         // System health
```

## 🎨 Theming

The component supports the following themes via `data-theme` attribute:

- `light` (default)
- `dark`
- `lcars`
- `contrast`

Styles are applied through CSS variables and automatically adapt based on the theme.

## ⌨️ Keyboard Shortcuts

| Shortcut                | Action                       |
| ----------------------- | ---------------------------- |
| `/`                     | Trigger command autocomplete |
| `ArrowUp` / `ArrowDown` | Navigate commands            |
| `Tab` / `Enter`         | Select command               |
| `Escape`                | Clear input or close menu    |
| `Ctrl+Enter`            | Send message                 |

## 📊 Tabs

1. **💬 Chat** - Main conversation interface
2. **📁 Sessions** - Manage chat sessions
3. **🤖 Modelle** - View available AI models
4. **⚙️ Einstellungen** - Configure settings
5. **ℹ️ Info** - System information

## 🧪 TypeScript Types

### Core Types

```typescript
// Message roles
type MessageRole = "system" | "user" | "assistant";

// AI providers
type ChatProvider =
  | "openai"
  | "anthropic"
  | "local"
  | "ollama"
  | "azure"
  | "custom";

// Tab names
type TabName = "chat" | "sessions" | "models" | "settings" | "info";

// Chat message
interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  command?: string;
  commandResult?: string;
  toolCalls?: ToolCall[];
}

// Chat session
interface ChatSession {
  id: string;
  title: string;
  model: string;
  provider: ChatProvider;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// AI model
interface AIModel {
  id: string;
  name: string;
  provider: ChatProvider;
  description: string;
  maxTokens: number;
  available: boolean;
}

// Settings
interface Settings {
  defaultModel: string;
  defaultProvider: ChatProvider;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  soundEnabled: boolean;
  theme: "light" | "dark" | "lcars" | "contrast";
}
```

## 🔧 Context API

### Provider

```tsx
<UnifiedQuickChatProvider>{/* Your app */}</UnifiedQuickChatProvider>
```

### Hook

```tsx
const {
  sessions,
  currentSession,
  models,
  settings,
  loading,
  error,
  createSession,
  loadSessions,
  selectSession,
  deleteSession,
  sendMessage,
  streamMessage,
  loadModels,
  getProviders,
  updateSettings,
  getSystemStatus,
  clearError,
} = useUnifiedQuickChat();
```

## 🎯 Component Props

```typescript
interface UnifiedQuickChatProps {
  isOpen: boolean; // Dialog visibility
  onClose: () => void; // Close handler
}
```

## 🚀 Performance

- **Memoized filtering** - Command list filtered with `useMemo`
- **Callback optimization** - Event handlers wrapped in `useCallback`
- **Auto-scroll** - Smooth scroll to latest message with `useEffect`
- **Abort controllers** - Request cancellation on unmount
- **CSS animations** - GPU-accelerated transforms

## 🛡️ Error Handling

- API call timeouts (30 seconds)
- Network error messages
- User-friendly error banner
- Dismissible error notifications
- Console logging for debugging

## 🧩 Migration from Old QuickChat

### Removed Files

- ❌ `QuickChat.tsx` (old component)
- ❌ `QuickChat.css` (inline styles)
- ❌ `hooks.ts` (many `any` types)
- ❌ `types.ts` (incomplete types)
- ❌ `constants.ts` (unused)
- ❌ `components/` folder (sub-components)

### New Structure

- ✅ `UnifiedQuickChat.tsx` - Single file component
- ✅ `UnifiedQuickChat.module.css` - CSS Modules
- ✅ `UnifiedQuickChatContext.tsx` - Context provider
- ✅ `UnifiedQuickChatTypes.ts` - Complete types
- ✅ `index.ts` - Barrel exports

### Breaking Changes

**Old Import:**

```tsx
import QuickChat from "./components/QuickChat";
```

**New Import:**

```tsx
import {
  UnifiedQuickChat,
  UnifiedQuickChatProvider,
} from "./components/QuickChat";
```

**Old Usage:**

```tsx
<QuickChat isOpen={isOpen} onClose={onClose} />
```

**New Usage:**

```tsx
<UnifiedQuickChatProvider>
  <UnifiedQuickChat isOpen={isOpen} onClose={onClose} />
</UnifiedQuickChatProvider>
```

## 📝 Known Issues

### ESLint Warnings

**File:** `UnifiedQuickChat.tsx`  
**Lines:** 232, 356  
**Issue:** `aria-selected="{expression}"` - Invalid ARIA attribute value  
**Status:** False positive - Code is correct, ESLint limitation with jsx-a11y plugin  
**Workaround:** Applied object spread pattern with const assertions

### Fast Refresh Warning

**File:** `UnifiedQuickChatContext.tsx`  
**Line:** 103  
**Issue:** "Fast refresh only works when a file only exports components"  
**Status:** Acceptable - Standard pattern for Context files with hooks  
**Impact:** No runtime issues, only affects HMR during development

## 🧪 Testing

```bash
# Run TypeScript check
npm run type-check

# Run ESLint
npm run lint

# Build project
npm run build
```

## 📄 License

SPDX-License-Identifier: MIT
