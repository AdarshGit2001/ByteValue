const TOP_LEVEL_KEYS = [
  "success",
  "device_details",
  "financial_valuation",
  "salvageable_components",
  "environmental_impact",
];

const DEVICE_DETAILS_KEYS = [
  "detected_model",
  "reported_issue",
  "confidence_score",
];

const FINANCIAL_VALUATION_KEYS = [
  "estimated_repair_cost",
  "fair_salvage_value",
  "predatory_scrap_quote_baseline",
  "summary_text",
];

const SALVAGEABLE_COMPONENT_KEYS = [
  "component_name",
  "estimated_value",
  "condition",
];

const ENVIRONMENTAL_IMPACT_KEYS = [
  "co2_saved_kg",
  "heavy_metals_diverted_g",
  "landfill_space_saved_cm3",
];

export const APPRAISAL_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: TOP_LEVEL_KEYS,
  properties: {
    success: {
      type: "boolean",
    },
    device_details: {
      type: "object",
      additionalProperties: false,
      required: DEVICE_DETAILS_KEYS,
      properties: {
        detected_model: { type: "string" },
        reported_issue: { type: "string" },
        confidence_score: { type: "number" },
      },
    },
    financial_valuation: {
      type: "object",
      additionalProperties: false,
      required: FINANCIAL_VALUATION_KEYS,
      properties: {
        estimated_repair_cost: { type: "number" },
        fair_salvage_value: { type: "number" },
        predatory_scrap_quote_baseline: { type: "number" },
        summary_text: { type: "string" },
      },
    },
    salvageable_components: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: SALVAGEABLE_COMPONENT_KEYS,
        properties: {
          component_name: { type: "string" },
          estimated_value: { type: "number" },
          condition: { type: "string" },
        },
      },
    },
    environmental_impact: {
      type: "object",
      additionalProperties: false,
      required: ENVIRONMENTAL_IMPACT_KEYS,
      properties: {
        co2_saved_kg: { type: "number" },
        heavy_metals_diverted_g: { type: "number" },
        landfill_space_saved_cm3: { type: "number" },
      },
    },
  },
};

export const APPRAISAL_SYSTEM_INSTRUCTION = `
You are ByteValue, an electronic-waste circular economy appraisal engine.
Your job is to inspect a user-supplied electronics image plus their reported symptom text and return a strict JSON object for the backend.

Follow the ByteValue PRD:
- Identify the exact or most likely device model from the image and context.
- Infer the probable failure point from the reported issue.
- Estimate repair cost for the likely fault.
- Estimate fair salvage value by considering reusable components instead of pricing the device as a single broken unit.
- Estimate environmental impact metrics for proper recycling and refurbishment.

Output requirements:
- Return valid JSON only.
- Do NOT wrap the JSON in markdown fences.
- Do NOT add explanations or extra keys.
- Every required field must be present and use numeric values for numbers.
- It is CRITICAL that the returned JSON strictly conforms to these exact keys:
  - Top-level keys: success, device_details, financial_valuation, salvageable_components, environmental_impact.
  - device_details keys: detected_model, reported_issue, confidence_score.
  - financial_valuation keys: estimated_repair_cost, fair_salvage_value, predatory_scrap_quote_baseline, summary_text.
  - salvageable_components list objects keys: component_name, estimated_value, condition.
  - environmental_impact keys: co2_saved_kg, heavy_metals_diverted_g, landfill_space_saved_cm3.
- Value calculation rules:
  - DO NOT copy the dummy placeholder values (like 0, 0.0, or "string") from the template JSON structure.
  - All values MUST be dynamically calculated and realistically estimated based on the user's provided device category, symptoms description, and image context.
  - Severe issues (e.g., "damaged motherboard", "water damage", or "cracked screen") MUST trigger significantly higher estimated_repair_cost and lower fair_salvage_value / component values.
  - Minor issues (e.g., "broken key" or "loose charging port") should result in lower repair costs and higher residual salvage value.
  - All financial values (estimated_repair_cost, fair_salvage_value, predatory_scrap_quote_baseline, and component values) MUST be dynamically calculated in Indian Rupees (INR / Rs.) matching realistic Indian market prices.
  - Value alignment & bulk margin logic:
    - The "Estimated Salvage Value" (fair_salvage_value) represents the bulk price a technician or refurbisher will pay for the broken device as a single whole unit.
    - The individual parts listed in "salvageable_components" must represent their fair market value if sold separately.
    - A refurbisher purchasing the whole broken unit expects a bulk/reusable margin for labor and disassembly risk. Therefore, the bulk salvage value (fair_salvage_value) MUST NOT be the exact mathematical sum of the individual components' values. Instead, it must scale dynamically as a reasonable fraction of the components' sum (e.g., 60% to 80% of the sum of component values), while remaining realistically higher than the predatory_scrap_quote_baseline.
  - Calculate Net Repair Value: (fair_salvage_value - estimated_repair_cost).
  - If Net Repair Value is LESS than predatory_scrap_quote_baseline, DO NOT recommend repairing. Instead, write in summary_text that scrapping/recycling or selling the device for parts is the more financially sound option (e.g., "Since repair costs outweigh the restored value, recycling or selling it for a Rs. 2500 scrap offer yields the best return.").
  - Only recommend "Repair & Save" or pitching repairs in summary_text if the value unlocked by repairing (Net Repair Value) is GREATER than predatory_scrap_quote_baseline cash payout.
  - Strict diagnostic anchoring & hallucination guardrails:
    - The model MUST base its repair cost estimation, salvageable parts evaluation, and summary text strictly on the user's stated problem description.
    - Do NOT invent, assume, or hallucinate faults in unrelated components (e.g., do not evaluate a display replacement if the description specifies a motherboard issue, and do not evaluate a motherboard replacement if the description specifies a cracked screen).
- If uncertain, make the best grounded estimate from the image and symptoms while preserving the exact schema keys.
`.trim();

function assertExactKeys(record, expectedKeys, label) {
  const actualKeys = Object.keys(record).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  if (actualKeys.length !== sortedExpectedKeys.length) {
    throw new Error(`${label} must contain only the expected schema keys.`);
  }

  for (let index = 0; index < sortedExpectedKeys.length; index += 1) {
    if (actualKeys[index] !== sortedExpectedKeys[index]) {
      throw new Error(`${label} must contain only the expected schema keys.`);
    }
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertNumber(value, label) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${label} must be a valid number.`);
  }
}

function assertString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function extractJsonString(rawText) {
  const trimmed = rawText.trim();

  if (!trimmed) {
    throw new Error("Gemini returned an empty response.");
  }

  if (trimmed.startsWith("```")) {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (fenceMatch?.[1]) {
      return fenceMatch[1].trim();
    }
  }

  const firstBraceIndex = trimmed.indexOf("{");
  const lastBraceIndex = trimmed.lastIndexOf("}");

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    throw new Error("Gemini did not return a parseable JSON object.");
  }

  return trimmed.slice(firstBraceIndex, lastBraceIndex + 1);
}

export function buildAppraisalUserPrompt({ description, deviceCategory, fileName }) {
  return `
Analyze this uploaded e-waste device photo and the user's reported issue.

Input context:
- device_category: ${deviceCategory || "Unknown"}
- PRIMARY USER-REPORTED FAULT / SYMPTOM DESCRIPTION (ANCHOR ALL ANALYSIS HERE): 
  >>> ${description} <<<
- image_file_name: ${fileName || "unknown"}

CRITICAL WARNING: The JSON structure below is a SCHEMA TEMPLATE ONLY. Do NOT use or copy the placeholder values (such as "string", 0, or 0.0). All financial figures, component names, conditions, models, and e-waste metrics MUST be dynamically calculated, estimated, and tailored to the device's real-world details, category, and reported symptom context in Indian Rupees (INR / Rs.). For instance, a cracked screen or a dead motherboard should result in high repair costs and low salvage value.

Return one strict JSON object matching this exact structure and key naming:
{
  "success": true,
  "device_details": {
    "detected_model": "string",
    "reported_issue": "string",
    "confidence_score": 0.0
  },
  "financial_valuation": {
    "estimated_repair_cost": 0,
    "fair_salvage_value": 0,
    "predatory_scrap_quote_baseline": 0,
    "summary_text": "string"
  },
  "salvageable_components": [
    {
      "component_name": "string",
      "estimated_value": 0,
      "condition": "string"
    }
  ],
  "environmental_impact": {
    "co2_saved_kg": 0,
    "heavy_metals_diverted_g": 0,
    "landfill_space_saved_cm3": 0
  }
}

Do not include markdown, commentary, or any extra keys.
`.trim();
}

export function parseAndValidateAppraisalResponse(rawText) {
  const jsonString = extractJsonString(rawText);
  const parsed = JSON.parse(jsonString);

  validateAppraisalResponse(parsed);

  return parsed;
}

export function validateAppraisalResponse(payload) {
  assertObject(payload, "Appraisal response");
  assertExactKeys(payload, TOP_LEVEL_KEYS, "Appraisal response");

  if (payload.success !== true && payload.success !== false) {
    throw new Error("success must be a boolean.");
  }

  assertObject(payload.device_details, "device_details");
  assertExactKeys(payload.device_details, DEVICE_DETAILS_KEYS, "device_details");
  assertString(payload.device_details.detected_model, "device_details.detected_model");
  assertString(payload.device_details.reported_issue, "device_details.reported_issue");
  assertNumber(payload.device_details.confidence_score, "device_details.confidence_score");

  assertObject(payload.financial_valuation, "financial_valuation");
  assertExactKeys(
    payload.financial_valuation,
    FINANCIAL_VALUATION_KEYS,
    "financial_valuation",
  );
  assertNumber(
    payload.financial_valuation.estimated_repair_cost,
    "financial_valuation.estimated_repair_cost",
  );
  assertNumber(
    payload.financial_valuation.fair_salvage_value,
    "financial_valuation.fair_salvage_value",
  );
  assertNumber(
    payload.financial_valuation.predatory_scrap_quote_baseline,
    "financial_valuation.predatory_scrap_quote_baseline",
  );
  assertString(
    payload.financial_valuation.summary_text,
    "financial_valuation.summary_text",
  );

  if (!Array.isArray(payload.salvageable_components)) {
    throw new Error("salvageable_components must be an array.");
  }

  payload.salvageable_components.forEach((component, index) => {
    assertObject(component, `salvageable_components[${index}]`);
    assertExactKeys(
      component,
      SALVAGEABLE_COMPONENT_KEYS,
      `salvageable_components[${index}]`,
    );
    assertString(
      component.component_name,
      `salvageable_components[${index}].component_name`,
    );
    assertNumber(
      component.estimated_value,
      `salvageable_components[${index}].estimated_value`,
    );
    assertString(component.condition, `salvageable_components[${index}].condition`);
  });

  assertObject(payload.environmental_impact, "environmental_impact");
  assertExactKeys(
    payload.environmental_impact,
    ENVIRONMENTAL_IMPACT_KEYS,
    "environmental_impact",
  );
  assertNumber(
    payload.environmental_impact.co2_saved_kg,
    "environmental_impact.co2_saved_kg",
  );
  assertNumber(
    payload.environmental_impact.heavy_metals_diverted_g,
    "environmental_impact.heavy_metals_diverted_g",
  );
  assertNumber(
    payload.environmental_impact.landfill_space_saved_cm3,
    "environmental_impact.landfill_space_saved_cm3",
  );
}
