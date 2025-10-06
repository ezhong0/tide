"use strict";
/**
 * Express/Fastify middleware for request validation
 * Ensures all API inputs are validated at the boundary
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
exports.validateResponse = validateResponse;
exports.validateFullRequest = validateFullRequest;
exports.createTypedHandler = createTypedHandler;
// Generic validation middleware for Express
function validateRequest(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    error: 'Validation error',
                    details: result.error.format(),
                    issues: result.error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    }))
                });
            }
            // Replace body with parsed and validated data
            req.body = result.data;
            next();
        }
        catch (error) {
            return res.status(500).json({
                error: 'Internal validation error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
// Validate query parameters
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                return res.status(400).json({
                    error: 'Query validation error',
                    details: result.error.format()
                });
            }
            req.query = result.data;
            next();
        }
        catch (error) {
            return res.status(500).json({
                error: 'Internal validation error'
            });
        }
    };
}
// Validate route parameters
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                return res.status(400).json({
                    error: 'Parameter validation error',
                    details: result.error.format()
                });
            }
            req.params = result.data;
            next();
        }
        catch (error) {
            return res.status(500).json({
                error: 'Internal validation error'
            });
        }
    };
}
// Validate response before sending
function validateResponse(schema) {
    return (data) => {
        const result = schema.safeParse(data);
        if (!result.success) {
            console.error('Response validation failed:', result.error);
            throw new Error('Response validation failed');
        }
        return result.data;
    };
}
function validateFullRequest(validation) {
    return async (req, res, next) => {
        try {
            // Validate body if schema provided
            if (validation.body) {
                const bodyResult = validation.body.safeParse(req.body);
                if (!bodyResult.success) {
                    return res.status(400).json({
                        error: 'Body validation error',
                        details: bodyResult.error.format()
                    });
                }
                req.body = bodyResult.data;
            }
            // Validate query if schema provided
            if (validation.query) {
                const queryResult = validation.query.safeParse(req.query);
                if (!queryResult.success) {
                    return res.status(400).json({
                        error: 'Query validation error',
                        details: queryResult.error.format()
                    });
                }
                req.query = queryResult.data;
            }
            // Validate params if schema provided
            if (validation.params) {
                const paramsResult = validation.params.safeParse(req.params);
                if (!paramsResult.success) {
                    return res.status(400).json({
                        error: 'Parameter validation error',
                        details: paramsResult.error.format()
                    });
                }
                req.params = paramsResult.data;
            }
            next();
        }
        catch (error) {
            return res.status(500).json({
                error: 'Internal validation error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
// Helper to create typed route handlers
function createTypedHandler(config) {
    return [
        validateFullRequest({
            body: config.body,
            query: config.query,
            params: config.params
        }),
        async (req, res) => {
            try {
                const result = await config.handler(req);
                // Validate response if schema provided
                if (config.response) {
                    const validatedResponse = validateResponse(config.response)(result);
                    return res.json(validatedResponse);
                }
                return res.json(result);
            }
            catch (error) {
                console.error('Handler error:', error);
                return res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    ];
}
//# sourceMappingURL=middleware.js.map