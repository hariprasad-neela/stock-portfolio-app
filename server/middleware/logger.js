export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, url, query, body, params } = req;

  console.log(`[${timestamp}] ⚛️  ${method} ${url}`);
  
  if (Object.keys(params).length) console.log(`   Params:`, params);
  if (Object.keys(query).length)  console.log(`   Query: `, query);
  
  // Only log body for non-sensitive data
  if (method !== 'GET' && Object.keys(body).length) {
    console.log(`   Body:  `, JSON.stringify(body, null, 2));
  }

  // Track how long the request takes
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`   Status: ${res.statusCode} | Duration: ${duration}ms`);
    console.log('---'.repeat(10));
  });

  next();
};
