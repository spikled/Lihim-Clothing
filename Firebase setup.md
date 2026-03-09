Lihim Clothing - Firebase Setup Guide

🔥 Firebase Integration
1.) Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `lihim-clothing` (or your choice)
4. Disable Google Analytics (optional, not needed for this project)
5. Click "Create project"

2.) Set Up Firestore Database
1. In Firebase Console, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in test mode" (for development)
   - ⚠️Important: Test mode allows anyone to read/write. For production, set up security rules.
4. Choose a location (e.g., `us-central1`)
5. Click "Enable"

3.) Get Your Firebase Configuration
1. In Firebase Console, click the ⚙️ gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the Web icon `</>`
4. Register your app:
   - App nickname: `Lihim Clothing Web`
   - ❌ Don't check "Firebase Hosting"
   - Click "Register app"
5. Copy the firebaseConfig object

4.) Update Your Code
Open `firebase-config.js` and replace the configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",              // ← Replace this
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",    // ← Replace this
    projectId: "YOUR_PROJECT_ID",             // ← Replace this
    storageBucket: "YOUR_PROJECT_ID.appspot.com",     // ← Replace this
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",    // ← Replace this
    appId: "YOUR_APP_ID"                      // ← Replace this
};
```

Example of what it should look like:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB1a2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q",
    authDomain: "lihim-clothing.firebaseapp.com",
    projectId: "lihim-clothing",
    storageBucket: "lihim-clothing.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1"
};
```

5.) File Structure
Your project should have these files:

```
lihim-clothing/
├── index.html           # Customer shop
├── admin.html           # Admin dashboard
├── style.css            # Styles
├── script.js            # Shop functionality
├── admin.js             # Admin functionality
├── firebase-config.js   # 🔥 Firebase configuration (NEW!)
└── FIREBASE-SETUP.md    # This file
```

❌ REMOVED: `database.js` (no longer needed)
