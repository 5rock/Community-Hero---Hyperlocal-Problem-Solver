import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        # Allow enabling/disabling real SMTP via env vars
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@communityhero.ai")
        self.is_configured = bool(
            self.smtp_host and self.smtp_user and self.smtp_password
        )

    def send_issue_confirmation(
        self,
        to_email: str,
        issue_id: int,
        title: str,
        category: str,
        severity: str,
        repair_time: str,
    ):
        subject = f"Issue Received: #{issue_id} - {title}"

        # HTML Content based on the requested template
        html_content = f"""
        <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px;">
                <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="background-color: #8b5cf6; padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Community Hero AI</h1>
                        <p style="color: #e2e8f0; margin-top: 5px; font-size: 14px;">Powered by AI for Smarter Communities</p>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #0f172a; margin-top: 0;">We've received your report!</h2>
                        <p style="color: #475569; line-height: 1.6;">Thank you for helping improve our community. Your issue has been successfully logged and analyzed by our AI system.</p>
                        
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 40%;">Issue Tracking ID:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">#{issue_id}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold;">AI Category:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">{category}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold;">AI Severity:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">
                                        <span style="background-color: {'#fee2e2' if severity == 'Critical' else '#ffedd5' if severity == 'High' else '#fef9c3'}; color: {'#ef4444' if severity == 'Critical' else '#f97316' if severity == 'High' else '#eab308'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                            {severity}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Est. Review Time:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">{repair_time}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173/dashboard/issues/{issue_id}" style="background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Track My Report</a>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2024 Community Hero AI. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        self._send_email(to_email, subject, html_content)

    def send_password_reset(self, to_email: str, reset_token: str):
        frontend_url = os.getenv("CLIENT_URL", "http://localhost:5173")
        subject = "Reset your Community Hero AI password"
        html_content = (
            "<p>A password reset was requested for your account.</p>"
            f"<p>Your one-time recovery code is: <strong>{reset_token}</strong></p>"
            "<p>This code expires in 15 minutes. If you did not request this, ignore this email.</p>"
            f'<p><a href="{frontend_url}/forgot-password">Reset password</a></p>'
        )
        self._send_email(to_email, subject, html_content)

    def _send_email(self, to_email: str, subject: str, html_content: str):
        if not self.is_configured:
            # Fallback to logger for local development without credentials
            logger.info("==========================================")
            logger.info("EMAIL SERVICE (MOCK MODE)")
            logger.info(f"To: {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info("Content (HTML): (Omitted for brevity)")
            logger.info("==========================================")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email

            part2 = MIMEText(html_content, "html")
            msg.attach(part2)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            logger.info(f"Email sent successfully to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")


email_service = EmailService()
