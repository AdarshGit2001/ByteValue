import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import appraisalRouter from "./routes/appraisal.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, service: "bytevalue-backend" });
});

app.use("/api/appraisal", appraisalRouter);

app.use((error, _req, res, _next) => {
  if (error?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Unexpected backend error.",
    error: error instanceof Error ? error.message : "Unknown error",
  });
});

app.listen(port, () => {
  console.log(`ByteValue backend running on http://localhost:${port}`);
});
