# Norva Architecture Guide

This document outlines the architecture, directory structure, entry points, data flow, and key dependencies of the **Norva** codebase to facilitate fast and efficient feature development and code generation.

---

## 1. System Overview

**Norva** is a full-stack social media mobile application platform consisting of:
- **Client**: A mobile frontend built using React Native with Expo, Expo Router (file-based routing), TanStack React Query for async state management, Zustand for client state, and MMKV for fast key-value local storage.
- **Server**: A Node.js backend using Express 5, MongoDB with Mongoose, Socket.io for real-time WebSockets, JWT authentication, and Cloudinary for media storage.

```
+-------------------------------------------------------+
|                    Client (Expo/RN)                   |
|  - Expo Router (File-based Routing)                   |
|  - TanStack Query + Axios (HTTP API Layer)           |
|  - Zustand Store (State) + MMKV (Local Storage)       |
|  - Socket.io Client (Real-time events)                |
+---------------------------+---------------------------+
                            |
                     HTTP / WebSocket
                            |
+---------------------------v---------------------------+
|                   Server (Node/Express)               |
|  - Express App + HTTP Server                          |
|  - Socket.io Server (Real-time communication)         |
|  - JWT Middleware Auth                                |
|  - Controllers & Routes (Auth, User, Post, File)      |
|  - Cloudinary Service (Image/Media uploads)           |
|  - Mongoose ODM -> MongoDB Database                   |
+-------------------------------------------------------+
```

---

## 2. Main Entry Points

### Client Entry Point
- **Package Config**: [`client/package.json`](file:///root/termux_home/Norva/client/package.json) (`main`: `"expo-router/entry"`)
- **Root Layout & Providers**: [`client/src/app/_layout.tsx`](file:///root/termux_home/Norva/client/src/app/_layout.tsx)
  - Configures `QueryClientProvider` (`@tanstack/react-query`).
  - Sets up app font loading (`useFonts`).
  - Wraps routes inside `<Stack>` navigation protected guards (redirecting unauthenticated users to `/auth` and authenticated users to `/(secure)`).

### Server Entry Point
- **Package Config**: [`server/package.json`](file:///root/termux_home/Norva/server/package.json) (`main`: `"server.js"`, `"type": "module"`)
- **Main Server Script**: [`server/server.js`](file:///root/termux_home/Norva/server/server.js)
  - Loads environment variables (`dotenv/config`).
  - Connects to MongoDB (`server/config/db.config.js`).
  - Initializes HTTP Server and Socket.io (`server/services/socket.service.js`).
  - Registers Express middleware (`express.json()`, `cors`).
  - Mounts routes (`/auth`, `/post`, `/file`, `/user`) guarded by `isAuthenticated` middleware for secure endpoints.

---

## 3. Directory Structure

```
Norva/
├── client/                     # Expo / React Native Frontend
│   ├── assets/                 # Fonts, images, splash screens
│   ├── src/
│   │   ├── app/                # Expo Router screen hierarchy
│   │   │   ├── _layout.tsx     # Root stack layout & auth guards
│   │   │   ├── auth/           # Unauthenticated screens (Signin, Signup)
│   │   │   └── (secure)/       # Protected screens requiring auth
│   │   │       ├── (tabs)/     # Bottom Tab navigation (Feeds, Search, Profile, Home)
│   │   │       ├── (models)/   # Modal screens (e.g., FullScreenImage)
│   │   │       └── (others)/   # Sub-screens (EditProfile, Chats, Posts)
│   │   ├── components/         # Feature-oriented UI components
│   │   │   ├── auth/           # Signin / Signup component widgets
│   │   │   ├── common/         # Reusable UI (Toast, Avatar, Buttons, Inputs)
│   │   │   ├── feed/           # Feed post items, comments, interaction controls
│   │   │   ├── profile/        # Profile headers, posts grid, edit tools
│   │   │   └── search/         # Search input and user result items
│   │   ├── constants/          # Application-wide constants & design tokens
│   │   ├── controllers/        # React Query custom hooks for API calls
│   │   │   ├── auth/           # Login/Signup hooks
│   │   │   ├── post/           # Fetch/Create/Like/Comment post hooks
│   │   │   └── user/           # Fetch user, follow/unfollow, edit profile hooks
│   │   ├── hooks/              # Custom utility React hooks
│   │   ├── storage/            # MMKV storage wrapper for client-side persistence
│   │   ├── store/              # Zustand state stores
│   │   │   ├── app.store.js    # Global app state (toast, theme, loading)
│   │   │   ├── user.store.js   # User session & auth store
│   │   │   ├── comment.store.js# Active comment state
│   │   │   └── follow.store.js # Follow/Following state
│   │   └── utils/              # Helper utilities
│   │       ├── axios.js        # Pre-configured Axios instance with auth interceptors
│   │       ├── cloudinary.js   # Image upload client helper
│   │       ├── imagePick.js    # Expo Image Picker wrappers
│   │       └── validateAuthData.js # Client-side form validation logic
│   ├── app.json                # Expo configuration
│   ├── package.json            # Client dependencies & scripts
│   └── tsconfig.json           # TypeScript configuration
│
└── server/                     # Express / Node.js Backend
    ├── config/                 # Environment & DB configurations
    │   ├── db.config.js        # Mongoose connection setup
    │   └── cloudinary.config.js# Cloudinary SDK credentials configuration
    ├── controllers/            # Request handler functions
    │   ├── auth/               # Login, signup, refresh token handlers
    │   ├── feed/               # Post creation, feeds, likes, comments handlers
    │   └── user/               # Profile fetch, search, follow handlers
    ├── middleware/             # Express middlewares
    │   └── auth.js             # JWT verification middleware
    ├── models/                 # Mongoose Data Models
    │   ├── user.models.js      # User schema
    │   ├── post.models.js      # Post schema
    │   ├── comment.models.js   # Comment schema
    │   └── token.model.js      # Token schema (refresh tokens / blacklist)
    ├── routes/                 # Express Router modules
    │   ├── auth.routes.js      # Public auth endpoints (`/auth`)
    │   ├── post.routes.js      # Post & feed operations (`/post`)
    │   ├── user.routes.js      # User profile & search operations (`/user`)
    │   └── file.routes.js      # File upload endpoints (`/file`)
    ├── services/               # Background & real-time services
    │   └── socket.service.js   # Socket.io connection & event handling
    ├── utils/                  # Utility functions
    │   ├── genToken.js         # JWT generation helpers (Access/Refresh tokens)
    │   ├── secureApi.js        # Standardized API response formatter
    │   └── cloudinary.js       # Cloudinary upload/destroy utilities
    ├── package.json            # Server dependencies & scripts
    └── server.js               # Express application entry point
```

---

## 4. Data Flow & Communication Architecture

### Authentication & Token Storage
1. **User Signin/Signup**: Client sends credentials via [`client/src/controllers/auth`](file:///root/termux_home/Norva/client/src/controllers/auth).
2. **Token Response**: Server validates credentials, generates Access and Refresh JWT tokens ([`server/utils/genToken.js`](file:///root/termux_home/Norva/server/utils/genToken.js)), and returns user data with tokens.
3. **Client Persistence**: Client persists token/session state into MMKV storage via [`client/src/storage/storage.js`](file:///root/termux_home/Norva/client/src/storage/storage.js) and updates [`client/src/store/user.store.js`](file:///root/termux_home/Norva/client/src/store/user.store.js).
4. **Request Interception**: [`client/src/utils/axios.js`](file:///root/termux_home/Norva/client/src/utils/axios.js) attaches `Bearer <token>` to headers on outgoing HTTP requests.

### HTTP REST API Flow
```
Component -> React Query Controller Hook -> Axios Client -> Express Route -> Auth Middleware -> Controller Handler -> Mongoose Model -> MongoDB
```

### Real-Time Socket Communication
- Server initializes Socket.io on top of Express HTTP server in [`server/services/socket.service.js`](file:///root/termux_home/Norva/server/services/socket.service.js).
- Client connects using `socket.io-client` for real-time notifications, messaging, and feed updates.

---

## 5. Key Dependencies

### Client Side
- **Core Framework**: `react` (19.2.0), `react-native` (0.83.6), `expo` (~55.0.28), `expo-router` (~55.0.17)
- **Data Fetching & State**: `@tanstack/react-query` (^5.83.0), `zustand` (^5.0.6), `axios` (^1.11.0)
- **Storage**: `react-native-mmkv` (^3.3.0)
- **UI & Animation**: `tailwindcss` / `uniwind`, `react-native-reanimated`, `@shopify/flash-list`, `@expo/vector-icons`, `expo-image`
- **Realtime**: `socket.io-client` (^4.8.1)

### Server Side
- **Framework & HTTP**: `express` (^5.1.0), `cors` (^2.8.5)
- **Database**: `mongoose` (^8.16.5)
- **Authentication**: `jsonwebtoken` (^9.0.2), `bcryptjs` (^3.0.2)
- **File Uploads & Cloud Media**: `multer` (^2.0.2), `cloudinary` (^2.10.0)
- **Realtime Websockets**: `socket.io` (^4.8.1)

---

## 6. Guidelines for Code Generation Tasks

When extending or adding new features to Norva:
1. **Client Navigation**: Add new screens under [`client/src/app`](file:///root/termux_home/Norva/client/src/app). Use route groups: `(tabs)` for main tab views, `(models)` for modal overlays, `(others)` for nested screen flows.
2. **Client Data Operations**: Place network API logic in [`client/src/controllers`](file:///root/termux_home/Norva/client/src/controllers) as TanStack React Query custom hooks (`useQuery` / `useMutation`).
3. **Client Global State**: Use Zustand stores in [`client/src/store`](file:///root/termux_home/Norva/client/src/store) for global state; avoid cluttering React Query cache with local UI states.
4. **Server Routes & Controllers**: Follow the modular architecture: define Mongoose schema in `server/models/`, register endpoint in `server/routes/`, and implement business logic in `server/controllers/`. Wrap API responses using `secureApi` utility.
