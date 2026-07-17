import express from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import {
  APPRAISAL_RESPONSE_JSON_SCHEMA,
  APPRAISAL_SYSTEM_INSTRUCTION,
  buildAppraisalUserPrompt,
  parseAndValidateAppraisalResponse,
} from "../lib/appraisal-contract.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.");
  }

  return new GoogleGenAI({ apiKey });
}

function normalizeTextField(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const description =
      normalizeTextField(req.body.description) ||
      normalizeTextField(req.body.issue_description);
    const deviceCategory =
      normalizeTextField(req.body.device_category) ||
      normalizeTextField(req.body.category) ||
      "Unknown";

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Missing required text field: description.",
      });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "Missing required image file field: image.",
      });
    }

    const ai = getGeminiClient();

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildAppraisalUserPrompt({
                description,
                deviceCategory,
                fileName: req.file.originalname,
              }),
            },
            {
              inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype || "application/octet-stream",
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: APPRAISAL_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseJsonSchema: APPRAISAL_RESPONSE_JSON_SCHEMA,
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 1200,
      },
    });

    const parsedResponse = parseAndValidateAppraisalResponse(geminiResponse.text ?? "");

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Appraisal route error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Gemini appraisal error.";

    return res.status(500).json({
      success: false,
      message: "Failed to generate Gemini appraisal.",
      error: errorMessage,
    });
  }
});

export default router;
