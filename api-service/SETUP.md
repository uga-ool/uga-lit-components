# Quick Setup Guide

## Step 1: Register OAuth 2.0 App in D2L

1. Log into D2L as an administrator
2. Go to **Admin Tools** > **Manage Extensibility** > **OAuth 2.0**
3. Click **Register an app**
4. Fill in:
   - **Application Name**: `UGA Quiz API Service`
   - **Redirect URI**: Leave blank (or use your callback URL)
   - **Scope**: `grades:gradevalues:write grades:gradeobjects:read grades:gradeobjects:write`
   - **Access Token Lifetime**: `72000` (20 hours)
   - **Enable refresh tokens**: Checked
5. Click **Register**
6. **Copy the Client ID and Client Secret** (you'll need these)

## Step 2: Configure Environment

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   D2L_CLIENT_ID=your_client_id_here
   D2L_CLIENT_SECRET=your_client_secret_here
   D2L_API_URL=https://ugatest2.view.usg.edu
   ALLOWED_ORIGINS=https://ugatest2.view.usg.edu
   ```

## Step 3: Install and Run

```bash
npm install
npm start
```

The service will start on port 3000.

## Step 4: Update Quiz Component

Add the `api-endpoint` attribute to your quiz component:

```html
<uga-quiz
  quiz-id="demo-quiz"
  quiz-title="My Quiz"
  grade-object-name="Formative Quiz 1"
  api-endpoint="https://your-api-domain.com/api/quiz/submit"
>
</uga-quiz>
```

## Testing

1. Check health: `GET https://your-api-domain.com/api/health`
2. Take a quiz as a student
3. Check the gradebook - the grade should appear!

## Deployment Options

### Option A: Heroku

```bash
heroku create uga-quiz-api
heroku config:set D2L_CLIENT_ID=your_id D2L_CLIENT_SECRET=your_secret
git push heroku main
```

### Option B: Railway

1. Connect your GitHub repo
2. Add environment variables in Railway dashboard
3. Deploy automatically

### Option C: Render

1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables
4. Deploy

## Troubleshooting

- **403 Forbidden**: Check that OAuth app has correct scopes
- **401 Unauthorized**: Verify Client ID and Secret are correct
- **CORS errors**: Update `ALLOWED_ORIGINS` in `.env`
