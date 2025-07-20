const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("receipt"), async (req, res) => {
  try {
    const imagePath = path.join(__dirname, "..", req.file.path);
    const { data: { text } } = await Tesseract.recognize(imagePath, "eng");

    fs.unlinkSync(imagePath); // delete temp file

    const totalLine = text.split("\n").find(line =>
      line.toLowerCase().includes("total") ||
      line.toLowerCase().includes("amount")
    );
    const amount = totalLine?.match(/[\d,.]+/)?.[0] || "0";

    res.json({
      success: true,
      data: {
        rawText: text,
        extractedAmount: amount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to scan receipt." });
  }
});

module.exports = router;
