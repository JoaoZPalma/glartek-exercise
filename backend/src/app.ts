import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import cronRoutes from "./routes/cronRoutes";
import { loadCrons } from "./config/scheduler";

dotenv.config();

const app = express();
app.use(cors(
  {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }
));
app.use(express.json());
app.use("/crons", cronRoutes);

export async function startServer() {
  await connectDB(process.env.MONGO_URI || "");
  await loadCrons();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
