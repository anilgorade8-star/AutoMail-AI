![Colude AI Banner](C:/Users/anilg/.gemini/antigravity/brain/9f988124-0ae6-479a-9102-8ed966fbff9b/colude_ai_banner_1772361669124.png)

# 🤖 Colude AI — Intelligent Email Coordination Assistant

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)

**Colude AI** (AutoMail AI) is a premium, high-performance email coordination platform designed to automate your outreach and streamline communications using intelligent workflows.

---

## ✨ Key Features (Level 1 MVP)

- 🔐 **Google OAuth**: Secure sign-in using your Google account with Gmail and Calendar permissions.
- 📥 **Gmail Analysis**: Automatically fetches the last 10 emails from your inbox for processing.
- 🧠 **AI Meeting Detection**: Powered by **OpenAI**, the assistant analyzes email content to identify meeting requests, extracting titles, dates, and times.
- 📅 **Auto-Scheduling**: Detected meetings are automatically synchronized with your primary **Google Calendar**.
- 📊 **Real-time Activity**: Live logs and stats tracking the impact of your AI coordinator.
- 🎨 **Premium UI**: Dynamic **Dark**, **Light**, and **Glassmorphism** themes with smooth micro-animations.

---

## 🚀 Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Intelligence**: [OpenAI API](https://openai.com/api/) (GPT-3.5 Turbo)
- **Email/Calendar**: [Google Workspace APIs](https://developers.google.com/workspace)

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/colude-ai.git
   cd colude-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables. Create a `.env` file in the root:
   ```env
   VITE_OPENAI_API_KEY=your_openai_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_API_KEY=your_google_api_key
   ```

### Running the App

- **Development Mode**:
  ```bash
  npm run dev
  ```

- **Build for Production**:
  ```bash
  npm run build
  ```

- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 📁 Project Structure

```text
colude.ai/
├── src/
│   ├── components/   # Reusable UI components (Sidebar, Modals, etc.)
│   ├── constants/    # Theme configs and SVG icons
│   ├── hooks/        # Custom hooks (state management)
│   ├── pages/        # Main application views
│   ├── styles/       # Global CSS and design tokens
│   └── utils/        # Helper functions
├── public/           # Static assets
└── index.html        # Entry point
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

---

## 📄 License

This project is private and for internal use.

---

*Built with ❤️ by the Colude AI Team.*
