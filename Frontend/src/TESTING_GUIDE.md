# Authentication Flow Testing Guide

## Prerequisites
- Backend API running on `http://127.0.0.1:8000/api/`
- Frontend running (typically `http://localhost:5173` or similar)
- Browser DevTools open (F12) to check localStorage and console logs

## Test Cases

### 1. Homepage Navigation - Unauthenticated User

**Test**: Unauthenticated user clicks "Vote Now" button
```
Steps:
1. Open homepage (/)
2. Ensure NO auth_token in localStorage (clear if needed)
3. Click "Vote Now" button
Expected: Redirects to /login (Login page)
```

**Test**: Unauthenticated user clicks "Vote" in navigation menu
```
Steps:
1. Open homepage (/)
2. Click "Vote" in desktop menu
Expected: Redirects to /login (Login page)
```

### 2. Homepage Navigation - Authenticated User

**Test**: Authenticated user clicks "Vote Now" button
```
Steps:
1. Login first (see Login Test Case below)
2. Return to homepage (/)
3. Click "Vote Now" button
Expected: Redirects to /welcome (Voting Welcome Page)
Verify: User name displayed at top
```

### 3. Login Flow

**Test**: User logs in successfully
```
Steps:
1. Navigate to /login
2. Enter valid Voter ID and Password
3. Click "Sign In"
Expected: 
- Redirects to /welcome
- localStorage contains 'auth_token' and 'user_data'
- Greeting shows user's first name
Verify in DevTools (F12 > Application > LocalStorage):
  - auth_token: "eyJhbGc..." (JWT token)
  - user_data: {"firstName": "...", "lastName": "...", ...}
```

**Test**: User already logged in tries to access /login
```
Steps:
1. Login first
2. Navigate to /login in browser
Expected: Redirects to /welcome (already logged in)
```

### 4. Voting Welcome Page

**Test**: Display user name on Welcome Page
```
Steps:
1. Login successfully
2. Should see: "Hello, [FirstName] [LastName]"
Expected: User name correctly displayed from localStorage
```

**Test**: Click "Cast Your Vote" button
```
Steps:
1. On /welcome page
2. Click "Cast Your Vote" button
Expected: Navigates to /voting (Voting Page)
```

**Test**: Click "View Results" button
```
Steps:
1. On /welcome page
2. Click "View Results" link
Expected: Navigates to /results (Results Page)
```

### 5. Protected Routes - Unauthenticated Access

**Test**: Try to access protected routes without authentication
```
Steps:
1. Clear localStorage (remove auth_token and user_data)
2. Manually navigate to each protected route:
   - /welcome
   - /voting
   - /vote-thankyou
   - /admin/results-control
Expected: All redirect to /login
```

**Test**: Try to access /voting without login
```
Steps:
1. Clear localStorage
2. Navigate to /voting directly
Expected: Redirects to /login (ProtectedRoute works)
```

### 6. Logout Flow

**Test**: User logs out successfully
```
Steps:
1. Login first
2. On /welcome page, click "Logout" button
Expected:
- localStorage cleared (both auth_token and user_data removed)
- Redirects to / (Homepage)
- Subsequent "Vote Now" click redirects to /login
Verify in DevTools: auth_token and user_data should be gone
```

**Test**: After logout, protected routes redirect to login
```
Steps:
1. Login
2. Logout
3. Try to access /welcome directly
Expected: Redirects to /login (auth_token cleared)
```

### 7. Registration Flow

**Test**: Register new user
```
Steps:
1. Navigate to /login
2. Click "Sign Up" link
3. Fill registration form
4. Submit
Expected:
- Shows success message with Voter ID
- Redirects to /voter-id
- Can then login with new credentials
```

### 8. API Token Injection

**Test**: Verify token sent with API requests
```
Steps:
1. Login successfully
2. Open DevTools (F12)
3. Go to Network tab
4. Click "Cast Your Vote" button on /voting
5. Find the vote POST request
Expected: Request headers contain:
  Authorization: Bearer eyJhbGc... (JWT token from localStorage)
```

### 9. Session Persistence

**Test**: Token persists across page refreshes
```
Steps:
1. Login successfully
2. Open DevTools > Application > LocalStorage
3. Note the auth_token value
4. Refresh the page (F5)
5. Check localStorage again
Expected: auth_token is still present (not cleared)
```

## Browser DevTools Commands

### Check Authentication Status
```javascript
// In browser console:
localStorage.getItem('auth_token');  // Returns JWT token
JSON.parse(localStorage.getItem('user_data'));  // Returns user object
```

### Clear Authentication
```javascript
// To manually log out (for testing):
localStorage.removeItem('auth_token');
localStorage.removeItem('user_data');
window.location.href = '/';  // Refresh to homepage
```

### Verify API Request
```javascript
// In Network tab:
// 1. Click on any API request
// 2. Go to "Headers" tab
// 3. Look for "Authorization: Bearer ..."
```

## Expected localStorage Structure After Login

```javascript
{
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "citizenship_no": "12-34-56-78901",
    "district": "Kathmandu",
    "municipality": "Kathmandu Metropolitan City",
    "ward": "5",
    "voterId": "VOTE-2026-001"
  }
}
```

## Troubleshooting

### Issue: "Vote Now" always redirects to /login even when logged in
```
Check:
1. localStorage has auth_token: localStorage.getItem('auth_token')
2. Token is not empty/null
3. Try logging in again
4. Clear browser cache and localStorage
```

### Issue: Greeting shows "Hello, Voter" instead of user name
```
Check:
1. user_data exists in localStorage
2. user_data has firstName and lastName fields
3. Check backend response includes these fields
Debug: JSON.parse(localStorage.getItem('user_data'))
```

### Issue: API requests fail with 401 Unauthorized
```
Check:
1. Token is present in localStorage
2. Token is valid (not expired)
3. Backend properly validates Bearer token format
4. Check Network tab - Authorization header is present
```

### Issue: Protected routes show login page instead of redirecting
```
Check:
1. ProtectedRoute component is used in routes
2. isAuthenticated() function works correctly
3. localStorage is not cleared between navigation
4. Browser allows localStorage access
```

## Quick Test Checklist

- [ ] Unauthenticated user "Vote Now" → /login
- [ ] Authenticated user "Vote Now" → /welcome
- [ ] Login stores auth_token and user_data
- [ ] Welcome page shows user name
- [ ] Logout clears localStorage
- [ ] Protected routes redirect to /login when not authenticated
- [ ] API requests include Authorization header
- [ ] Token persists after page refresh
- [ ] Logout redirects to /
- [ ] After logout, "Vote Now" requires login again
