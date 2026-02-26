import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_password_reset_email(email_to: str, token: str) -> bool:
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    subject = "Password Reset Request - AILand"
    html_content = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>This link will expire in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    </body>
    </html>
    """
    
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    # Try port 465 (SSL) first, then fall back to port 587 (STARTTLS)
    for attempt in ("ssl", "starttls"):
        try:
            if attempt == "ssl":
                with smtplib.SMTP_SSL(settings.SMTP_HOST, 465, timeout=15) as server:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, message.as_string())
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, message.as_string())
            print(f"Email sent successfully via {attempt} to {email_to}")
            return True
        except Exception as e:
            print(f"Failed to send email via {attempt}: {e}")
            continue
    
    print(f"All email delivery attempts failed for {email_to}")
    return False



