import express from "express";
import { readdir, stat, mkdir } from "fs/promises";
import path from "path";
import directoriesData from "../directoriesDB.json" with {type: "json"};
import filesData from "../filesDB.json" with {type : "json"}

const router = express.Router();
// Get directory
router.get("{/:id}", async (req, res) => {
    const {id} = req.params
    if(!id){
        const directoryData = directoriesData[0]
        const files = directoryData.files.map((fileId) => 
            filesData.find((file) => file.id === fileId)
        )
        res.json({...directoryData, files})

    }else{
        const directoryData = directoriesData.find((folder) => folder.id === id)
        res.json(directoryData)
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
