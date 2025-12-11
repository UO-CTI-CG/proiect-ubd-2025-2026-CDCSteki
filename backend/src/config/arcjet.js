
import arcjet, { tokenBucket, detectBot, shield } from "@arcjet/node";

// ============================================
// PROTECȚIE STRICTĂ pentru LOGIN/REGISTER (Anti Brute Force - înlocuit cu Bot Detection)
// ============================================
const authProtection = arcjet({
  // API Key din Arcjet Dashboard (trebuie să îl adaugi în .env!)
  key: process.env.ARCJET_KEY,
  
  rules: [
    // Token Bucket Rate Limiting - anti brute-force
    // Max 5 tokens consumați în 15 minute
    tokenBucket({
      mode: "LIVE", // "LIVE" blochează, "DRY_RUN" doar loghează
      
      // Tracked per IP by default
      characteristics: ["ip.src"],
      
      // Configurare strictă pentru login
      refillRate: 5,    // reumple 5 tokens
      interval: 900,    // la fiecare 15 minute (900 secunde)
      capacity: 5,      // maxim 5 tokens în bucket
    }),
    
    // Bot Detection - blochează bot-uri automate
    detectBot({
      mode: "LIVE",
      // Permite doar search engines
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
      ],
      // Implicit blochează toate celelalte bot-uri
    }),
    
    // Shield WAF - protecție împotriva atacurilor comune
    shield({
      mode: "LIVE", // blochează SQL injection, XSS, etc.
    }),
  ]
});

// ============================================
// PROTECȚIE MODERATĂ pentru API-uri generale (Anti Burst/DDoS L7 - înlocuit cu Bot Detection)
// ============================================
const apiProtection = arcjet({
  key: process.env.ARCJET_KEY,
  
  rules: [
    // Rate limiting mai relaxat pentru operații CRUD normale
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      
      // 100 request-uri per oră
      refillRate: 100,  // reumple 100 tokens
      interval: 3600,   // la fiecare oră (3600 secunde)
      capacity: 100,    // maxim 100 tokens
    }),
    
    // Bot detection (mai permisiv)
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",  // Uptime monitoring
        "CATEGORY:PREVIEW",  // Link previews (Slack, Discord)
      ],
    }),
    
    // Shield WAF
    shield({
      mode: "LIVE",
    }),
  ]
}); 

/**
 * Middleware helper pentru Express
 * Folosește: app.use(arcjetMiddleware(authProtection))
 * @param {import("@arcjet/node").Arcjet} protection - O configurație Arcjet (e.g., authProtection sau apiProtection).
 */
const arcjetMiddleware = (protection) => {
  return async (req, res, next) => {
    try {
      // Folosim sintaxa simplă: Arcjet extrage automat contextul din req
      const decision = await protection.protect(req); 
      
      if (decision.isDenied()) {
        console.log(`[ARCJET BLOCKED] ${req.method} ${req.url}`);
        console.log(`  Motiv: ${decision.reason}`);
        
        let errorMessage = 'Cererea a fost respinsă de politica de securitate.';
        let statusCode = 429; 

        switch (decision.reason) {
          case 'RATE_LIMIT':
            errorMessage = 'Prea multe cereri. Vă rugăm să așteptați și să încercați din nou.';
            statusCode = 429;
            break;
          case 'BOT_DETECTED':
          case 'SHIELD':
            errorMessage = 'Cererea a fost blocată din motive de securitate.';
            statusCode = 403; // Forbidden
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
      
      // Log pentru succes (doar în development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ARCJET PERMIS] ${req.method} ${req.url}`);
      }
      
      next();
    } catch (error) {
      console.error('[EROARE ARCJET]', error);
      // Fail-open: permite request-ul în caz de eroare Arcjet
      next();
    }
  };
};

export {
  authProtection,
  apiProtection,
  arcjetMiddleware
};