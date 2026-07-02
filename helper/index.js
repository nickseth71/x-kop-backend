// import multer from "multer";
// import path from "path";
// import { S3Client } from "@aws-sdk/client-s3";
// import multerS3 from "multer-s3";

// const configureUploadMiddleware = () => {
//   const s3 = new S3Client({
//     credentials: {
//       secretAccessKey: process.env.AWS_SECRETACCESSKEY,
//       accessKeyId: process.env.AWS_ACCESSKEYID,
//     },
//     region: process.env.AWS_REGION,
//   });

//   const storage = multerS3({
//     s3,
//     bucket: process.env.AWS_BUCKETNAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, `${Date.now().toString()}_${file.originalname}`);
//     },
//   });

//   const checkFileType = (file, cb) => {
//     const filetypes = /jpeg|jpg|png|gif|mp4|mov|pdf|csv|doc|docx/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (extname && mimetype) {
//       return cb(null, true);
//     } else {
//       cb("Error: Only specific file types allowed (jpeg, jpg, png, gif, mp4, mov, pdf, csv, doc, docx)");
//     }
//   };

//   const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//       checkFileType(file, cb);
//     },
//     limits: { fileSize: 500 * 1024 * 1024 },
//   });

//   return {
//     singleFileUpload: upload.single('file'),
//     multipleFileUpload: upload.array('files', 10),
//   };
// };

// export default configureUploadMiddleware;

import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

// Configure the S3 client and multer storage
const configureUploadMiddleware = () => {
  // console.log("AWS_ACCESSKEYID:", process.env.AWS_ACCESSKEYID);
  // console.log(
  //   "AWS_SECRETACCESSKEY:",
  //   process.env.AWS_SECRETACCESSKEY ? "***HIDDEN***" : "NOT SET"
  // );
  // console.log("AWS_REGION:", process.env.AWS_REGION);
  const s3 = new S3Client({
    credentials: {
      secretAccessKey: process.env.AWS_SECRETACCESSKEY,
      accessKeyId: process.env.AWS_ACCESSKEYID,
    },
    region: process.env.AWS_REGION,
  });

  const upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKETNAME || "x-kop-bucket",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(null, `${Date.now().toString()}_${file.originalname}`);
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB file size limit
  });

  return {
    singleFileUpload: upload.single("file"),
    multipleFileUpload: upload.array("files", 10),
  };
};

export default configureUploadMiddleware;
