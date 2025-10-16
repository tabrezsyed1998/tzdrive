import express from "express";
import { readdir, stat, mkdir } from "fs/promises";
import path from "path";

const router = express.Router();
// Get directory
router.get("/{*dirname}", async (req, res) => {
  const dirname = Array.isArray(req.params.dirname)
    ? req.params.dirname.join("/")
    : req.params.dirname || "";
  const dirPath = path.join("/", dirname);
  const fullDirPath = `./storage/${dirPath ? dirPath : ""}`;
  try {
    const filesList = await readdir(fullDirPath);
    const resList = [];
    for (let item of filesList) {
      const stats = await stat(`${fullDirPath}/${item}`);
      resList.push({ name: item, isDirectory: stats.isDirectory() });
    }
    res.json(resList);
  } catch (error) {
    res.json({ message: error.message });
  }
});

// Create directory
router.post("/{*dirname}", async (req, res) => {
  try {
    const dirname = Array.isArray(req.params.dirname)
      ? req.params.dirname.join("/")
      : req.params.dirname || "";
    const dirPath = path.join("/", dirname);
    await mkdir(`./storage/${dirPath}`);
    res.json({ message: "Directory Created" });
  } catch (error) {
    res.json({ err: error.message });
  }
});

export default router;
