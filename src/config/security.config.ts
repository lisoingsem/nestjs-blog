export default () => ({
  security: {
    // JWT Configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    
    // Rate Limiting
    throttling: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60000'), // 1 minute
      limit: parseInt(process.env.THROTTLE_LIMIT || '10'), // 10 requests per minute
    },
    
    // CORS Configuration
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    
    // Authentication
    auth: {
      // Public routes that don't require authentication
      publicRoutes: [
        'login',
        'createUser',
        'introspectionQuery', // GraphQL introspection
      ],
      
      // Default roles
      defaultRole: 'user',
      adminRole: 'admin',
      
      // Password requirements
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
    
    // Session management
    session: {
      maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5'),
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
    },
  },
}); 