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
  if(!fileData){
    return res.status(404).json({message : "File not found"})
  }
  console.log(fileData) 
  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename=${fileData.name}` );
  }
  return res.sendFile(`${process.cwd()}/storage/${id}${fileData.extention}`, (error) => {
    if(!res.headersSent && error){
     return res.status(404).json({error: "File not found"})
    }
  });
});

// delete file and directory
router.delete("/:id", async (req, res, next) => {
  const {id} = req.params
  const fileIndex = filesData.findIndex((file) => file.id === id)
  if(fileIndex === -1){
    return res.status(400).json({message : "File not found"})
  }
  const fileData = filesData[fileIndex]
  try {
    await rm(`./storage/${id}${fileData.extention}`, { recursive: true });
    filesData.splice(fileIndex, 1)
    const parentDirData = directoriesData.find((directory) => directory.id === fileData.parentDirId)
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id)
    await writeFile("./filesDB.json", JSON.stringify(filesData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (error) {
      next(error)
  }
});

// Reanme file or directory
router.patch("/:id", async (req, res, next) => {
  const { newFilename } = req.body;
  const {id} = req.params
  const fileData = filesData.find((file) =>  file.id === id)
  fileData.name = newFilename
  try{
    await writeFile('./filesDB.json', JSON.stringify(filesData))
   return  res.status(200).json({ message: "File Renamed Successfully" });

  }catch(error){
    error.status = 500
    next(error)
  }
});

// Upload files in direcotry
router.post("/{:parentDirId}", (req, res, next) => {
  const  parentDirId  = req.params.parentDirId || directoriesData[0].id;
  const filename = req.headers.filename || "untitled"
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
   
    try{
    await writeFile("./filesDB.json", JSON.stringify(filesData))
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData))
    return res.status(201).json({ message: "File Uploaded successfully" });
    }catch(error){
      next(error)
    }
    
  });
});

export default router;
