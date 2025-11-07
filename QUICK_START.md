# Quick Start Guide - Cloudinary Setup

## 🚀 Get Started in 5 Minutes

### Step 1: Create Cloudinary Account
1. Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up (it's free!)
3. You'll be redirected to your dashboard

### Step 2: Get Your Credentials
On your Cloudinary dashboard, you'll see:
```
Cloud name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

### Step 3: Add to Your .env File
Open `server/.env` and add:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"
```

### Step 4: Test It!
```bash
# Start the server
cd server
npm run dev

# In another terminal, start the client
cd client
npm run dev
```

### Step 5: Verify
1. Open your app in the browser
2. Register a new user with a profile picture
3. Check your Cloudinary dashboard - you should see the uploaded image!

## ✅ That's It!

Your app now uses Cloudinary for image storage and is ready for Vercel deployment!

## 📝 Important Notes

- **Free tier**: 25GB storage, 25GB bandwidth/month
- **Image limit**: 5MB per image
- **Supported formats**: JPG, PNG, GIF, WEBP
- **Auto-resize**: Images automatically resized to 500x500px

## 🐛 Troubleshooting

### "Cloudinary credentials not found"
- Make sure you added all 3 variables to `.env`
- Restart your server after adding variables

### "Only image files are allowed"
- Upload JPG, PNG, GIF, or WEBP files only
- Make sure file is under 5MB

### Images not showing
- Check Cloudinary dashboard to see if upload succeeded
- Check browser console for errors
- Verify the image URL in your database

## 🚢 Ready to Deploy?

See `DEPLOYMENT_GUIDE.md` for complete Vercel deployment instructions.

## 📚 More Help?

- `CLOUDINARY_SETUP.md` - Detailed setup guide
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `CLOUDINARY_MIGRATION_SUMMARY.md` - Technical details

---

**Happy coding! 🎉**
