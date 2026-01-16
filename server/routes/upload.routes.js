import express from "express";
import multer from "multer";
import { containerClient } from "../config/azureBlob.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    const cleanFilename = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const blobName = `uploads/${Date.now()}-${cleanFilename}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype,
      },
    });

    return res.status(200).send({
      message: "File uploaded successfully",
      fileUrl: blockBlobClient.url,
      fileType: req.file.mimetype,
      fileName: cleanFilename,
    });
  } catch (error) {
    console.error("Azure upload failed:", error);
    return res.status(500).send({ message: error.message });
  }
});

export default router;
