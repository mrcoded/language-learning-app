# 🌍 SuperLang (Language Learning App)

SuperLang is a modern, interactive, cross-platform mobile language learning application built with **React Native (Expo)**, **TypeScript**, and **Supabase**. It offers a rich curriculum of lessons, interactive practice modes, real-time voice and conversation scenarios, adaptive statistics, and gamified progress tracking.

---

## ✨ Features

- **🔐 Robust Authentication & Session Management**:
  - Secure storage backed by `expo-secure-store` and `@react-native-async-storage/async-storage`.
  - Email/Password and OAuth flows with deep linking integration.
  - Role-based RLS policies and profile management via Supabase.

- **🎯 Personalized Onboarding**:
  - Interactive multi-step onboarding (Target language, Proficiency level, Motivations, Interests, and Profile details).
  - Navigation guards that route returning authenticated users directly to their lessons.

- **📚 Interactive Lessons & Rich Modalities**:
  - **Flashcards** & **Vocabulary Introductions**.
  - **Multiple Choice** & **Listening Multiple Choice**.
  - **Single Response** with smart string similarity evaluation.
  - Sentence breakdown cards and audio playback.

- **🎙️ Real-time Conversation Mode**:
  - Audio prompts, recording, and waveform visualizer powered by `expo-audio` and Skia.
  - Custom conversational scenarios for practical dialogue practice.
  - Real-time speaking and listening statistics tracking.

- **💎 Premium Access & Paywall**:
  - Membership gating (`isPremium`, `premium_expired_at`) with native paywall UI.

- **🎨 Modern UI & Theme System**:
  - Full Light and Dark mode synchronization across all screens and modals.
  - Smooth micro-interactions powered by `react-native-reanimated`, Haptics, and Confetti animations.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) (~54.0) with [Expo Router](https://docs.expo.dev/router/introduction) (~6.0)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State & Data**: React Context API, [Supabase](https://supabase.com)
- **Audio & Media**: `expo-audio`, `expo-speech`, `expo-video`
- **Animations & Graphics**: `react-native-reanimated`, `@shopify/react-native-skia`, `lottie-react-native`, `react-native-fast-confetti`
- **UI & Components**: Custom themed components, `sonner-native` for toast notifications

---

## 📁 Project Structure

```text
language-learning-app/
├── app/                  # File-based routing (Expo Router)
│   ├── (tabs)/           # Main tab navigation screens
│   ├── auth.tsx          # Authentication screen
│   ├── onboarding.tsx    # Multi-step onboarding workflow
│   ├── conversation.tsx  # Interactive conversation mode
│   └── practice.tsx      # Practice and review screen
├── assets/               # Fonts, audio files, icons, and course JSON data
├── components/           # Reusable UI components
│   ├── auth/             # Login, signup, and email auth views
│   ├── conversations/    # Audio prompts, wave visualizer, dialogs
│   ├── lessons/          # Exercise types, flashcards, lesson engine
│   └── onboarding/       # Onboarding questionnaire components
├── constants/            # Color palettes, theme tokens, static constants
├── context/              # Auth, theme, and application state contexts
├── hooks/                # Custom React hooks (deep linking, audio, stats)
├── lib/                  # Utilities, Supabase client, and progress helpers
├── supabase/             # Migrations, config, and edge functions
└── types/                # TypeScript interfaces and data schemas
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your physical device, or an Android/iOS emulator configured.

### 2. Installation
Clone the repository and install the dependencies:

```bash
git clone https://github.com/mrcoded/language-learning-app.git
cd language-learning-app
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory by copying the sample:

```bash
cp .env.example .env
```

Populate the required environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
# Start the Expo development server
npx expo start
```

In the terminal output, select:
- Press `a` to run on an **Android emulator**
- Press `i` to run on an **iOS simulator**
- Press `w` to run on the **Web**
- Scan the QR code with your mobile camera / Expo Go app.

---

## 📜 Available Scripts

- `npm start` / `npx expo start`: Launches the Expo dev server.
- `npm run android`: Starts dev server on Android emulator.
- `npm run ios`: Starts dev server on iOS simulator.
- `npm run web`: Starts web preview.
- `npm run lint`: Runs ESLint checks.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the issues page or submit a pull request.
