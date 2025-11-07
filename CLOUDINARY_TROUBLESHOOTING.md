# Cloudinary Troubleshooting Guide

## Issue: "[object Object]" in console logs

This error means the Cloudinary environment variables aren't being loaded correctly.

### Solution 1: Check .env File Format

Your `.env` file should look like this (NO QUOTES):

```env
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

**❌ WRONG (with quotes):**
```env
CLOUDINARY_CLOUD_NAME="dxxxxxxxxxxxxx"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"
```

### Solution 2: Verify .env Location

Make sure your `.env` file is in the correct location:
```
server/
  ├── .env          ← Should be here
  ├── src/
  ├── package.json
  └── ...
```

### Solution 3: Restart Your Server

After updating `.env`, you MUST restart your server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Solution 4: Check for Typos

Common mistakes:
- Extra spaces: `CLOUDINARY_CLOUD_NAME = value` ❌
- Correct format: `CLOUDINARY_CLOUD_NAME=value` ✅
- Variable name typos
- Missing values

### Solution 5: Verify Credentials from Cloudinary

1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Login to your account
3. On the dashboard, you'll see:
   - **Cloud name** (e.g., `dxxxxxxxxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Reveal" to see it)

4. Copy these EXACTLY as shown (no quotes, no spaces)

### Solution 6: Check Server Logs

When you start your server, you should see:

**✅ Success:**
```
Server running on port 3001
✓ Cloudinary credentials loaded successfully
```

**❌ Error:**
```
Server running on port 3001
❌ Cloudinary credentials missing!
CLOUDINARY_CLOUD_NAME: ✗ Missing
CLOUDINARY_API_KEY: ✗ Missing
CLOUDINARY_API_SECRET: ✗ Missing
```

### Solution 7: Create .env from Template

If you don't have a `.env` file:

```bash
cd server
cp .env.example .env
```

Then edit `.env` with your actual credentials.

### Solution 8: Check .gitignore

Make sure `.env` is in your `.gitignore` so you don't accidentally commit it:

```
# .gitignore
.env
```

## Testing Your Configuration

After fixing, test with this simple script:

Create `server/test-cloudinary.js`:
```javascript
require('dotenv').config();

console.log('Testing Cloudinary Configuration:');
console.log('================================');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***hidden***' : 'NOT SET');
console.log('================================');

if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  console.log('✓ All credentials are set!');
} else {
  console.log('✗ Some credentials are missing!');
}
```

Run it:
```bash
node test-cloudinary.js
```

## Still Having Issues?

### Check for Hidden Characters

Sometimes copying from websites adds hidden characters. Try typing the values manually.

### Check File Encoding

Make sure your `.env` file is saved as UTF-8 without BOM.

### Check for Multiple .env Files

Make sure you don't have multiple `.env` files in different locations.

### Verify dotenv is Installed

```bash
npm list dotenv
```

Should show dotenv is installed. If not:
```bash
npm install dotenv
```

## Example Working .env File

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/optisched

# JWT Secrets
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_REFRESH_SECRET=my-super-secret-refresh-key-67890

# Email Configuration
EMAIL_USER=myemail@gmail.com
EMAIL_PASS=myapppassword1234

# Cloudinary Configuration (NO QUOTES!)
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# Server
PORT=3001
NODE_ENV=development
```

## Quick Fix Checklist

- [ ] `.env` file exists in `server/` directory
- [ ] No quotes around Cloudinary values
- [ ] No spaces around `=` sign
- [ ] Values copied exactly from Cloudinary dashboard
- [ ] Server restarted after changes
- [ ] Check server logs for success message

---

**Need more help?** Check the main `CLOUDINARY_SETUP.md` guide.
