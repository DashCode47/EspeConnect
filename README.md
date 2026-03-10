# EspeConnect Frontend

A React Native mobile application for connecting ESPE students.

## Features

- User Authentication (Login/Register)
- Profile Management
- Interest-based Matching
- Post Creation and Sharing
- Real-time Chat (coming soon)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native development environment setup

### Installation

1. Clone the repository
```bash
git clone [your-repository-url]
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Run the application
```bash
# For Android
npm run android
# or
yarn android

# For iOS
npm run ios
# or
yarn ios
```

## Tech Stack

- React Native
- React Navigation
- React Native Paper
- TypeScript
- Axios
- League Spartan (Typography)

## Fonts Setup

This application uses **League Spartan** as the primary font family. To set up the fonts:

1. Download League Spartan font files from [Google Fonts](https://fonts.google.com/specimen/League+Spartan)
2. Follow the instructions in [FONTS_SETUP.md](./FONTS_SETUP.md) to configure the fonts for both Android and iOS platforms
3. Rebuild the application after adding the font files

The font configuration is already set up in the codebase - you just need to add the font files to the appropriate directories.

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
