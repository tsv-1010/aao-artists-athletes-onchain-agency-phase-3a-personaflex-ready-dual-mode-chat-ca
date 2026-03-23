# AAO (Artists & Athletes Onchain Agency) Phase 3A: PersonaFlex Ready Dual Mode Chat + Call Interface

## Overview
A professional onboarding platform for artists, athletes, and brands with identity verification, consent management, AI-powered chat onboarding capabilities, external Mistral API integration for enhanced AI responses, and dual-mode chat + call interface for text and voice interactions.

## Authentication
- Internet Identity integration for all user authentication
- Users authenticate before accessing any application features
- Landing page must display visible and functional "Get Started" and "Join AAO" buttons when user is not authenticated
- Both authentication buttons must directly call the `login()` function from `useInternetIdentity.ts` with proper onClick handlers
- Authentication buttons must include loading states with spinner or "Authenticating…" text during login process
- Authentication buttons must include error handling with user-friendly messages ("Login failed, please try again")
- Authentication buttons should only render when user is not signed in
- Dashboard route guards in `App.tsx` must wait for Internet Identity provider to fully initialize before performing authentication checks or redirects
- Error handling must display user-friendly messages on authentication failure instead of looping or showing blank screens
- Prevent automatic transitions from Landing Page to Dashboard until user is properly authenticated
- Clean up stale redirects and ensure authentication state is properly managed
- Successful authentication automatically redirects to `/dashboard` without flickering or redirect loops
- Global authentication state updates immediately upon successful login
- Repeated authentication attempts must be handled gracefully
- Logged-in users must skip the landing page automatically and go directly to dashboard
- Header logout functionality must properly reset authentication state and return users to the landing page
- Authentication flow must work smoothly on both desktop and mobile devices
- Route guarding must prevent unauthenticated users from accessing dashboard
- UI must be responsive across all device sizes during authentication transitions
- Authentication buttons must be properly styled to align with AAO design theme (neutral color scheme, centered hero layout) and responsive layout
- Authentication buttons must be positioned correctly in the centered hero layout and remain functional on mobile devices

## User Roles & Onboarding
- Three distinct user roles: Artist, Athlete, Brand
- Role selection during initial onboarding process
- Profile creation form collecting:
  - Full name
  - Profession/specialty
  - Bio description
  - Social media links
- Clean, professional onboarding flow with role-specific guidance

## Soulbound Token (SBT) System
- Generate non-transferable verification tokens upon user registration
- Each SBT linked to user's Internet Identity principal
- SBT contains role verification and basic profile metadata
- Display verification status on user dashboard

## Consent Ledger
- Backend storage of user consent records including:
  - User role and profile metadata
  - Signed consent statements for data usage
  - Matching permissions preferences
  - Ownership verification hashes
- Immutable consent history tracking
- User ability to view consent history
- User ability to update consent preferences

## DeAI Chat Onboarding System
- "DeAI Chat Onboarding" tab in authenticated user dashboard
- Role-specific structured question sequences with multi-step conversational logic
- AAO DeAI Guide using AAO.png as the official avatar thumbnail across all chat interfaces
- Distinct onboarding flows for each user role:
  - **Artists**: Creative disciplines, artistic style, portfolio details, collaboration preferences, personal brand development, and career goals
  - **Athletes**: Sport disciplines, training philosophy, personal narrative, sponsorship experience, and off-field ambitions
  - **Brands**: Target audience demographics, campaign objectives, partnership history, brand voice characteristics, and social impact interests
- Multi-step conversational logic with follow-up questions based on previous answers
- Chat messages displayed in conversational bubbles with timestamps
- Consent confirmation modal before initiating chat interactions
- Modal references existing consent ledger data for user confirmation
- "Ask Mistral" button for triggering external AI inference
- Loading feedback display ("AAO DeAI is thinking…") during API calls
- Real-time rendering of Mistral-generated responses in chat interface
- Structured data collection and summarized display of collected answers after completion

## Dual-Mode Chat + Call Interface
- New `DualModeOnboardingSection.tsx` component providing text and voice interaction capabilities
- Chat interface with bottom input bar for text messages
- Phone icon toggle button for Start/End Call functionality
- Circular "listening/speaking" visualizer (SVG or canvas animation) that activates during mock voice interactions
- Camera component integration for microphone permission handling (no real-time streaming)
- Mock voice recording simulation with dummy audio file upload via blob storage
- AI activity animations during simulated voice processing
- Placeholder chat transcripts appended to visible chat log during voice interactions
- All voice functionality is frontend-only with mocked responses and local state management

## PersonaFlex Settings Integration
- `PersonaFlexSettingsModal.tsx` component mirroring existing Mistral settings modal
- Runtime configuration of PersonaFlex STT/TTS endpoint base URL
- Optional API key configuration
- Settings stored in localStorage for persistence
- Clean configuration interface matching existing AAO design patterns

## Right-Side Collapsible Panel
- Collapsible panel with three sections: "Opportunities," "Active Matches," and "Session Summaries"
- Tailwind CSS transitions for smooth resizing and hiding animations
- Panel can be collapsed/expanded to optimize screen real estate
- Content sections display relevant user data and interaction history

## Mistral API Integration
- Backend HTTP outcalls to external Mistral REST API endpoint
- Configurable Mistral API base URL and authentication
- Asynchronous API calls triggered by user chat interactions
- Response processing and storage linked to chat sessions
- Error handling for failed API requests
- Admin settings panel for API configuration (client-side storage for testing)

## Chat Session Management
- Backend storage of chat sessions with enhanced ChatSession data type including:
  - User role and session ID
  - Message exchanges with timestamps
  - Consent reference linking
  - Role-specific structured onboarding data collection
  - `inferenceResponse` field for storing Mistral API responses
  - `inferenceStatus` field tracking API call status ("pending", "success", "failed")
  - Placeholder fields for future embeddings and DeAI metadata
- Session storage and retrieval APIs for authenticated users
- Persistent message storage using blob storage
- "Session Summary" view displaying stored messages, timestamps, structured onboarding data, and inference metadata
- Summary view accessible after chat onboarding completion
- Inference metadata display including timestamp and token usage summary

## Dashboard Interface
Role-specific dashboard views with enhanced DeAI Chat tab and dual-mode interface:

### Artists & Athletes Dashboard
- "My Profile" section showing profile information and edit capabilities
- "My Consents" section displaying current consent settings and history
- "Verification Status" showing SBT status and verification level
- "DeAI Chat Onboarding" tab with role-specific structured question flows, Mistral integration, and dual-mode chat + call interface

### Brands Dashboard
- "Create Brief" section (disabled/placeholder for future phase)
- Basic profile management
- Consent management interface
- "DeAI Chat Onboarding" tab with brand-specific structured question flows, Mistral integration, and dual-mode chat + call interface

## Landing Page Authentication
- Landing page must display visible and functional "Get Started" and "Join AAO" buttons when user is not authenticated
- Both authentication buttons must directly call the `login()` function from `useInternetIdentity.ts` with properly connected onClick handlers
- Authentication buttons must include loading states with spinner or "Authenticating…" text feedback during login process
- Authentication buttons must include error handling with user-friendly messages like "Login failed, please try again"
- Authentication buttons must be responsive and functional on both desktop and mobile devices
- Authentication buttons must be properly styled to align with AAO design theme (neutral color scheme, centered hero layout) and responsive layout
- Successful authentication updates global authentication state and redirects to `/dashboard`
- Authentication flow must be smooth without silent failures or non-responsive button clicks
- Unauthenticated users must remain on the landing page with dashboard access blocked
- Authentication state changes must be handled without page flicker or reload loops
- Prevent automatic transitions from Landing Page to Dashboard until user is properly authenticated
- Error handling must display user-friendly messages on authentication failure
- Logout functionality must correctly clear the session and return the user to the landing page

## Routing & Navigation
- Proper React Router setup with BrowserRouter or HashRouter wrapping
- Default route (`/`) displays LandingPage for unauthenticated users
- Authenticated users automatically redirect to `/dashboard` route after successful login
- Fallback route (`*`) redirects to `/` to prevent "Not Found" errors
- Route guards that check authentication status and prevent unauthorized dashboard access
- Route guards in `App.tsx` must wait for Internet Identity provider to fully initialize before performing authentication checks
- Authentication-based conditional routing logic with proper state management to prevent infinite redirect loops
- Smooth transitions between landing, onboarding, and dashboard without flickering
- Header logout functionality that properly resets state and returns to landing page
- Responsive navigation that works correctly on both desktop and mobile devices
- Authentication state verification that prevents repeated re-renders and loading loops
- Clean up stale redirects and ensure proper authentication flow management

## Admin Settings
- Settings panel for configuring Mistral API integration
- PersonaFlex settings panel for STT/TTS endpoint configuration
- Mistral API base URL configuration
- Authentication key management (stored securely client-side for testing)
- API connection testing capabilities

## Data Storage
Backend must store:
- User profiles with role assignments
- Consent records and preferences
- SBT metadata and verification status
- User session and authentication state
- Enhanced chat sessions with messages, timestamps, role-specific structured onboarding data, inference responses, and status metadata
- Session summaries and chat completion status
- Mistral API response data and inference metadata

## UI/UX Requirements
- Fully responsive design that works smoothly on desktop and mobile devices
- Professional, minimalistic styling matching existing AAO aesthetic
- Soft grey background with clean typography
- Neutral color palette appropriate for business use
- Role-aware interface elements
- Clear navigation between dashboard sections
- Conversational chat bubble interface with AAO.png as the DeAI Guide avatar thumbnail
- Loading states and timestamped message display with inference metadata
- Modal dialogs for consent confirmation and settings configuration
- Settings panel with clean configuration interface
- Loading indicators for API calls
- Structured display of collected onboarding data in summary format
- Smooth Tailwind CSS transitions for collapsible panel animations
- Circular visualizer animations for voice interaction feedback
- Subtle animations limited to CSS and React state management
- Consistent button styling across landing page authentication elements with proper AAO design theme alignment (neutral color scheme, centered hero layout)
- Responsive authentication buttons that work properly on all device sizes and remain positioned correctly in centered hero layout
- User-friendly error messages for authentication failures with loading states and feedback (spinner or "Authenticating…" text)
- Authentication buttons must be visible and functional with proper styling and positioning

## Technical Requirements
- Motoko backend canister for identity, consent, chat session management, and HTTP outcalls
- React frontend with properly functioning Internet Identity integration
- Authentication triggers in landing page components that directly call the `login()` function from `useInternetIdentity.ts`
- Authentication buttons with loading states (spinner or "Authenticating…" text) and error handling for user feedback
- Route guards that wait for Internet Identity provider initialization before performing authentication checks
- Error handling for authentication failures with user-friendly messaging
- Prevention of automatic Landing Page to Dashboard transitions until proper authentication
- HTTP outcalls integration for external Mistral API communication
- On-chain storage of verification, consent, chat data, structured onboarding responses, and inference responses
- Secure principal-based user identification
- Blob storage integration for persistent chat messages, API responses, and mock audio files
- Session-based chat APIs with authentication
- Asynchronous API call handling with status tracking
- Client-side configuration storage for API settings and PersonaFlex configuration
- Frontend state management for multi-step conversational logic and dual-mode interactions
- Frontend-only voice interaction simulation with mocked responses and local state
- Camera component integration for permission handling without real-time streaming
- Proper React Router configuration with authentication-based routing logic that prevents infinite redirect loops
- Authentication state management that handles login/logout transitions smoothly
- Route guards that properly check authentication status without causing loading loops
- Functional authentication button event handlers with proper Internet Identity integration
- Responsive design that maintains functionality across desktop and mobile devices
- Clean authentication flow management with proper error handling and state cleanup
- Visible and functional authentication buttons on landing page with proper styling, positioning in centered hero layout, and user feedback
- Logout functionality that correctly clears session and returns user to landing page
