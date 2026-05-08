# Authentication & Navigation Flow Implementation

## Overview
This document explains the complete authentication and navigation flow implemented for the NVOTE voting system.

## Components Created

### 1. **Auth Helpers (`src/utils/authHelpers.ts`)**
Utility functions for managing authentication state:

- `isAuthenticated()` - Checks if user has valid auth token
- `getAuthToken()` - Retrieves JWT token from localStorage
- `getUserData()` - Returns stored user data object
- `getUserName()` - Returns formatted user name for display
- `clearAuthData()` - Clears all auth data from localStorage
- `storeAuthData(token, userData)` - Stores auth data in localStorage

### 2. **ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)**
Wraps protected routes and:
- Checks if user is authenticated
- Redirects unauthenticated users to `/login`
- Allows authenticated users to access protected routes

## Navigation Flow

### Public Routes (No Protection)
- `/` - Homepage (with authentication-aware "Vote Now" button)
- `/login` - Login page (redirects to `/welcome` if already logged in)
- `/register` - Registration page
- `/candidate-details` - Candidate information
- `/results` - View election results
- `/voter-id` - Display voter ID after registration

### Protected Routes (Require Authentication)
- `/welcome` - Voting welcome page (displays user name, logout button)
- `/voting` - Candidate voting page
- `/vote-thankyou` - Vote confirmation page
- `/admin/results-control` - Admin results control panel

## User Flows

### Flow 1: New User Registration
1. User clicks "Sign In" on homepage → redirects to `/login`
2. User clicks "Sign Up" link → redirects to `/register`
3. User fills registration form → submits
4. Backend generates voter ID → redirects to `/voter-id`
5. User sees their voter ID
6. User must manually navigate to login to authenticate

### Flow 2: User Login
1. User navigates to `/login`
2. User enters voter ID and password
3. Backend returns auth token and user data
4. Auth data stored in localStorage:
   - `auth_token` - JWT token for API requests
   - `user_data` - User object (firstName, lastName, etc.)
5. User redirected to `/welcome` page
6. Displays greeting with user name

### Flow 3: Voting
1. From homepage, user clicks "Vote Now" button
2. `isAuthenticated()` checks if token exists
   - If NO → redirects to `/login`
   - If YES → redirects to `/welcome` (Voting Welcome page)
3. User clicks "Cast Your Vote" → goes to `/voting`
4. ProtectedRoute ensures user is authenticated
5. User selects candidate and confirms
6. Vote recorded → redirects to `/vote-thankyou`
7. User sees thank you message and can:
   - View results
   - Return to home
   - (Auto-logout after time, optional)

### Flow 4: Logout
1. User on `/welcome` page clicks "Logout" button
2. `clearAuthData()` removes auth token and user data from localStorage
3. User redirected to homepage `/`
4. User is no longer authenticated
5. "Vote" button on homepage now requires login again

## Component Updates

### Homepage (`src/components/Homepage.tsx`)
- Added `isAuthenticated()` import
- Updated "Vote Now" button to check authentication:
  - If authenticated → `/welcome`
  - If not → `/login`
- Updated navigation menu "Vote" link with same logic
- Updated mobile menu with same authentication checks

### Login (`src/components/Login.tsx`)
- Added `storeAuthData()` import
- Updated `handleSubmit()` to use helper function
- Stores both token and user data in localStorage
- Redirects to `/welcome` after successful login

### VotingWelcome (`src/components/VotingWelcome.tsx`)
- Added `clearAuthData()` and `getUserName()` imports
- Updated logout button to use `clearAuthData()` helper
- Updated greeting to use `getUserName()` helper
- Logout redirects to `/`

### App.tsx
- Added ProtectedRoute component import
- Added auth helpers import
- Changed login route to redirect authenticated users to `/welcome`
- Wrapped protected routes with `<ProtectedRoute>` component:
  - `/welcome` - Voting Welcome Page
  - `/voting` - Voting Page
  - `/vote-thankyou` - Thank You Page
  - `/admin/results-control` - Admin Results Control

## localStorage Structure

```javascript
// After successful login/registration
{
  "auth_token": "eyJhbGciOiJIUzI1NiIs...",  // JWT token
  "user_data": {                               // User object from backend
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "citizenship_no": "12-34-56-78901",
    "district": "Kathmandu",
    "municipality": "Kathmandu Metropolitan City",
    "ward": "5"
  }
}
```

## Security Features

1. **Token-based Authentication**
   - JWT tokens stored in localStorage
   - Token required for API requests
   - Protected routes prevent unauthorized access

2. **Route Protection**
   - ProtectedRoute component checks authentication
   - Automatic redirect to login for unauthenticated users
   - Cannot access voting pages without login

3. **Logout Mechanism**
   - `clearAuthData()` removes all auth data
   - Clears both token and user info
   - User must re-login to vote

4. **Authentication Check on App Load**
   - App.tsx checks for existing token on mount
   - Preserved session if valid token exists

## API Integration

All API requests use the `api` instance configured with:
- Base URL: `http://127.0.0.1:8000/api/`
- Include auth token in headers (configured in axios interceptor)

### Required Backend Endpoints

- `POST /api/login/` - Returns `{ token, user }`
- `POST /api/register/` - Returns `{ token, user, voterId }`
- `GET /api/candidates/` - Returns candidates list
- `POST /api/vote/` - Records user vote
- `GET /api/vote-status/` - Checks if user already voted
- `GET /api/results/` - Returns voting results

## Future Enhancements

1. **Token Refresh**
   - Implement token refresh endpoint
   - Auto-refresh before expiration
   - Add token expiration handling

2. **Session Persistence**
   - Add session timeout logic
   - Auto-logout after inactivity
   - Confirmation before logout

3. **Role-Based Access**
   - Admin routes (e.g., `/admin/results-control`)
   - Observer routes
   - Different permissions based on role

4. **Error Handling**
   - Handle expired tokens
   - Handle invalid tokens
   - Graceful error messages

5. **Two-Factor Authentication**
   - Optional 2FA for security
   - OTP verification
   - Recovery codes
