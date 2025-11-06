# EmailJS Setup Guide for Contact Form

## Overview
The Contact Us form now uses EmailJS to send messages directly to your email without needing a backend server.

## Setup Steps

### 1. Create an EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Add Email Service
1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email
5. Copy the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

```
Subject: {{subject}}

From: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
This message was sent from the OptiSched Contact Form
```

**Template Variables to use:**
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{subject}}` - Message subject
- `{{message}}` - Message content
- `{{to_name}}` - Recipient name (OptiSched Team)

4. Copy the **Template ID** (e.g., `template_xyz789`)

### 4. Get Your Public Key
1. Go to **Account** → **General**
2. Find your **Public Key** (also called User ID)
3. Copy it (e.g., `user_abc123xyz`)

### 5. Configure Environment Variables
1. Create a `.env` file in the `client` folder (if it doesn't exist)
2. Add your EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abc123xyz
```

3. Replace the placeholder values with your actual IDs from EmailJS

### 6. Test the Form
1. Restart your development server: `npm run dev`
2. Navigate to the Contact Us page
3. Fill out the form and submit
4. Check your email inbox for the message

## Template Parameters

The form sends these parameters to your EmailJS template:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `from_name` | Sender's full name | "John Doe" |
| `from_email` | Sender's email | "john@example.com" |
| `subject` | Message subject | "Question about scheduling" |
| `message` | Message content | "I have a question about..." |
| `to_name` | Recipient name | "OptiSched Team" |

## Troubleshooting

### Form not sending
- Check that all environment variables are set correctly
- Verify your EmailJS service is active
- Check browser console for error messages
- Ensure you're not exceeding EmailJS free tier limits (200 emails/month)

### Not receiving emails
- Check your spam/junk folder
- Verify the email template is configured correctly
- Test the template in EmailJS dashboard
- Ensure your email service is properly connected

### Environment variables not loading
- Make sure the `.env` file is in the `client` folder
- Variable names must start with `VITE_`
- Restart your development server after changing `.env`

## Free Tier Limits
- 200 emails per month
- 2 email services
- 2 email templates
- Basic support

For higher limits, consider upgrading to a paid plan.

## Security Notes
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Public key is safe to expose (it's meant to be public)
- Service ID and Template ID are also safe to expose

## Additional Resources
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Dashboard](https://dashboard.emailjs.com/)
- [EmailJS React Guide](https://www.emailjs.com/docs/examples/reactjs/)
