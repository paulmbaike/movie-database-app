# Movie Database App 🎬

A comprehensive and feature-rich movie database cross platform application built with React Native, Expo, and TypeScript. This app allows users to browse, search, and manage movies with a beautiful and responsive UI that supports both light and dark modes.

## Screenshots

### Light Mode
<img src="./app-screenshots/home-lightmode.PNG" alt="Home Screen Light Mode" width="400" />

### Dark Mode
<img src="./app-screenshots/home-darkmode.PNG" alt="Home Screen Dark Mode" width="400" />

## Features

### Authentication & Profile Management
- **User Registration**: Create an account with username, email, and password with validation
- **User Login**: Secure authentication with JWT token storage
- **Profile Management**: View and update preferences
- **Change Password**: Ability to update passwords with validation

### Content Browsing
- **Browse Movies**: View a comprehensive list of movies with details
- **Pagination**: Infinite scroll pagination for smooth browsing experience
- **Advanced Search**: Filter movies by multiple criteria:
  - Release year
  - Genre
  - Sort by (title, release year, etc.)
  - Sort direction (ascending or descending)
- **Explore Page**: View movies grouped by actors and genres for easy discovery

### CRUD Operations
- **Movies**: Create, read, update, and delete movie entries with detailed information
- **Genres**: Full CRUD functionality for movie genres
- **Actors**: Manage actor information with biography and birth date
- **Directors**: Manage director information with biography and birth date

### UI/UX Features
- **Theme Support**: Toggle between light and dark modes
- **Responsive Design**: Adaptable layout that works across different screen sizes
- **Form Validation**: Comprehensive input validation using Zod
- **Haptic Feedback**: Tactile response for user interactions
- **Toast Notifications**: Informative feedback for user actions

## Data Source
The application is seeded with movie data from Amazon movies dataset, providing a rich collection of real movie information for demonstration purposes.

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a:

- Expo Go app (iOS and Android)
- Android emulator
- iOS simulator
- Web browser

## Built With

- [React Native](https://reactnative.dev/) - Mobile app framework
- [Expo](https://expo.dev) - Development platform
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [GlueStack UI](https://gluestack.io/) - UI component library
- [React Query](https://tanstack.com/query/latest) - Data fetching and state management
- [Zod](https://zod.dev/) - Runtime validation
- [React Navigation](https://reactnavigation.org/) - Navigation library

## Backend API

This application is powered by a dedicated backend API built with ASP.NET Core. You can find the backend repository here:
[MovieDatabaseAPI](https://github.com/paulmbaike/MovieDatabaseAPI)
