import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (user, res) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set the JWT token as an HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'Production',  // Secure in production
        sameSite: 'strict',  // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
};
