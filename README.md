# Flash Energy Warehouse Management System

A comprehensive web application for managing warehouse inventory with Firebase integration, user authentication, and activity logging.

## Features

### 🔐 Authentication
- User registration and login
- Secure Firebase Authentication
- Email/password authentication

### 📦 Warehouse Management
- Three warehouses: Faisal, Lebini, and Cairo
- Add items with quantity and units (PCS or Meters)
- Real-time inventory tracking
- Item editing and deletion
- Transfer items between warehouses

### 🔍 Search & Filter
- Search items by name, warehouse, or unit
- Real-time search results

### 👥 User Privileges
- Admin privileges for specific emails (`flashgroup17@gmail.com`, `hamdyfg@gmail.com`)
- Activity logs visible only to privileged users
- User management system

### 📊 Activity Logging
- Track all user actions (login, logout, add, edit, delete, transfer)
- Real-time activity feed
- Timestamped entries with user information

## File Structure

```
flashenergy/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js             # JavaScript functionality
├── firebase-setup.md   # Firebase setup instructions
└── README.md          # This file
```

## Setup Instructions

### 1. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and Realtime Database
4. Copy your Firebase config to `app.js`

### 2. Database Rules
Update your Firebase Realtime Database rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "items": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "activity_logs": {
      ".read": "auth != null && (root.child('privileges').child(auth.token.email).val() == true || auth.token.email == 'flashgroup17@gmail.com' || auth.token.email == 'hamdyfg@gmail.com')",
      ".write": "auth != null"
    },
    "privileges": {
      ".read": "auth != null && (auth.token.email == 'flashgroup17@gmail.com' || auth.token.email == 'hamdyfg@gmail.com')",
      ".write": "auth != null && (auth.token.email == 'flashgroup17@gmail.com' || auth.token.email == 'hamdyfg@gmail.com')"
    }
  }
}
```

### 3. Running the Application
1. Open `index.html` in a web browser
2. Register a new account or login with existing credentials
3. Start managing your warehouse inventory

## Usage

### For Regular Users
1. **Login/Register**: Create an account or login with existing credentials
2. **Add Items**: Select warehouse, unit, enter quantity and item name
3. **Manage Items**: Edit item names/quantities, delete items, or transfer between warehouses
4. **Search**: Use the search bar to find specific items

### For Admin Users (flashgroup17@gmail.com, hamdyfg@gmail.com)
- All regular user features
- **Privileges Button**: Manage which users can view activity logs
- **Activity Logs**: View all system activities with timestamps and user information

## Security Features

- Firebase Authentication for secure user management
- Database rules to protect sensitive data
- Activity logging for audit trails
- Privileged access control for admin features

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5 for responsive design
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Styling**: Custom CSS with Bootstrap components

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues
1. **Firebase Config Error**: Make sure you've updated the Firebase configuration in `app.js`
2. **Database Rules**: Ensure database rules are properly set for your security requirements
3. **Authentication**: Check that Email/Password authentication is enabled in Firebase Console

### Error Messages
- "Login failed": Check email/password or Firebase Auth configuration
- "Error adding item": Check database permissions and Firebase config
- "No activity logs available": Only privileged users can view activity logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Flash Energy warehouse management.

## Support

For support or questions, contact the development team.
