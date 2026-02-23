const { supabaseAdmin } = require('../config/supabase');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { message: 'Missing or invalid authorization header' },
            });
        }

        const token = authHeader.split(' ')[1];

        if (!supabaseAdmin) {
            return res.status(503).json({
                success: false,
                error: { message: 'Auth service not configured' },
            });
        }

        // Verify token via Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Invalid or expired token' },
            });
        }

        // Fetch profile from profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(401).json({
                success: false,
                error: { message: 'User profile not found' },
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            ...profile,
        };

        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({
            success: false,
            error: { message: 'Authentication failed' },
        });
    }
};

module.exports = { verifyToken };
