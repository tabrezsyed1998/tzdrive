import express from "express";
import { createWriteStream } from "fs";
import { readdir, rm, rename, stat, mkdir } from "fs/promises";
import cors from "cors";

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

app.get("/directory/{*dirname}", async (req, res) => {
  const dirname = Array.isArray(req.params.dirname)
    ? req.params.dirname.join("/")
    : req.params.dirname || "";
  const fullDirPath = `./storage/${dirname ? dirname : ""}`;
  const filesList = await readdir(fullDirPath);
  const resList = [];
  for (let item of filesList) {
    const stats = await stat(`${fullDirPath}/${item}`);
    resList.push({ name: item, isDirectory: stats.isDirectory() });
  }
  res.json(resList);
});

app.post("/directory/{*dirname}", async (req, res) => {
  try {
    const dirname = Array.isArray(req.params.dirname)
      ? req.params.dirname.join("/")
      : req.params.dirname || "";
    // console.log(dirname)
    await mkdir(`./storage/${dirname}`);
    res.json({ message: "Directory Created" });
  } catch (error) {
    res.json({err: error.message})
  }
});

app.get("/files/{*filePath}", (req, res) => {
  // const {filePath : path} = req.params
  // const actualPath = path[0]
  // console.log(actualPath)
  const filePath = Array.isArray(req.params.filePath)
    ? req.params.filePath.join("/")
    : req.params.filePath || "";
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filePath}`);
});

app.delete("/files/{*filename}", async (req, res) => {
  const filename = Array.isArray(req.params.filename)
    ? req.params.filename.join("/")
    : req.params.filename || "";
  // const {filename} = req.params
  const filePath = `${import.meta.dirname}/storage/${filename}`;
  try {
    await rm(filePath, { recursive: true });
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

app.patch("/files/{*filePath}", async (req, res) => {
  // const {filename} = req.params
  const { newFilename } = req.body;
  const filePath = Array.isArray(req.params.filePath)
    ? req.params.filePath.join("/")
    : req.params.filePath || "";
  console.log(newFilename, filePath);
  await rename(`./storage/${filePath}`, `./storage/${newFilename}`);
  res.json({ message: "File Renamed Successfully" });
});

app.post("/files/{*filename}", (req, res) => {
  const filename = Array.isArray(req.params.filename)
    ? req.params.filename.join("/")
    : req.params.filename || "";
  // const {filename} = req.params
  const writeStream = createWriteStream(`./storage/${filename}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.json({ message: "File Uploaded successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
