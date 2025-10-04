// Sport definitions and configurations
export const SPORTS = {
  PADEL: {
    id: 'padel',
    name: 'Padel',
    icon: 'tennisball',
    color: '#3DD598',
    minPlayers: 4,
    maxPlayers: 4,
    teamSize: 2,
    scoringSystem: 'tennis',
    courtTypes: ['Artificial Grass', 'Synthetic Turf', 'Concrete'],
    equipment: ['Padel racket', 'Padel ball'],
    description: 'Fast-paced racket sport played in an enclosed court'
  },
  TENNIS: {
    id: 'tennis',
    name: 'Tennis',
    icon: 'tennisball',
    color: '#51CF66',
    minPlayers: 2,
    maxPlayers: 4,
    teamSize: 1,
    scoringSystem: 'tennis',
    courtTypes: ['Hard Court', 'Clay', 'Grass', 'Synthetic'],
    equipment: ['Tennis racket', 'Tennis ball'],
    description: 'Classic racket sport with singles or doubles play'
  },
  PICKLEBALL: {
    id: 'pickleball',
    name: 'Pickleball',
    icon: 'tennisball',
    color: '#FFD43B',
    minPlayers: 2,
    maxPlayers: 4,
    teamSize: 1,
    scoringSystem: 'pickleball',
    courtTypes: ['Hard Court', 'Concrete', 'Asphalt'],
    equipment: ['Pickleball paddle', 'Pickleball'],
    description: 'Fast-growing paddle sport combining elements of tennis, badminton, and ping pong'
  },
  BADMINTON: {
    id: 'badminton',
    name: 'Badminton',
    icon: 'tennisball',
    color: '#FF6B6B',
    minPlayers: 2,
    maxPlayers: 4,
    teamSize: 1,
    scoringSystem: 'badminton',
    courtTypes: ['Indoor Court', 'Synthetic'],
    equipment: ['Badminton racket', 'Shuttlecock'],
    description: 'Indoor racket sport with shuttlecock'
  },
  SQUASH: {
    id: 'squash',
    name: 'Squash',
    icon: 'tennisball',
    color: '#845EC2',
    minPlayers: 2,
    maxPlayers: 2,
    teamSize: 1,
    scoringSystem: 'squash',
    courtTypes: ['Indoor Court'],
    equipment: ['Squash racket', 'Squash ball'],
    description: 'High-intensity indoor racket sport'
  },
  BASKETBALL: {
    id: 'basketball',
    name: 'Basketball',
    icon: 'basketball',
    color: '#FF8C00',
    minPlayers: 2,
    maxPlayers: 10,
    teamSize: 5,
    scoringSystem: 'basketball',
    courtTypes: ['Indoor Court', 'Outdoor Court', 'Concrete'],
    equipment: ['Basketball'],
    description: 'Team sport with hoops and basketball'
  },
  SOCCER: {
    id: 'soccer',
    name: 'Soccer',
    icon: 'football',
    color: '#228B22',
    minPlayers: 4,
    maxPlayers: 22,
    teamSize: 11,
    scoringSystem: 'soccer',
    courtTypes: ['Grass', 'Artificial Turf', 'Indoor Court'],
    equipment: ['Soccer ball'],
    description: 'Team sport played with feet and a ball'
  },
  VOLLEYBALL: {
    id: 'volleyball',
    name: 'Volleyball',
    icon: 'football',
    color: '#FF4500',
    minPlayers: 4,
    maxPlayers: 12,
    teamSize: 6,
    scoringSystem: 'volleyball',
    courtTypes: ['Indoor Court', 'Beach Court', 'Grass'],
    equipment: ['Volleyball', 'Net'],
    description: 'Team sport with net and ball'
  }
};

export const SPORT_CATEGORIES = {
  RACKET_SPORTS: ['padel', 'tennis', 'pickleball', 'badminton', 'squash'],
  TEAM_SPORTS: ['basketball', 'soccer', 'volleyball'],
  INDOOR: ['badminton', 'squash', 'basketball', 'volleyball'],
  OUTDOOR: ['padel', 'tennis', 'pickleball', 'soccer', 'volleyball']
};

export const getSportById = (sportId) => {
  return SPORTS[sportId.toUpperCase()] || null;
};

export const getSportsByCategory = (category) => {
  return SPORT_CATEGORIES[category]?.map(sportId => SPORTS[sportId.toUpperCase()]) || [];
};

export const getAllSports = () => {
  return Object.values(SPORTS);
};
