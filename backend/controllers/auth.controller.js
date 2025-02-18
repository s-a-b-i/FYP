import { User } from "../models/user.model.js";
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js";
import {sendPasswordResetEmail, sendVerificationEmail } from "../mailtrap/emails.js";
import {sendPasswordChangedEmail} from "../mailtrap/emails.js";
import {sendWelcomeEmail} from "../mailtrap/emails.js";
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if all fields are present
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Please enter all fields" });
        }

        // Check if user already exists with findOne
        const userAlreadyExists = await User.findOne({ email });

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, msg: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Generate verification token (6-digit code)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpireAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });

        // Save user in the database
        await newUser.save();

        // Generate token and set it in the cookie
        generateTokenAndSetCookie(newUser._id, res);


        // Send verification email
        await sendVerificationEmail(newUser.email, verificationToken);


        res.status(201).json({ success: true, msg: "User created successfully", user: {
            ...newUser._doc,
            password: undefined
        } });

    } catch (error) {
        console.error(error);  // Log the actual error
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
}


export const veifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
             verificationToken: code ,
             verificationTokenExpireAt: {$gt: Date.now()
             }}); 
        
             if (!user) {
                 return res.status(400).json({ success: false, msg: "Invalid verification code" });
             }

             user.isVerified = true;
             user.verificationToken = undefined;
             user.verificationTokenExpireAt = undefined;
             await user.save();
             
             await sendWelcomeEmail(user.email , user.name);

             res.status(200).json({ success: true, msg: "Email verified successfully. Welcome to our community!", 
                user : {
                    ...user._doc,
                    password: undefined
                }

              });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Server error. Please try again later." });  
    }
       
}



export const login = async (req, res) => {
    const {email , password} = req.body;

    try {

        // Check if email and password are present
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "Please enter all fields" });
        }

        // Check if user exists with findOne
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, msg: "Invalid email or password" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, msg: "Invalid email or password" });
        }

        generateTokenAndSetCookie(user._id, res);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ success: true, msg: "User logged in successfully", user: {
            ...user._doc,
            password: undefined
        } });


        
    } catch (error) {

        res.status(500).json({ success: false, msg: "error.message" });
        
    }
}


export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, msg: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");

        const resetTokenExpireAt = Date.now() + (10 * 60 * 1000); // 10 minutes 

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpireAt = resetTokenExpireAt;
        await user.save(); 

        // Create resetURL
        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send password reset email
        await sendPasswordResetEmail(user.email, resetURL);

        res.status(200).json({ success: true, msg: "Password reset email sent" });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
}



export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    try {
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpireAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, msg: "Invalid or expired reset token" });
        }   

        const hashedPassword = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpireAt = undefined;
        await user.save();

        await sendPasswordChangedEmail(user.email);

        res.status(200).json({ success: true, msg: "Password reset successfully" });

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
}


export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in checkAuth:", error);
        res.status(500).json({ success: false, msg: error.message });
    }
}
export const logout = (req, res) => { 
    res.clearCookie("token");
    res.status(200).json({ success: true, msg: "User logged out successfully" });
}