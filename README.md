# 🚀 m2hsubdomain

<div align="center">

<!-- Optional: Add project logo here -->

**A modern subdomain management web application built with React, Vite, Tailwind CSS, and Supabase.**  
Designed for free subdomain services, multi-tenant SaaS platforms, and developer-focused tools.

[![GitHub stars](https://img.shields.io/github/stars/prince-m2hgamerz/m2hsubdomain?style=for-the-badge)](https://github.com/prince-m2hgamerz/m2hsubdomain/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/prince-m2hgamerz/m2hsubdomain?style=for-the-badge)](https://github.com/prince-m2hgamerz/m2hsubdomain/network)
[![GitHub issues](https://img.shields.io/github/issues/prince-m2hgamerz/m2hsubdomain?style=for-the-badge)](https://github.com/prince-m2hgamerz/m2hsubdomain/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

🌐 **Live Demo:** https://domain.m2hgamerz.site/ 
📘 **Documentation:** Coming soon

</div>

---

## 📖 Overview

**m2hsubdomain** is a frontend web application built to manage and display subdomains in a scalable and user-friendly way.  
It is especially suited for platforms where all subdomains resolve to a single application using wildcard routing.

The project uses **Supabase** as a Backend-as-a-Service (BaaS) for authentication, database management, and future real-time features, while the frontend is powered by a fast and modern React + Vite setup.

---

## ✨ Features

- 🎯 **Subdomain Management UI**  
  Create, list, update, and remove subdomains from a dashboard

- 🔐 **Authentication System**  
  Secure login and registration using Supabase Auth

- ⚡ **Fast Development Experience**  
  Vite-powered hot reload and optimized builds

- 💅 **Modern & Responsive UI**  
  Built with React and Tailwind CSS (Shadcn UI ready)

- 💾 **Cloud Database**  
  PostgreSQL database via Supabase

- ⚙️ **Environment-Based Configuration**  
  Simple and secure `.env` configuration

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- PostCSS
- ESLint

### Backend (BaaS)
- Supabase (Auth, Database, Realtime)

### Database
- PostgreSQL (via Supabase)

### Tooling
- npm / Bun
- GitHub

---

## 🚀 Quick Start

### Prerequisites
Make sure you have the following installed:
- **Node.js** v18 or higher (LTS recommended)
- **npm** (comes with Node.js)
- An active **Supabase project**

---

### Installation

```bash
# Clone the repository
git clone https://github.com/prince-m2hgamerz/m2hsubdomain.git
cd m2hsubdomain

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and visit:
```
http://localhost:5173
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

You can find these values in:
**Supabase Dashboard → Project Settings → API**

---

## 📁 Project Structure

```
m2hsubdomain/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images & icons
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utilities & Supabase client
│   ├── pages/              # Application pages
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/               # Supabase configs & migrations
├── .env                    # Environment variables
├── components.json         # UI component config
├── package.json            # Dependencies & scripts
├── tailwind.config.ts      # Tailwind CSS config
├── vite.config.ts          # Vite config
└── tsconfig*.json          # TypeScript configs
```

---

## 🔧 Development Scripts

| Command | Description |
|-------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

---

## 🚀 Deployment

To create a production build:

```bash
npm run build
```

The output will be generated in the `dist/` directory.

You can deploy this folder to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting provider

---

## 🧪 Testing

Currently, no automated tests are configured.  
Testing frameworks such as **Vitest** or **Jest** can be added later.

---

## 🤝 Contributing

Contributions are welcome and appreciated!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint`
5. Commit and push
6. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React for UI development
- Vite for fast builds
- Tailwind CSS for styling
- Supabase for backend services
- ESLint for code quality

---

## 📞 Support & Contact

- 🐛 Issues: https://github.com/prince-m2hgamerz/m2hsubdomain/issues
- 👤 Author: https://github.com/prince-m2hgamerz

---

<div align="center">

⭐ **If this project helps you, please give it a star!**  
Made with ❤️ by **Prince (M2H Web Solution)**

</div>
