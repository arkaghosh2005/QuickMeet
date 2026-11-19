import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const MICROSOFT_USERINFO_URL = "https://graph.microsoft.com/v1.0/me";

const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;
const CLIENT_URL = process.env.CLIENT_URL?.split(",")[0]?.trim();

// Helper: generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Helper: redirect to frontend callback with token + user data
const redirectWithAuth = (res, user) => {
    const token = generateToken(user);
    const userData = JSON.stringify({ id: user._id, name: user.name, email: user.email });
    const params = new URLSearchParams({ token, user: userData });
    res.redirect(`${CLIENT_URL}/auth/callback?${params.toString()}`);
};

// Helper: redirect to frontend callback with error
const redirectWithError = (res, message) => {
    const params = new URLSearchParams({ error: message });
    res.redirect(`${CLIENT_URL}/auth/callback?${params.toString()}`);
};

// ─── GOOGLE ─────────────────────────────────────────────────────────────

const googleAuth = (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${SERVER_URL}/v1/auth/google/callback`,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

const googleCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return redirectWithError(res, "No authorization code received from Google.");

    try {
        // Exchange code for tokens
        const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${SERVER_URL}/v1/auth/google/callback`,
                grant_type: "authorization_code",
            }),
        });
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("Google token error:", tokenData);
            return redirectWithError(res, "Failed to authenticate with Google.");
        }

        // Get user info
        const userRes = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const profile = await userRes.json();

        if (!profile.email) {
            return redirectWithError(res, "Could not retrieve email from Google.");
        }

        // Find or create user
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Check if user exists with same email (link accounts)
            user = await User.findOne({ email: profile.email });
            if (user) {
                user.googleId = profile.id;
                if (user.authProvider === "local") user.authProvider = "google";
                await user.save();
            } else {
                user = await User.create({
                    name: profile.name,
                    email: profile.email,
                    googleId: profile.id,
                    authProvider: "google",
                });
            }
        }

        redirectWithAuth(res, user);
    } catch (err) {
        console.error("Google OAuth error:", err);
        redirectWithError(res, "Something went wrong during Google sign-in.");
    }
};

// ─── MICROSOFT ──────────────────────────────────────────────────────────

const microsoftAuth = (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        redirect_uri: `${SERVER_URL}/v1/auth/microsoft/callback`,
        response_type: "code",
        scope: "openid profile email User.Read",
        response_mode: "query",
        prompt: "consent",
    });
    res.redirect(`${MICROSOFT_AUTH_URL}?${params.toString()}`);
};

const microsoftCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return redirectWithError(res, "No authorization code received from Microsoft.");

    try {
        // Exchange code for tokens
        const tokenRes = await fetch(MICROSOFT_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.MICROSOFT_CLIENT_ID,
                client_secret: process.env.MICROSOFT_CLIENT_SECRET,
                redirect_uri: `${SERVER_URL}/v1/auth/microsoft/callback`,
                grant_type: "authorization_code",
                scope: "openid profile email User.Read",
            }),
        });
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("Microsoft token error:", tokenData);
            return redirectWithError(res, "Failed to authenticate with Microsoft.");
        }

        // Get user info
        const userRes = await fetch(MICROSOFT_USERINFO_URL, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const profile = await userRes.json();

        const email = profile.mail || profile.userPrincipalName;
        if (!email) {
            return redirectWithError(res, "Could not retrieve email from Microsoft.");
        }

        // Find or create user
        let user = await User.findOne({ microsoftId: profile.id });

        if (!user) {
            // Check if user exists with same email (link accounts)
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                user.microsoftId = profile.id;
                if (user.authProvider === "local") user.authProvider = "microsoft";
                await user.save();
            } else {
                user = await User.create({
                    name: profile.displayName || profile.givenName || "User",
                    email: email.toLowerCase(),
                    microsoftId: profile.id,
                    authProvider: "microsoft",
                });
            }
        }

        redirectWithAuth(res, user);
    } catch (err) {
        console.error("Microsoft OAuth error:", err);
        redirectWithError(res, "Something went wrong during Microsoft sign-in.");
    }
};

export { googleAuth, googleCallback, microsoftAuth, microsoftCallback };