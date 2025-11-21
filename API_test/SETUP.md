# Bruno Environment Setup

## Quick Setup Instructions

1. **Open Bruno and import this collection**

2. **Create Environment:**
   - Click the dropdown in top-right that says "No Environment"
   - Select "Configure" → "Create Environment"
   - Name it "Local" or "Development"

3. **Add these variables:**
   ```
   baseUrl = http://localhost:3000
   apiPath = /api
   testUserId = (leave empty - will be set automatically)
   testUserEmail = test@example.com
   testUsername = testuser
   testPassword = password123
   adminUserId = (leave empty - will be set automatically)
   flowTestUserId = (leave empty - will be set automatically)
   validObjectId = 507f1f77bcf86cd799439011
   invalidObjectId = invalid_id
   ```

4. **Select the environment** from the dropdown

5. **Start your backend server** on http://localhost:3000

6. **Run tests in this order:**
   - Register User - Valid (creates test user)
   - Other registration tests
   - Get User Profile tests
   - List All Users
   - Update User tests
   - Delete User tests

## Notes
- Tests automatically manage user IDs via environment variables
- Some tests depend on previous tests creating users
- All URLs resolve to: `{{baseUrl}}{{apiPath}}/users/...`