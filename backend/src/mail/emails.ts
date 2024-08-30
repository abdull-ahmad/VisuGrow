import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate";
import { sender, transport } from "./nodeMailer";

export const sendEmailVerification = async (email: string, token: string) => {
    const recipient = email ;
    try{
        const response = await transport.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: recipient,
            subject: "Email Verification",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", token),
        });
        console.log("Email sent Succesfully", response);
    }catch(error){
        success: false;
        console.log("Email not sent",error);
        throw new Error(`Email not sent: ${error} `);
    }
}