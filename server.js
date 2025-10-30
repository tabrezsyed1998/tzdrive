import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

const PORT = 3000;

const app = express();

app.use(express.json());

app.use(cors());

app.use("/directory", directoryRoutes);
app.use("/file", fileRoutes);

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
