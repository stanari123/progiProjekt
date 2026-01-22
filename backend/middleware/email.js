import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

export async function sendEmail(to, subject, html) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "noreply.stanblog@gmail.com",
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: "StanBlog < noreply.stanblog@gmail.com",
            to: to,
            subject: subject,
            html,
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.log("Error sending email:", error);
        throw error;
    }
}
