import express from "express"
import { createWriteStream } from "fs"
import {readdir, rm, rename, stat} from "fs/promises"
import cors from "cors"

const PORT = 3000

const app = express()

app.use(express.json())

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

app.use(cors())

// app.use((req, res, next) => {
//     if(req.query.action === "download"){
//         res.set("Content-Disposition", "attachment")
//     }
//     // const serveStatic = express.static("storage");
//     // serveStatic(req, res, next)
//      express.static("storage")(req, res, next)

// })

app.get("/directory{/:dirname}", async (req, res) => {
    const {dirname} = req.params
    console.log(dirname)
    const fullDirPath = `./storage/${dirname ? dirname : "" }`
    const filesList = await readdir(fullDirPath)
    const resList = []
    for(let item of filesList){
        const stats = await stat(`${fullDirPath}/${item}`)
        resList.push({name : item, isDirectory : stats.isDirectory()})
    }
    res.json(resList)
})

app.get("/files/:filename", (req, res) => {
    const {filename} = req.params
    if(req.query.action === "download"){
        res.set("Content-Disposition", "attachment")
    }
    res.sendFile(`${import.meta.dirname}/storage/${filename}`)
})

app.delete("/files/:filename", async (req, res) => {
    const {filename} = req.params
    const filePath = `${import.meta.dirname}/storage/${filename}`
    try{
         await rm(filePath)
    res.json({message: "File Deleted Successfully"})
    }catch(error){
        res.status(404).json({message : "File Not Found"})
    }
})

app.patch("/files/:filename", async (req, res) => {
    const {filename} = req.params
    const {newFilename} = req.body
   await rename(
           `./storage/${filename}`,
           `./storage/${newFilename}`
         );
    res.json({message : "File Renamed Successfully"})
 
})

app.post("/files/:filename", (req, res) => {
    const {filename} = req.params
   const writeStream = createWriteStream(`./storage/${filename}`)
   req.pipe(writeStream)
   req.on('end', () => {
        res.json({message : "File Uploaded successfully"})
   })

})



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})