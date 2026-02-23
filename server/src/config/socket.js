const { Server } = require('socket.io');
const { supabaseAdmin } = require('./supabase');

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Supabase token auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            if (!supabaseAdmin) {
                return next(new Error('Auth not configured'));
            }

            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
            if (error || !user) {
                return next(new Error('Invalid token'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.user.id}`);

        // Auto-join user's personal channel
        socket.join(`user:${socket.user.id}`);

        // Join a ride room (for real-time ride updates)
        socket.on('join:ride', (rideId) => {
            socket.join(`ride:${rideId}`);
            console.log(`  ↳ Joined ride:${rideId}`);
        });

        socket.on('leave:ride', (rideId) => {
            socket.leave(`ride:${rideId}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.user.id}`);
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}

// Helper: emit to a specific user
function emitToUser(userId, event, data) {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
}

// Helper: emit to all users in a ride room
function emitToRide(rideId, event, data) {
    if (io) {
        io.to(`ride:${rideId}`).emit(event, data);
    }
}

module.exports = { initSocket, getIO, emitToUser, emitToRide };
