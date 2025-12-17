import arcjet, { tokenBucket, detectBot, shield } from "@arcjet/node";

/**
 * Protecție strictă pentru endpoint-uri de autentificare
 * Rate limit: 5 requests / 15 minute
 * Include bot detection și WAF shield
 */
const authProtection = arcjet({
  key: process.env.ARCJET_KEY,
  
  rules: [
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 5,
      interval: 900,
      capacity: 5,
    }),
    
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    
    shield({
      mode: "LIVE",
    }),
  ]
});

/**
 * Protecție moderată pentru endpoint-uri API generale
 * Rate limit: 100 requests / oră
 * Include bot detection și WAF shield
 */
const apiProtection = arcjet({
  key: process.env.ARCJET_KEY,
  
  rules: [
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 100,
      interval: 3600,
      capacity: 100,
    }),
    
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
      ],
    }),
    
    shield({
      mode: "LIVE",
    }),
  ]
}); 

/**
 * Middleware Express pentru Arcjet protection
 * 
 * @param {Object} protection - Configurație Arcjet (authProtection sau apiProtection)
 * @returns {Function} Express middleware function
 * @example app.use('/api/auth', arcjetMiddleware(authProtection))
 */
const arcjetMiddleware = (protection) => {
  return async (req, res, next) => {
    try {
      const decision = await protection.protect(req); 
      
      if (decision.isDenied()) {
        console.log(`[ARCJET BLOCKED] ${req.method} ${req.url} - ${decision.reason}`);
        
        let errorMessage = 'Request denied by security policy.';
        let statusCode = 429; 

        switch (decision.reason) {
          case 'RATE_LIMIT':
            errorMessage = 'Too many requests. Please wait and try again.';
            statusCode = 429;
            break;
          case 'BOT_DETECTED':
          case 'SHIELD':
            errorMessage = 'Request blocked for security reasons.';
            statusCode = 403;
            break;
        }
        
        return res.status(statusCode).json({ 
          error: errorMessage,
          reason: decision.reason,
          retryAfter: decision.resetTime ? decision.resetTime.toISOString() : 'N/A',
          ...(process.env.NODE_ENV === 'development' && {
            details: decision.reason
          })
        });
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ARCJET ALLOWED] ${req.method} ${req.url}`);
      }
      
      next();
    } catch (error) {
      console.error('[ARCJET ERROR]', error);
      next();
    }
  };
};

export {
  authProtection,
  apiProtection,
  arcjetMiddleware
};