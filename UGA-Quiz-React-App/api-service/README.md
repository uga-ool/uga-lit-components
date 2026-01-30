# UGA Quiz API Service

Backend API service that acts as a middle layer between the `uga-quiz` component and D2L Brightspace API. This service allows students to submit quiz grades even though they don't have direct write permissions to the D2L gradebook.

## Why This Service?

- **Permission Issue**: Students cannot write grades directly to D2L (403 Forbidden)
- **Solution**: This service uses instructor-level OAuth credentials to write grades on behalf of students
- **Benefits**:
  - Works for all users (students and instructors)
  - Centralized error handling and logging
  - Can add analytics and audit trails
  - Retry logic and queue management

## Setup

### 1. Register OAuth 2.0 Application in D2L

1. Log into D2L as an administrator
2. Go to **Admin Tools** > **Manage Extensibility** > **OAuth 2.0**
3. Click **Register an app**
4. Fill in the form:
   - **Application Name**: `UGA Quiz API Service`
   - **Redirect URI**: `https://your-api-domain.com/callback` (or leave blank if using client credentials)
   - **Scope**: `grades:gradevalues:write grades:gradeobjects:read grades:gradeobjects:write`
   - **Access Token Lifetime**: `72000` (20 hours)
   - **Enable refresh tokens**: Checked (optional)
5. Click **Register**
6. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your D2L credentials:
   ```env
   D2L_CLIENT_ID=your_client_id_from_d2l
   D2L_CLIENT_SECRET=your_client_secret_from_d2l
   D2L_API_URL=https://ugatest2.view.usg.edu
   ALLOWED_ORIGINS=https://ugatest2.view.usg.edu
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Service

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The service will start on port 3000 (or the port specified in `PORT` environment variable).

## API Endpoints

### POST /api/quiz/submit

Submit a quiz grade to D2L gradebook.

**Request Body:**

```json
{
  "courseId": "3519736",
  "userId": "267354",
  "gradeObjectName": "Formative Quiz 1",
  "pointsEarned": 27,
  "totalPoints": 55,
  "quizId": "quiz-formative-quiz-1",
  "quizTitle": "Formative Quiz 1",
  "attemptCount": 1,
  "passed": true,
  "comments": "<p>Optional HTML comments</p>"
}
```

**Response:**

```json
{
  "success": true,
  "gradeValue": { ... },
  "message": "Grade submitted successfully: 27/55"
}
```

### GET /api/health

Health check endpoint to verify service is running and D2L connection is working.

**Response:**

```json
{
  "status": "healthy",
  "d2l_configured": true,
  "timestamp": "2026-01-23T12:00:00.000Z"
}
```

## Deployment Options

### Option A: Simple Node.js Server

Deploy to any Node.js hosting service:

- Heroku
- Railway
- Render
- AWS Elastic Beanstalk
- DigitalOcean App Platform

### Option B: Docker Container

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Option C: Serverless Function

Convert to serverless functions:

- AWS Lambda
- Google Cloud Functions
- Azure Functions
- Vercel Functions

## Security Considerations

1. **Never expose Client Secret**: Keep `.env` file secure and never commit it to git
2. **Use HTTPS**: Always use HTTPS in production
3. **CORS Configuration**: Set `ALLOWED_ORIGINS` to restrict which domains can call your API
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse
5. **Authentication**: Consider adding API key authentication for additional security

## Troubleshooting

### "D2L OAuth credentials not configured"

- Make sure `.env` file exists and contains `D2L_CLIENT_ID` and `D2L_CLIENT_SECRET`

### "D2L authentication failed"

- Verify your Client ID and Client Secret are correct
- Check that your OAuth app has the required scopes
- Ensure your D2L instance allows OAuth 2.0 client credentials flow

### "Grade object not found"

- The service will attempt to create the grade object automatically
- If creation fails, check that the OAuth app has `grades:gradeobjects:write` scope
- Verify the course ID is correct

## Next Steps

After deploying this service, update your `uga-quiz` component to use it (see component updates).
