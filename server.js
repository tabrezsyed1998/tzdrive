import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

const PORT = 3000;

const app = express();

app.use(express.json());

app.use(cors());

app.use("/directory", directoryRoutes);
app.use("/files", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
