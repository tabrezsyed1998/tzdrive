import express from "express";
import { createWriteStream } from "fs";
import { rm, rename } from "fs/promises";
import path from "path";

const router = express.Router();

// Get files from directory
router.get("/{*filePath}", (req, res) => {
  const filePath = Array.isArray(req.params.filePath)
    ? req.params.filePath.join("/")
    : req.params.filePath || "";
  const normalFilepath = path.join("/", filePath);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${normalFilepath}`, (error) => {
    if (error) {
      res.json({ message: "File Not Found" });
    }
  });
});

// delete file and directory
router.delete("/{*filename}", async (req, res) => {
  const filename = Array.isArray(req.params.filename)
    ? req.params.filename.join("/")
    : req.params.filename || "";
  const normalFilepath = path.join("/", filename);
  const filePath = `${import.meta.dirname}/storage/${normalFilepath}`;
  try {
    await rm(filePath, { recursive: true });
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

// Reanme file or directory
router.patch("/{*filePath}", async (req, res) => {
  const { newFilename } = req.body;
  const filePath = Array.isArray(req.params.filePath)
    ? req.params.filePath.join("/")
    : req.params.filePath || "";
  const normalFilepath = path.join("/", filePath);
  await rename(`./storage/${normalFilepath}`, `./storage/${newFilename}`);
  res.json({ message: "File Renamed Successfully" });
});

// Upload files in direcotry
router.post("/{*filename}", (req, res) => {
  const filename = Array.isArray(req.params.filename)
    ? req.params.filename.join("/")
    : req.params.filename || "";
  const normalFileName = path.join("/", filename);
  const writeStream = createWriteStream(`./storage/${normalFileName}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.json({ message: "File Uploaded successfully" });
  });
});

export default router;
