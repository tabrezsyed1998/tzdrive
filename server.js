import express from "express";
import { createWriteStream } from "fs";
import { readdir, rm, rename, stat, mkdir } from "fs/promises";
import cors from "cors";
import path from "path";

const PORT = 3000;

const app = express();

app.use(express.json());

// app.use((req, res, next) => {
//     // res.set("Access-Control-Allow-Origin", "*")
//     // res.set("Access-Control-Allow-Methods", "*")
//     res.set({
//         "Access-Control-Allow-Origin" : "*",
//         "Access-Control-Allow-Methods" : "*",
//         "Access-Control-Allow-Headers" : "*"
//     })
//     next()
// })

app.use(cors());

// app.use((req, res, next) => {
//     if(req.query.action === "download"){
//         res.set("Content-Disposition", "attachment")
//     }
//     // const serveStatic = express.static("storage");
//     // serveStatic(req, res, next)
//      express.static("storage")(req, res, next)

// })

// Get directory
app.get("/directory/{*dirname}", async (req, res) => {
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
app.post("/directory/{*dirname}", async (req, res) => {
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

// Get files from directory
app.get("/files/{*filePath}", (req, res) => {
  const filePath = Array.isArray(req.params.filePath)
    ? req.params.filePath.join("/")
    : req.params.filePath || "";
  const normalFilepath = path.join("/", filePath);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${normalFilepath}`, (error) => {
    if (error) {
      res.json({ message: "File Not Found" });
    }
  });
});

// delete file and directory
app.delete("/files/{*filename}", async (req, res) => {
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
app.patch("/files/{*filePath}", async (req, res) => {
  const { newFilename } = req.body;
  const filePath = Array.isArray(req.params.filePath)
    ? req.params.filePath.join("/")
    : req.params.filePath || "";
  const normalFilepath = path.join("/", filePath);
  await rename(`./storage/${normalFilepath}`, `./storage/${newFilename}`);
  res.json({ message: "File Renamed Successfully" });
});

// Upload files in direcotry
app.post("/files/{*filename}", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
