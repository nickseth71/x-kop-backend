import dotenv from "dotenv";
dotenv.config();
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";
console.log("DEBUG ENV:", {
  accessKeyId: process.env.AWS_ACCESSKEYID,
  secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  region: process.env.AWS_REGION,
});

const s3 = new S3Client({
  credentials: {
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
    accessKeyId: process.env.AWS_ACCESSKEYID,
  },
  region: process.env.AWS_REGION,
});

export default async function deleteFilesFromS3(fileUrls) {
  const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];

  const objectsToDelete = urls.map((fileUrl) => {
    const urlParts = new URL(fileUrl);
    const bucketName = urlParts.hostname.split(".")[0];
    const key = urlParts.pathname.substring(1);

    return { Key: key, Bucket: bucketName };
  });

  const bucketName = objectsToDelete[0].Bucket;
  const allFromSameBucket = objectsToDelete.every(
    (obj) => obj.Bucket === bucketName
  );

  if (!allFromSameBucket) {
    throw new Error(
      "All files must be in the same bucket for a single delete operation."
    );
  }

  const deleteParams = {
    Bucket: bucketName,
    Delete: {
      Objects: objectsToDelete.map((obj) => ({ Key: obj.Key })),
    },
  };

  try {
    const data = await s3.send(new DeleteObjectsCommand(deleteParams));
    // console.log("Files deleted successfully", data);
  } catch (err) {
    console.error("Error deleting files: ", err);
  }
}
