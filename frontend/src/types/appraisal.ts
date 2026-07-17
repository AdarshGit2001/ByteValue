export interface DeviceDetails {
  detected_model: string;
  reported_issue: string;
  confidence_score: number;
}

export interface FinancialValuation {
  estimated_repair_cost: number;
  fair_salvage_value: number;
  predatory_scrap_quote_baseline: number;
  summary_text: string;
}

export interface SalvageableComponent {
  component_name: string;
  estimated_value: number;
  condition: string;
}

export interface EnvironmentalImpact {
  co2_saved_kg: number;
  heavy_metals_diverted_g: number;
  landfill_space_saved_cm3: number;
}

export interface AppraisalResponse {
  success: boolean;
  device_details: DeviceDetails;
  financial_valuation: FinancialValuation;
  salvageable_components: SalvageableComponent[];
  environmental_impact: EnvironmentalImpact;
}
