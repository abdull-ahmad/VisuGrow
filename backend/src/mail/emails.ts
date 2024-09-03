import { VERIFICATION_EMAIL_TEMPLATE , PASSWORD_RESET_REQUEST_TEMPLATE , PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate";
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


export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
    const recipient = email;
    try{
        const response = await transport.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: recipient,
            subject: "Password Reset",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
        });
        console.log("Email sent Succesfully", response);
    }catch(error){
        success: false;
        console.log("Email not sent",error);
        throw new Error(`Email not sent: ${error} `);
    }

}

export const sendResetSuccessEmail = async (email: string) => {
    const recipient = email;
    try{
        const response = await transport.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });
        console.log("Email sent Succesfully", response);
    }catch(error){
        success: false;
        console.log("Email not sent",error);
        throw new Error(`Email not sent: ${error} `);
    }

}