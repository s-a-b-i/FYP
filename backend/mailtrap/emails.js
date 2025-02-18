import { Client } from "./mailtrap.config.js";
import { sender } from "./mailtrap.config.js";
import { PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE } from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];

    try {
        const response = await Client.send({
            from: sender,
            to: recipient,
            subject: "Verify Your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        });

        console.log("Email sent successfully:", response);
        return true; // Indicate success

    } catch (error) {
        // Log a detailed error message
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Mailtrap API Error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received from Mailtrap API. Request details:", error.request);
        } else {
            // Something else happened in setting up the request
            console.error("Error setting up the request:", error.message);
        }

        // Optional: Send a user-friendly error message or log it for further debugging
        console.error("Failed to send verification email. Detailed error:", error);
        return false; // Indicate failure
    }
};



export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];

    // Personalize the welcome email template
    const personalizedWelcomeEmail = WELCOME_EMAIL_TEMPLATE
        .replace("{userName}", name)
        .replace("{appURL}", "https://yourapp.com/dashboard")
        .replace(/{appName}/g, "Your App")
        .replace("{facebookURL}", "https://facebook.com/yourapp")
        .replace("{twitterURL}", "https://twitter.com/yourapp")
        .replace("{instagramURL}", "https://instagram.com/yourapp");

    try {
        const response = await Client.send({
            from: sender,
            to: recipient,
            subject: "Welcome to Your App!",
            html: personalizedWelcomeEmail,
            category: "Welcome Email",
        });

        console.log("Welcome email sent successfully:", response);
        return true; // Indicate success

    } catch (error) {
        // Log a detailed error message
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Mailtrap API Error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received from Mailtrap API. Request details:", error.request);
        } else {
            // Something else happened in setting up the request
            console.error("Error setting up the request:", error.message);
        }

        // Optional: Send a user-friendly error message or log it for further debugging
        console.error("Failed to send welcome email. Detailed error:", error);
        return false; // Indicate failure
    }
};



export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];

    try {
        const response = await Client.send({
            from: sender,
            to: recipient,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset",
        });

        console.log("Password reset email sent successfully:", response);
        return true; // Indicate success

    } catch (error) {
        // Log a detailed error message
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Mailtrap API Error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received from Mailtrap API. Request details:", error.request);
        } else {
            // Something else happened in setting up the request
            console.error("Error setting up the request:", error.message);
        }

        // Optional: Send a user-friendly error message or log it for further debugging
        console.error("Failed to send password reset email. Detailed error:", error);
        return false; // Indicate failure
    }
}



export const sendPasswordChangedEmail = async (email) => {
    const recipient = [{ email }];

    try {
        const response = await Client.send({
            from: sender,
            to: recipient,
            subject: "Password Changed",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Changed",
        });

        console.log("Password changed email sent successfully:", response);
        return true; // Indicate success

    } catch (error) {
        // Log a detailed error message
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Mailtrap API Error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received from Mailtrap API. Request details:", error.request);
        } else {
            // Something else happened in setting up the request
            console.error("Error setting up the request:", error.message);
        }   

        // Optional: Send a user-friendly error message or log it for further debugging
        console.error("Failed to send password changed email. Detailed error:", error);
        return false; // Indicate failure
    }
}