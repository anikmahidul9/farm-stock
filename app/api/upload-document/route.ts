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
    const documentType = formData.get('documentType') as string; // e.g., 'tradeLicense', 'nationalId'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required.' }, { status: 400 });
    }

    // Convert file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `farm-stock/verification-documents/${documentType}`, // Dynamic folder based on document type
          resource_type: 'auto', // Automatically detect file type (image, pdf, etc.)
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary document upload error:', error);
            return reject(error);
          }
          resolve(uploadResult);
        }
      ).end(buffer);
    });

    // @ts-ignore
    return NextResponse.json({ documentUrl: result.secure_url });
  } catch (error) {
    console.error('API Route Error (upload-document):', error);
    return NextResponse.json({ error: 'Document upload failed.' }, { status: 500 });
  }
}
