# Padlo - Padel Matchmaking App

A React Native mobile application for connecting Padel players, booking courts, and organizing matches.

## Features

- **Court Discovery**: Browse nearby Padel courts on an interactive map
- **Match Browsing**: View available matches with filters for casual/competitive play
- **Create Matches**: Host your own matches and set skill level requirements
- **Smart Payment Split**: Court rental costs are automatically divided among players
- **Player Profiles**: Track your stats, match history, and ratings
- **Matchmaking**: Choose between casual or competitive matches

## Tech Stack

- React Native with Expo
- React Navigation (Bottom Tabs + Stack)
- React Native Maps
- Expo Location
- Vector Icons

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Project Structure

```
padlo/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js          # Map view of nearby courts
│   │   ├── MatchesScreen.js       # List of available matches
│   │   ├── MatchDetailScreen.js   # Match details and join functionality
│   │   ├── CreateMatchScreen.js   # Create new match
│   │   └── ProfileScreen.js       # User profile and stats
│   ├── components/
│   │   ├── Button.js              # Reusable button component
│   │   └── Card.js                # Reusable card component
│   └── constants/
│       └── colors.js              # App color scheme
├── App.js                         # Main app with navigation
├── app.json                       # Expo configuration
└── package.json

```

## Key Screens

### Home Screen
- Interactive map showing nearby Padel courts
- Court cards with pricing, rating, and distance
- Quick navigation to view matches at each court

### Matches Screen
- List of all available matches
- Filter by match type (all, casual, competitive)
- Shows player count, skill level, and cost per player

### Match Detail Screen
- Full match information
- Player list with ratings
- Court facilities and details
- Join match with payment confirmation

### Create Match Screen
- Select court and time
- Choose match type and skill level
- Set duration and number of players
- Automatic cost calculation per player

### Profile Screen
- User stats and ratings
- Match history
- Account settings
- Payment methods

## Color Scheme

- Primary: `#3DD598` (Teal Green)
- Background: `#F8F9FA` (Light Gray)
- Text: `#1A1A1A` (Dark)
- Secondary Text: `#8E8E93` (Gray)

## Future Enhancements

- Real backend integration
- Payment processing (Stripe/PayPal)
- Push notifications
- Real-time chat
- Advanced matchmaking algorithm
- Court booking system
- Tournament organization
- Social features (friends, teams)
# padloapp
