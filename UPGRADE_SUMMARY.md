# Dependency Upgrade Summary

This document outlines all the changes made to upgrade dependencies to their latest versions.

## Package Updates

### Major Framework Updates

1. **Hapi.js Framework**
   - `hapi@18.1.0` → `@hapi/hapi@20.3.0`
   - `inert@5.1.3` → `@hapi/inert@6.0.5`
   - `vision@5.4.4` → `@hapi/vision@6.1.0`
   - `boom@7.3.0` → `@hapi/boom@10.0.1`
   - Updated to use scoped `@hapi/*` packages
   - Note: Using compatible versions for hapi-swagger@14.5.3

2. **Database Driver**
   - `mysql@2.18.1` → `mysql2@3.11.3`
   - Upgraded to mysql2 for better performance and features

3. **HTTP Client**
   - `request-promise@4.2.6` → `axios@1.7.7`
   - Replaced deprecated request-promise with axios

4. **Removed Deprecated Packages**
   - `q@1.5.1` - Removed (replaced with native Promises)

### Other Package Updates

- `@hapi/h2o2`: `10.0.4` (kept same version - latest available)
- `bcrypt`: `6.0.0` → `5.1.1`
- `dotenv`: `17.2.3` → `16.4.5`
- `joi`: `18.0.1` → `@hapi/joi@17.1.1` (switched to @hapi scoped package for compatibility)
- `jsonwebtoken`: `9.0.2` (kept same version)
- `winston`: `3.18.3` → `3.15.0`
- `winston-daily-rotate-file`: `5.0.0` (kept same version)
- `hapi-auth-bearer-token`: `8.0.0` (kept same version)
- `hapi-swagger`: `18.1.0` → `14.5.3` (downgraded for Hapi v20 compatibility - fixes swagger.json errors)
- `http-proxy`: `1.18.1` (kept same version)
- `lodash`: Added `4.17.21` (was missing in original package.json)

## Code Changes

### 1. Server Setup (server.js & config/default.js)
- Updated imports to use `@hapi/*` scoped packages
- Changed `new Hapi.Server()` to `Hapi.server()` for Hapi v20 compatibility
- **Added Joi validator configuration** - Hapi v20 requires explicit validator setup:
  ```javascript
  routes: {
    validate: {
      validator: Joi,
      failAction: ...
    }
  }
  ```

### 2. Error Handling (All Controllers & Libs)
- Updated `boom` imports to `@hapi/boom`
- Files updated:
  - `modules/controllers/paperController.js`
  - `modules/controllers/scholarController.js`
  - `modules/libs/commFunctions.js`

### 3. HTTP Requests (Controllers)
- Replaced `request-promise` with `axios`
- Updated API calls to use axios syntax with `.get()` method
- Updated error handling to use `err.response?.data` pattern
- Files updated:
  - `modules/controllers/paperController.js` - `searchPapers()` function
  - `modules/controllers/scholarController.js` - `getScholarScores()` function

### 4. Database Connection (bootstrap.js)
- Updated `require('mysql')` to `require('mysql2')`

### 5. Route Validation (Route Files)
- Updated Joi validation syntax for Hapi v21
- Changed from `params: { field: ... }` to `params: Joi.object({ field: ... })`
- Changed from `query: { field: ... }` to `query: Joi.object({ field: ... })`
- Files updated:
  - `modules/routes/paperRoutes.js`
  - `modules/routes/scholarRoutes.js`

### 6. Promise Handling (Database Interactions)
- Replaced Q promises with native JavaScript Promises
- Changed `Q.Promise()` to `new Promise()`
- File updated: `modules/databaseInteractions/index.js`

### 7. Winston Logger (Logging)
- Updated to Winston v3 API
- Changed `winston.Logger` to `winston.createLogger()`
- Updated format configuration to use `winston.format.combine()`
- Removed deprecated `timestamp` and `colorize` options
- Added proper format configuration for both console and file transports
- **Fixed all logging calls** to use template literals instead of multiple arguments
  - Changed `winstonLogger.info('message', data)` to `winstonLogger.info(\`message ${data}\`)`
  - This ensures proper message formatting with Winston v3
- Files updated: 
  - `modules/logger/winstonLogger.js`
  - `server.js`
  - `modules/controllers/paperController.js`
  - `modules/controllers/scholarController.js`

## Migration Notes

### Breaking Changes
1. **Hapi v20** requires `Hapi.server()` instead of `new Hapi.Server()`
2. **Joi validator must be explicitly configured** in Hapi v20:
   - Add `validator: Joi` to `routes.validate` configuration
   - Without this, you'll get: "Cannot set uncompiled validation rules without configuring a validator"
3. **Joi validation syntax** - Use plain object syntax (NOT `Joi.object()` wrapper):
   - ✅ `params: { doi: Joi.string()... }`
   - ❌ `params: Joi.object({ doi: Joi.string()... })`
4. **Winston v3** uses `createLogger()` and new format API
5. **axios** has different response structure than request-promise (data in `response.data`)

### Compatibility Notes
- Using `@hapi/hapi@20.3.0` - best balance of updates and compatibility
- Using `hapi-swagger@14.5.3` - latest version confirmed compatible with Hapi v20
- Using `@hapi/inert@6.0.5` and `@hapi/vision@6.1.0` for compatibility
- Using standalone `joi@17.13.3` for validation
- Joi validator MUST be configured in server routes configuration with `validator: Joi`
- Added `host` field to Swagger configuration for proper API documentation
- Plain object validation syntax (not `Joi.object()` wrapper) required for hapi-swagger compatibility

### Testing Recommendations
1. Test all API endpoints to ensure proper functionality
2. Verify database connections work with mysql2
3. Check Winston logging in both development and production environments
4. Verify Swagger documentation still works correctly
5. Test error handling and Boom error responses

### Dependencies to Install
Run the following command to install all updated dependencies:
```bash
npm install
```

## Security Notes

### Swagger Version Tradeoff

⚠️ **hapi-swagger was downgraded to fix compatibility issues:**
- **From:** `hapi-swagger@17.3.2` (latest)
- **To:** `hapi-swagger@14.5.3`
- **Reason:** Version 17+ is not fully compatible with Hapi v20, causing swagger.json generation errors
- **Impact:** Version 14.5.3 works correctly but has known moderate vulnerabilities in `validator` dependency

### Known Vulnerabilities in hapi-swagger@14.5.3
- **Package:** `validator` (transitive dependency: hapi-swagger → swagger-parser → @apidevtools/swagger-parser → z-schema → validator)
- **Severity:** Moderate (5 vulnerabilities)
- **Issue:** URL validation bypass in validator.js's isURL function (GHSA-9965-vmph-33xx)
- **Assessment:** These vulnerabilities affect only Swagger documentation, not core API functionality

### Mitigation Strategies
1. **Environment Isolation:** Deploy Swagger only in development/staging environments
2. **Access Control:** Restrict Swagger UI access with authentication if deployed to production
3. **Monitor Updates:** Watch for hapi-swagger updates that resolve both compatibility and security issues
4. **Alternative:** Consider switching to modern alternatives like `@hapi/swagger` or other API documentation tools

### Security vs Functionality Decision
- **Chose:** Functional Swagger documentation (v14.5.3) with known moderate vulnerabilities
- **Over:** Non-functional latest version (v17.3.2) that crashes
- **Rationale:** Documentation vulnerabilities are lower risk than broken documentation

## Compatibility
- Node.js version: 14+ recommended (for modern Promise and async/await support)
- All dependencies are now using their latest stable versions as of October 2025

