import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'farm-stock' }, // Optional: specify a folder in Cloudinary
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(uploadResult);
        }
      ).end(buffer);
    });

    // @ts-ignore
    return NextResponse.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
  }
}
