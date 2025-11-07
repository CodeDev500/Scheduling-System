# Cloudinary Setup Guide

This application uses Cloudinary for image storage instead of local file storage, which is required for deployment on platforms like Vercel that don't support persistent file storage.

## Why Cloudinary?

- **Vercel Limitation**: Vercel's serverless functions don't support writing to the local filesystem
- **Scalability**: Cloud storage is more scalable and reliable
- **Performance**: CDN-backed image delivery for faster load times
- **Features**: Built-in image optimization and transformations

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. After signing up, you'll be redirected to your dashboard

### 2. Get Your Credentials

On your Cloudinary dashboard, you'll find:
- **Cloud Name**
- **API Key**
- **API Secret**

### 3. Configure Environment Variables

#### Server (.env)

Add these variables to your `server/.env` file:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Replace the values with your actual Cloudinary credentials from the dashboard.

### 4. Folder Structure in Cloudinary

The application automatically organizes uploaded images in the following folder:
- `optisched/profiles` - User profile images

### 5. Image Settings

Current configuration:
- **Allowed formats**: jpg, jpeg, png, gif, webp
- **Max file size**: 5MB
- **Auto-resize**: Images are automatically resized to 500x500px (maintains aspect ratio)

## Testing

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. Test image upload through registration:
   - Go to the registration page
   - Upload a profile image
   - Check your Cloudinary dashboard to see the uploaded image in `optisched/profiles`

## Troubleshooting

### Error: "Cloudinary credentials not found"
- Make sure you've added all three environment variables to your `.env` file
- Restart your server after adding the variables

### Error: "Only image files are allowed"
- Ensure you're uploading an image file (jpg, png, gif, webp)
- Check that the file is under 5MB

### Images not appearing
- Check your Cloudinary dashboard to verify the upload was successful
- Verify the image URL is being saved to the database
- Check browser console for CORS or network errors

## Migration from Local Storage

If you have existing images in the `uploads` folder:

1. The old images will still work locally but won't be accessible on Vercel
2. Users will need to re-upload their profile images
3. Alternatively, you can manually upload existing images to Cloudinary and update the database URLs

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Storage Cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
