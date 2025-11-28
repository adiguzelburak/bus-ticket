# Bus Ticket Booking App

A simple bus ticket booking application built with React, TypeScript, and Vite.

## Features

- 🔍 **Trip Search**: Search for bus trips by origin, destination, and date.
- 💺 **Seat Selection**: Interactive seat selection with gender-based restrictions.
- 📝 **Passenger Details**: Form handling with validation for passenger information.
- 🎫 **Ticket Summary**: Review booking details and download ticket as PDF.
- 🌙 **Dark Mode**: Toggle between light and dark themes.
- 🌍 **Localization**: Support for English and Turkish languages.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management & API**: React Query, Axios
- **Forms**: Formik, Yup
- **Routing**: React Router
- **Mock Backend**: JSON Server

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository or download the source code.
2. Install dependencies:

```bash
npm install
```

### Running the Application

You need to run both the mock API server and the frontend development server.

1. **Start the Mock API Server** (in a new terminal):

```bash
npm run api
```
This will start the JSON server on `http://localhost:3001`.

2. **Start the Frontend** (in another terminal):

```bash
npm run dev
```
Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Project Structure

- `src/pages`: Application pages (Search, Seat Selection, Passenger Form, Summary)
- `src/components`: Reusable UI components
- `src/services`: API service definitions
- `mock-server`: JSON Server database and configuration
