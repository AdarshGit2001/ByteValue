# ♻️ ByteValue

> **Know the true value of your e-waste before you sell it.**

ByteValue is an AI-powered web application that helps users estimate the **repair cost**, **fair salvage value**, **reusable components**, and **environmental impact** of old or damaged electronic devices. By leveraging Google's Gemini AI, ByteValue promotes responsible e-waste management while protecting users from unfair scrap pricing.

---

## 🚀 Problem Statement

Millions of electronic devices are discarded every year because users are unaware of:

- The actual value of their damaged devices.
- Whether the device can be repaired.
- Which components are still reusable.
- Whether a scrap dealer is offering a fair price.

This results in financial loss and unnecessary electronic waste.

---

## 💡 Our Solution

ByteValue provides an intelligent AI-powered analysis that enables users to:

- 📷 Upload a photo of a damaged device.
- 🤖 Analyze the device using Gemini AI.
- 💰 Estimate repair cost and salvage value.
- 🔧 Identify reusable components.
- 🌍 Understand the environmental benefits of recycling instead of discarding.

---

## ✨ Features

- 🔐 Secure User Authentication (JWT)
- 📷 Image Upload & Device Analysis
- 🤖 AI-powered Electronics Inspection
- 💰 Repair Cost Estimation
- 💎 Fair Salvage Value Prediction
- 🧩 Salvageable Component Detection
- 🌱 Environmental Impact Calculation
- 📊 Analysis History Dashboard
- 🎨 Modern Responsive UI
- ⚡ Fast & Interactive User Experience

---

## 🖥️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Lucide React

### Backend

- Node.js
- Express.js
- SQLite
- JWT Authentication
- Multer
- Google Gemini API

---

## 📁 Project Structure

```
ByteValue/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── database/
│   │   ├── config/
│   │   └── utils/
│   │
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ByteValue.git

cd ByteValue
```

---

### Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file.

```env
PORT=4000

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

NODE_ENV=development

CORS_ORIGIN=http://localhost:3000
```

Run backend

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open

```
http://localhost:3000
```

---

## 🧠 How It Works

1. User signs in.
2. Uploads an image of an electronic device.
3. Selects device type.
4. Describes the issue.
5. Backend securely sends image and prompt to Gemini AI.
6. Gemini analyzes the device.
7. ByteValue generates:

- Device Information
- Repair Cost
- Salvage Value
- Reusable Components
- Environmental Impact

8. Results are displayed in a clean dashboard.

---

## 🌍 Environmental Impact

Every successful analysis promotes responsible recycling by showing:

- Estimated CO₂ emissions prevented
- Heavy metals diverted from landfills
- Landfill space saved

Our goal is to encourage a circular economy and reduce electronic waste.

---

## 🔒 Security

- JWT Authentication
- Password Hashing with bcrypt
- Protected API Routes
- Input Validation
- Secure Environment Variables

---

## 📸 Screenshots

> Add screenshots of:

- Landing Page
- Login
- Dashboard
- Analysis Page
- Result Page

---

## 🚀 Future Scope

- Barcode / IMEI detection
- OCR for device model recognition
- Live repair shop recommendations
- AI-powered repair suggestions
- Price comparison across marketplaces
- Carbon footprint analytics
- Multi-language support
- Admin dashboard
- PDF report generation

---

## 👨‍💻 Team

Developed during a Hackathon ❤️

Team **ByteValue**

---

## 📄 License

This project is developed for educational and hackathon purposes.

---

## ⭐ If you like this project

Please consider giving this repository a **Star ⭐**.
