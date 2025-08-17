const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images for product image and certificates
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  // Allow PDFs for certificates
  const allowedDocTypes = ["application/pdf"];

  const allAllowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only jpg, png, webp, and pdf are allowed."),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

// Configuration for multiple files
const uploadFields = upload.fields([
  { name: "file", maxCount: 1 }, // Main product image
  { name: "certificate", maxCount: 1 }, // Certificate file
  { name: "hplc", maxCount: 1 }, // HPLC file
  { name: "massSpectrometry", maxCount: 1 }, // Mass Spectrometry file
]);

module.exports = { upload, uploadFields };
