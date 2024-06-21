import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: process.env.S3_REGION,
});
const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET, // Your S3 bucket name
    acl: 'public-read', // Make the uploaded file public
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set the content type
    key: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.size > 5 * 1024 * 1024) {
        cb(new Error(`File size too large. Maximum size allowed is 5 MB`));
      } else {
        cb(null, true);
      }
    },
  }),
});

export const uploadFiles = fields => {
  const uploadMiddleware = upload.fields(fields);

  return (req, res, next) => {
    uploadMiddleware(req, res, error => {
      if (error) {
        return res.status(500).json({ error: 'Upload failed', error });
      }

      next();
    });
  };
};