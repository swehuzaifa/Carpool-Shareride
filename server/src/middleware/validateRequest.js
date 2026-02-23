/**
 * Joi validation middleware factory
 * Usage: validateRequest(schema) or validateRequest(schema, 'query')
 */
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors,
                },
            });
        }

        // Replace with validated/sanitized data
        req[property] = value;
        next();
    };
};

module.exports = { validateRequest };
