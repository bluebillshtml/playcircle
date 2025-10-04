# SportConnect - Multi-Sport Court Booking & Match Management App

A complete React Native app for booking courts and venues across multiple sports, managing matches, team brackets, live scoring, and leaderboards - all powered by Supabase.

## 🚀 Features

- **Match Management** - Browse, create, and join matches across multiple sports
- **2v2 Team Brackets** - Select teams with animated bracket overlay
- **Real-time Updates** - Live scoring and match updates
- **Leaderboards** - Regional, national, and global rankings
- **Venue Finder** - Find nearby courts and venues with geolocation
- **Payment Integration** - Stripe-ready payment system
- **User Profiles** - Track stats, match history, and achievements

## 📋 Prerequisites

- Node.js 16+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- Supabase account (free tier works great)
- iOS Simulator or Android Emulator (or Expo Go app on your phone)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd SportConnect
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be provisioned
3. Navigate to **SQL Editor** in your Supabase dashboard
4. Copy the contents of `supabase_schema.sql` and run it
5. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

### 3. Configure Supabase Credentials

Edit `src/config/supabase.config.js`:

```javascript
export const SUPABASE_URL = 'https://your-project-ref.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Enable Realtime (Optional)

For live scoring features:
1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable realtime for these tables:
   - `scoring_events`
   - `match_games`
   - `team_players`
   - `matches`

### 5. Start the App

```bash
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

## 📚 Database Schema

The app includes a complete database with:

- **14 tables** for all features
- **Automatic triggers** for stats updates
- **Row Level Security** for data protection
- **PostGIS** for geolocation features
- **Indexes** for optimized queries

See `SUPABASE_SETUP.md` for detailed schema documentation.

## 🔑 Key Files

```
PlayCircle/
├── src/
│   ├── config/
│   │   └── supabase.config.js          # Supabase credentials
│   ├── services/
│   │   └── supabase.js                 # All API methods
│   ├── context/
│   │   ├── AuthContext.js              # Authentication state
│   │   └── ThemeContext.js             # Theme management
│   ├── screens/
│   │   ├── HomeScreen.js               # Upcoming matches
│   │   ├── DashboardScreen.js          # Leaderboard
│   │   ├── MatchDetailScreen.js        # Match details & payment
│   │   └── ...
│   └── components/
│       ├── TeamBracketOverlay.js       # 2v2 bracket UI
│       ├── BracketButton.js            # Bracket toggle button
│       └── ...
├── supabase_schema.sql                 # Database schema
├── SUPABASE_SETUP.md                   # Database documentation
└── INTEGRATION_EXAMPLE.md              # Integration examples
```

## 🎮 Usage

### For Testing (Without Real Data)

The app works without a Supabase backend, but you'll only see empty states. To test with data:

1. **Option A:** Use the mock data (already in the code)
2. **Option B:** Set up Supabase and add sample data:

```sql
-- Insert a sample court
INSERT INTO courts (name, address, city, country, latitude, longitude, surface_type, is_indoor, base_price_per_hour, is_active)
VALUES ('Downtown Padel Club', '123 Main St', 'San Francisco', 'USA', 37.78825, -122.4324, 'Artificial Grass', true, 40.00, true);

-- Insert a sample match (replace court_id and host_id with actual UUIDs)
INSERT INTO matches (court_id, match_date, match_time, duration_minutes, match_type, skill_level, max_players, total_cost, price_per_player, host_id, description)
VALUES ('court-uuid', '2025-10-05', '18:00', 90, 'competitive', 'Intermediate', 4, 40.00, 10.00, 'user-uuid', 'Looking for players!');
```

### With Authentication

1. Users need to sign up/login (auth screens not yet built)
2. For now, you can manually create users in Supabase Auth dashboard
3. Or implement login screen using the auth methods in `src/services/supabase.js`

## 🔐 Authentication Flow

The app uses Supabase Auth with:
- Email/Password login (can be extended)
- Session persistence via AsyncStorage
- Auto-refresh tokens
- Profile creation on signup

To add login screen:

```javascript
import { authService } from '../services/supabase';

const handleLogin = async (email, password) => {
  try {
    await authService.signIn(email, password);
    // User is now logged in
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

See `INTEGRATION_EXAMPLE.md` for full examples.

## 📱 Features Breakdown

### ✅ Fully Integrated with Supabase
- HomeScreen - Loads upcoming/past matches
- DashboardScreen - Loads leaderboard
- MatchDetailScreen - Loads match details
- TeamBracketOverlay - Real team management
- Payment flow - Creates payment records

### 🚧 To Be Implemented
- MatchesScreen - Browse all matches
- CreateMatchScreen - Create new matches
- ProfileScreen - View/edit user profile
- Login/Signup screens
- Stripe payment processing
- Live scoring UI
- Push notifications

## 🎯 Next Steps

1. **Add Authentication Screens**
   - Create LoginScreen.js
   - Create SignupScreen.js
   - Add to navigation

2. **Integrate Stripe**
   - Set up Stripe account
   - Add Stripe React Native SDK
   - Process payments in `confirmPayment`

3. **Complete Other Screens**
   - MatchesScreen - Use `matchService.getUpcomingMatches()`
   - CreateMatchScreen - Use `matchService.createMatch()`
   - ProfileScreen - Use `profileService.getProfile()`

4. **Add Realtime Features**
   - Live match score updates
   - Real-time player joins
   - Notifications

5. **Upload Images**
   - Set up Supabase Storage
   - Add profile picture upload
   - Add court images

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check your credentials in `src/config/supabase.config.js`
- Verify your Supabase project is running
- Check internet connection

### "Row Level Security policy violation"
- Make sure you're logged in for protected operations
- Check that RLS policies are enabled (they should be)

### "No data showing"
- Ensure you've run the `supabase_schema.sql`
- Add sample data to your database
- Check console for API errors

### App crashes on startup
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Metro cache: `npx expo start -c`

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## 📞 Support

For help with:
- **Supabase Setup** - See `SUPABASE_SETUP.md`
- **Integration** - See `INTEGRATION_EXAMPLE.md`
- **Database Queries** - See SQL examples in `SUPABASE_SETUP.md`

---

**Built with ❤️ using React Native, Expo, and Supabase**
# playcircle
