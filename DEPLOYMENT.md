# Pebble Path - Firebase Deployment Guide

## Overview
This guide will help you set up Firebase for Pebble Path with:
- User authentication (Google + Phone)
- User profiles with first names
- Data isolation by user
- Welcome flow for new users
- Welcome back messages for returning users

## Prerequisites
- Firebase project created
- Firebase CLI installed (`npm install -g firebase-tools`)
- Environment variables configured

## Step 1: Firebase Project Setup

### 1.1 Enable Authentication
1. Go to Firebase Console → Authentication
2. Enable **Google** sign-in method
3. Enable **Phone** sign-in method
4. Add your domain to "Authorized domains"

### 1.2 Enable Firestore
1. Go to Firebase Console → Firestore Database
2. Create database in **production mode**
3. Choose a location close to your users

### 1.3 Set up Firestore Security Rules
1. Go to Firestore Database → Rules
2. Replace the rules with the contents of `firestore.rules`
3. Publish the rules

### 1.4 Create Firestore Indexes
1. Go to Firestore Database → Indexes
2. Create composite index:
   - Collection: `userData`
   - Fields: `uid` (Ascending), `dataType` (Ascending)

## Step 2: Environment Variables

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

## Step 3: Deploy to Firebase

### 3.1 Login to Firebase
```bash
firebase login
```

### 3.2 Initialize Firebase (if not already done)
```bash
firebase init
```
- Select **Firestore** and **Hosting**
- Use existing project
- Public directory: `dist`
- Single-page app: **Yes**
- Overwrite index.html: **No**

### 3.3 Deploy
```bash
npm run build
firebase deploy
```

## Step 4: Test the Flow

### 4.1 New User Flow
1. User visits app
2. Clicks "Continue with Google" or enters phone number
3. Completes authentication
4. Sees "Welcome to Pebble Path!" screen
5. Enters first name
6. Redirected to data input screen

### 4.2 Returning User Flow
1. User visits app
2. Automatically signed in (if session valid)
3. Sees "Welcome back, [Name]! 👋" message
4. Redirected to data input screen

## Data Structure

### Users Collection
```
users/{userId}
├── uid: string
├── firstName: string
├── createdAt: timestamp
└── lastLoginAt: timestamp
```

### User Data Collection
```
userData/{userId_days}
├── uid: string
├── dataType: "days"
├── data: object (user's daily entries)
└── updatedAt: timestamp

userData/{userId_presets}
├── uid: string
├── dataType: "presets"
├── data: object (user's workout/food presets)
└── updatedAt: timestamp
```

## Security Features

- **User Isolation**: Each user can only access their own data
- **Profile Protection**: Users can only read/write their own profile
- **Data Validation**: All data is validated before storage
- **Authentication Required**: All data operations require valid authentication

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure user is authenticated
   - Verify user ID matches document

2. **Phone authentication not working**
   - Check reCAPTCHA setup
   - Verify phone number format
   - Check Firebase console for errors

3. **Data not loading**
   - Check user authentication state
   - Verify Firestore indexes are created
   - Check browser console for errors

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'firebase:*');
```

## Support
For issues related to:
- **Firebase setup**: Check Firebase documentation
- **App functionality**: Check browser console and network tab
- **Deployment**: Verify build output and Firebase configuration
