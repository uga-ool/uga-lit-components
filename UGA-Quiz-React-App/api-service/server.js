/**
 * UGA Quiz API Service
 * Backend service to submit quiz grades to D2L Brightspace
 * 
 * This service acts as a middle layer between the uga-quiz component and D2L API,
 * allowing students to submit grades even though they don't have direct write permissions.
 * 
 * Setup:
 * 1. Register an OAuth 2.0 app in D2L Admin Tools > Manage Extensibility > OAuth 2.0
 * 2. Request scopes: grades:gradevalues:write grades:gradeobjects:read grades:gradeobjects:write
 * 3. Set environment variables (see .env.example)
 * 4. Run: npm install && npm start
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// D2L OAuth 2.0 Configuration
const D2L_CONFIG = {
  authUrl: process.env.D2L_AUTH_URL || 'https://auth.brightspace.com/oauth2/auth',
  tokenUrl: process.env.D2L_TOKEN_URL || 'https://auth.brightspace.com/core/connect/token',
  apiUrl: process.env.D2L_API_URL || 'https://ugatest2.view.usg.edu',
  clientId: process.env.D2L_CLIENT_ID,
  clientSecret: process.env.D2L_CLIENT_SECRET,
  scopes: process.env.D2L_SCOPES || 'grades:gradevalues:write grades:gradeobjects:read grades:gradeobjects:write'
};

// Cache for access tokens (in production, use Redis or similar)
let accessTokenCache = {
  token: null,
  expiresAt: null
};

/**
 * Get OAuth 2.0 access token using client credentials flow
 * This uses the service account credentials, not user credentials
 */
async function getAccessToken() {
  // Check if we have a valid cached token
  if (accessTokenCache.token && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  if (!D2L_CONFIG.clientId || !D2L_CONFIG.clientSecret) {
    throw new Error('D2L OAuth credentials not configured. Set D2L_CLIENT_ID and D2L_CLIENT_SECRET environment variables.');
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', D2L_CONFIG.scopes);

    const response = await axios.post(D2L_CONFIG.tokenUrl, params, {
      auth: {
        username: D2L_CONFIG.clientId,
        password: D2L_CONFIG.clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = response.data;
    
    // Cache the token (expires_in is in seconds)
    accessTokenCache.token = access_token;
    accessTokenCache.expiresAt = Date.now() + (expires_in * 1000) - 60000; // Subtract 1 minute for safety

    return access_token;
  } catch (error) {
    console.error('Failed to get D2L access token:', error.response?.data || error.message);
    throw new Error(`D2L authentication failed: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Get D2L API versions
 */
async function getD2LVersions() {
  const token = await getAccessToken();
  const response = await axios.get(`${D2L_CONFIG.apiUrl}/d2l/api/versions/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

/**
 * Find grade object by name
 */
async function findGradeObject(courseId, gradeObjectName) {
  const token = await getAccessToken();
  const versions = await getD2LVersions();
  const leVersion = versions.find(v => v.ProductCode === 'le')?.LatestVersion || '1.91';

  const response = await axios.get(
    `${D2L_CONFIG.apiUrl}/d2l/api/le/${leVersion}/${courseId}/grades/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const gradebook = response.data;
  const gradeObject = gradebook.find(
    g => g.Name === gradeObjectName || g.Name.toLowerCase() === gradeObjectName.toLowerCase()
  );

  if (!gradeObject) {
    throw new Error(`Grade object "${gradeObjectName}" not found in course ${courseId}`);
  }

  return { gradeObject, leVersion };
}

/**
 * Create grade object if it doesn't exist
 */
async function createGradeObject(courseId, gradeObjectName, maxPoints) {
  const token = await getAccessToken();
  const versions = await getD2LVersions();
  const leVersion = versions.find(v => v.ProductCode === 'le')?.LatestVersion || '1.91';

  const payload = {
    Name: gradeObjectName,
    ShortName: gradeObjectName.substring(0, 20),
    GradeType: 'Numeric',
    MaxPoints: maxPoints,
    CanExceedMaxPoints: false,
    IsBonus: false,
    ExcludeFromFinalGradeCalculation: false,
    CategoryId: 0,
    Description: {
      Content: `Auto-created by uga-quiz component`,
      Type: 'Text'
    }
  };

  try {
    const response = await axios.post(
      `${D2L_CONFIG.apiUrl}/d2l/api/le/${leVersion}/${courseId}/grades/`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.detail?.includes('same as any current')) {
      // Grade object already exists, try to find it
      const { gradeObject } = await findGradeObject(courseId, gradeObjectName);
      return gradeObject;
    }
    throw error;
  }
}

/**
 * Submit quiz grade to D2L
 * POST /api/quiz/submit
 */
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const {
      courseId,
      userId,
      gradeObjectName,
      pointsEarned,
      totalPoints,
      quizId,
      quizTitle,
      attemptCount,
      passed,
      comments
    } = req.body;

    // Validate required fields
    if (!courseId || !userId || !gradeObjectName || pointsEarned === undefined || !totalPoints) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['courseId', 'userId', 'gradeObjectName', 'pointsEarned', 'totalPoints']
      });
    }

    console.log('📊 Received quiz submission:', {
      courseId,
      userId,
      gradeObjectName,
      pointsEarned,
      totalPoints,
      quizId
    });

    // Get D2L API versions
    const versions = await getD2LVersions();
    const leVersion = versions.find(v => v.ProductCode === 'le')?.LatestVersion || '1.91';

    // Find or create grade object
    let gradeObject;
    try {
      const result = await findGradeObject(courseId, gradeObjectName);
      gradeObject = result.gradeObject;
    } catch (error) {
      // Grade object doesn't exist, try to create it
      console.log(`📝 Grade object "${gradeObjectName}" not found, attempting to create...`);
      try {
        gradeObject = await createGradeObject(courseId, gradeObjectName, totalPoints);
        console.log(`✅ Created grade object: ${gradeObject.Id}`);
      } catch (createError) {
        console.error('❌ Failed to create grade object:', createError.response?.data || createError.message);
        return res.status(500).json({
          error: 'Failed to create grade object',
          detail: createError.response?.data || createError.message
        });
      }
    }

    // Round points to integer (D2L requires integers)
    const roundedPointsEarned = Math.round(pointsEarned);
    const gradeObjectType = gradeObject.Type !== undefined ? gradeObject.Type : 1;

    // Prepare grade value payload
    const gradeValue = {
      GradeObjectType: gradeObjectType,
      PointsNumerator: roundedPointsEarned,
      Comments: {
        Content: comments || `<p><strong>Quiz "${quizTitle || quizId}"</strong> completed${attemptCount > 1 ? ` (Attempt ${attemptCount})` : ''}</p><p>Score: ${roundedPointsEarned}/${totalPoints} points (${((roundedPointsEarned / totalPoints) * 100).toFixed(1)}%)</p><p>Status: ${passed ? '<strong style="color: green;">Passed</strong>' : '<strong style="color: red;">Failed</strong>'}</p><p>Submitted via uga-quiz API service at ${new Date().toLocaleString()}</p>`,
        Type: 'Html'
      },
      PrivateComments: {
        Content: '',
        Type: 'Text'
      }
    };

    // Submit grade to D2L
    const token = await getAccessToken();
    const response = await axios.put(
      `${D2L_CONFIG.apiUrl}/d2l/api/le/${leVersion}/${courseId}/grades/${gradeObject.GradeObjectId || gradeObject.Id}/values/${userId}`,
      gradeValue,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Successfully submitted grade to D2L:', {
      courseId,
      userId,
      gradeObjectId: gradeObject.GradeObjectId || gradeObject.Id,
      pointsEarned: roundedPointsEarned,
      totalPoints
    });

    res.json({
      success: true,
      gradeValue: response.data,
      message: `Grade submitted successfully: ${roundedPointsEarned}/${totalPoints}`
    });

  } catch (error) {
    console.error('❌ Error submitting quiz grade:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { error: error.message };

    res.status(status).json({
      error: 'Failed to submit grade',
      detail: errorData,
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  try {
    // Test D2L connection
    await getAccessToken();
    res.json({
      status: 'healthy',
      d2l_configured: !!D2L_CONFIG.clientId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UGA Quiz API Service running on port ${PORT}`);
  console.log(`📡 D2L API URL: ${D2L_CONFIG.apiUrl}`);
  console.log(`🔐 OAuth configured: ${!!D2L_CONFIG.clientId}`);
  console.log(`\n📋 Endpoints:`);
  console.log(`   POST /api/quiz/submit - Submit quiz grade`);
  console.log(`   GET  /api/health - Health check`);
});
