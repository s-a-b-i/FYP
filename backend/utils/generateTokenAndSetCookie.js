// utils/generateTokenAndSetCookie.js
import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, isAdmin, res) => {
    const token = jwt.sign(
        { 
            _id: userId,
            isAdmin: isAdmin // Include admin status in token
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
};