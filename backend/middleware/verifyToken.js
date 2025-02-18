import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded._id };
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ success: false, msg: 'Token is not valid' });
    }
}