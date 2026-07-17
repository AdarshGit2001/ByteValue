# Product Requirement Document (PRD)

## Project Name: ByteValue
**Domain:** Clean & Green (Sustainability & Circular Economy)  
**Target Audience:** Everyday consumers with stagnant e-waste, green recyclers, and refurbishers.  
**Core Value Proposition:** Breaking information asymmetry in the second-hand electronics market using AI to provide transparent component-level valuation, protecting users from being lowballed while ensuring toxic e-waste is routed away from landfills.

---

## 1. Product Overview & Goals
ByteValue is a mobile-responsive web application that acts as a decentralized environmental diagnostics and appraisal engine. Instead of letting dead gadgets rot in drawers or selling them for fractions of their worth to exploitative scrap dealers, users get an instant, objective breakdown of their device's residual component value and direct routing to verified green recycling partners.

### High-Level Goals (The Hackathon Target)
*   **Empower the Consumer:** Turn a complex hardware diagnostic problem into a simple 60-second photo/text assessment.
*   **Enforce Circularity:** Ensure functional components (RAM, Storage, Screens) are flagged for salvage while toxic modules are safely recycled.
*   **Prove the "Green" Impact:** Dynamically calculate the carbon offset and toxic waste prevention metrics per scan.

---

## 2. Key Features (Hackathon MVP Scope)

### Feature 1: The "Fair-Price Shield" Visual & Textual Diagnostic Intake
*   **User Action:** The user selects their device category (Laptop/Smartphone), inputs a brief text description of the issue (e.g., *"Sparked at charging port, won't turn on"*), and uploads a photo of the device (or its model specification sticker).
*   **AI Processing:** 
    *   A Multimodal LLM API receives the image and text context. 
    *   It identifies the exact device model, cross-references baseline technical specifications, and isolates the highly probable point of failure.
*   **Output:** An interactive, itemized "Component-Level Breakdown" UI card.

### Feature 2: Residual Value & Salvage Estimator
*   **The Logic:** Instead of pricing the device as a single broken unit, the backend separates the device into core modules and maps them against fixed/mock market rates for functional replacement parts.
*   **Example Output UI:**
    *   *Total Device Cost (New):* ₹45,000
    *   *Estimated Repair Cost (Charging IC):* ~₹1,500
    *   *Functional Component Value (If scrapped for parts):* 
        *   8GB DDR4 RAM: ₹1,200
        *   256GB NVMe SSD: ₹1,500
        *   1080p Display Panel: ₹3,000
    *   **Fair Salvage Baseline:** ₹5,700 (Protects user from a ₹500 lowball offer).

### Feature 3: Eco-Routing & Impact Dashboard
*   **Green Routing:** A localized matching interface that pairs the appraised device with a certified e-waste recycler or authorized refurbishment network.
*   **Green Metrics Counter:** A post-appraisal screen displaying the potential positive ecological impact if recycled properly:
    *   *Grams of Heavy Metals (Lead/Mercury) diverted from landfills.*
    *   *Carbon emission (CO2 equivalent) saved by refurbishing existing silicon vs. manufacturing new components.*

---

## 3. Technical Architecture & Stack
*   **Frontend:** React.js or Next.js with Tailwind CSS (Optimized for quick UI building and clean UI presentation).
*   **Backend:** Node.js (Express) or Python (FastAPI) to handle API orchestration.
*   **AI Integration:** Gemini Pro Vision / Multimodal API to ingest the device image and user-reported symptom string.
*   **Database:** Supabase or Firebase Firestore to hold mock baseline scrap values for common device types and local recycler listings.

---

## 4. The 24-Hour Hackathon Development Timeline
*   **Hours 0–4 (Setup & Wireframing):** Finalize data schemas in Supabase; build Frontend skeleton UI (Intake Form, Results Page, Dashboard).
*   **Hours 4–12 (Backend & AI Integration):** Write API routes; draft the system prompt for the Multimodal API ensuring it returns clean, parseable JSON containing component breakdowns.
*   **Hours 12–18 (Frontend Connection):** Connect the AI JSON output to the React/Next UI components; populate the dynamic mathematical salvage valuations.
*   **Hours 18–24 (Polish & Pitch Prep):** Refine UI styling; record demo video; finalize the pitch deck focusing on the "₹500 Laptop" narrative hook.

---

## 5. Success Metrics for the Judges
1.  **Input Resilience:** Successfully handling an image of a broken laptop/phone alongside vague user descriptions and generating structured data.
2.  **Clear Financial Transparency:** Directly showing how the system calculated the value of individual components versus a simple flat-rate guess.
3.  **High-Fidelity Environmental Impact:** Translating software data into clear environmental impact analytics (CO2 saved, landfill waste diverted) that perfectly validates the Clean & Green domain requirements.
