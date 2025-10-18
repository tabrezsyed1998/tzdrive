import express from "express";
import { createWriteStream, write } from "fs";
import { rm, rename, writeFile } from "fs/promises";
import path from "path";
import filesData from "../filesDB.json" with {type : "json"}
import directoriesData from "../directoriesDB.json" with {type : "json"}


const router = express.Router();

// Get files from directory
router.get("/:id", (req, res) => {
  const {id} = req.params
  const fileData = filesData.find((file) => file.id === id)
  console.log(fileData) 
  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename=${fileData.name}` );
  }
  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extention}`, (error) => {
    // if (error) {
    //   res.json({ message: "File Not Found" });
    // }
    if(!res.headersSent){
      res.json({error: "File not found"})
    }
  });
});

// delete file and directory
router.delete("/:id", async (req, res) => {
  // const filename = Array.isArray(req.params.filename)
  //   ? req.params.filename.join("/")
  //   : req.params.filename || "";
  // const normalFilepath = path.join("/", filename);
  // const filePath = `${import.meta.dirname}/storage/${normalFilepath}`;
  const {id} = req.params
  const fileIndex = filesData.findIndex((file) => file.id === id)
  const fileData = filesData[fileIndex]
  try {
    await rm(`./storage/${id}${fileData.extention}`, { recursive: true });
    filesData.splice(fileIndex, 1)
    const parentDirData = directoriesData.find((directory) => directory.id === fileData.parentDirId)
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id)
    await writeFile("./filesDB.json", JSON.stringify(filesData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    res.json({ message: "File Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

// Reanme file or directory
router.patch("/:id", async (req, res) => {
  const { newFilename } = req.body;
  // const filePath = Array.isArray(req.params.filePath)
  //   ? req.params.filePath.join("/")
  //   : req.params.filePath || "";
  // const normalFilepath = path.join("/", filePath);
  const {id} = req.params
  const fileData = filesData.find((file) =>  file.id === id)
  fileData.name = newFilename
  await writeFile('./filesDB.json', JSON.stringify(filesData))
  // await rename(`./storage/${normalFilepath}`, `./storage/${newFilename}`);
  res.json({ message: "File Renamed Successfully" });
});

// Upload files in direcotry
router.post("/:filename", (req, res) => {
  const { filename } = req.params;
  const parentDirId = req.headers.parentdirid || directoriesData[0].id
  const extention = path.extname(filename);
  const id = crypto.randomUUID();
  const fullFileName = `${id}${extention}`;
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on("end", async() => {
    filesData.push({
        id,
        extention,
        name: filename,
        parentDirId
        
    })
    const parentDirData = directoriesData.find((directoryData) => directoryData.id === parentDirId);
    parentDirData.files.push(id)
    await writeFile("./filesDB.json", JSON.stringify(filesData))
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData))
    res.json({ message: "File Uploaded successfully" });
  });
});

export default router;
