# Thali Nutrition Compass

Thali Nutrition Compass is an AI-powered food nutrition analysis application that helps users understand the nutritional value of their meals. Users can upload or capture a food image and receive an estimated nutritional breakdown, including calories, protein, carbohydrates, and fats.

## Features

- **AI-Based Food Analysis:** Identifies food items from uploaded images.
- **Nutrition Estimation:** Provides estimated calories, protein, carbohydrates, and fats.
- **Simple User Interface:** Easy-to-use and responsive design.
- **Supabase Integration:** Supports authentication and database connectivity.
- **Image Upload:** Allows users to upload food images for analysis.
- **Nutrition Summary:** Displays nutritional information in an organized format.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript

### Database and Services
- Supabase
- AI Gateway for food image analysis

## Project Structure

```text
thali-nutrition-compass/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

*Note: This is the planned deployment structure.*

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/manisha353/thali-nutrition-compass.git
cd thali-nutrition-compass
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 4. Environment Variables

Configure the required environment variables in separate `.env` files.

**Frontend:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_api_url
```

**Backend:**
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LOVABLE_API_KEY=your_ai_gateway_key
```

Never expose secret keys in frontend code or commit `.env` files to GitHub.

## Deployment

The application is intended to use separate deployment platforms:

- **Frontend – Vercel:** Hosts the React application.
- **Backend – Render:** Hosts the Node.js and Express API.
- **Supabase:** Provides database and authentication services.

## How It Works

1. The user uploads a food image.
2. The frontend sends the image to the backend API.
3. The backend processes the image using AI.
4. The AI returns the identified food items and estimated nutritional values.
5. The frontend displays the nutrition results.

## Future Enhancements

- Improved food recognition accuracy.
- Support for more regional and traditional Indian dishes.
- Daily nutrition tracking.
- Meal history and progress tracking.
- Personalized nutrition recommendations.

## Author

Developed as an AI-based food nutrition analysis project.

## License

This project is intended for educational and development purposes.
