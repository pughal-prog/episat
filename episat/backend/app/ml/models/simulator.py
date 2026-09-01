from typing import Dict, Any
import numpy as np

class ScenarioSimulatorEngine:
    """
    What-If Intervention Simulator (Req #22).
    Recalculates vector risk & expected cases based on user-adjusted parameters.
    Clearly labeled as simulation/scenario estimate, NOT a guaranteed real-world outcome.
    """
    def run_simulation(
        self,
        location_name: str = "Chennai",
        rainfall_change_pct: float = 0.0,
        temperature_change_c: float = 0.0,
        water_persistence_change_pct: float = 0.0,
        bsi_reduction_pct: float = 0.0
    ) -> Dict[str, Any]:

        baseline_risk = 68.0
        baseline_cases = 42.0

        # Parameter multipliers
        rf_mult = 1.0 + (rainfall_change_pct / 100.0) * 0.4
        temp_mult = 1.0 + (temperature_change_c * 0.08)
        water_mult = 1.0 + (water_persistence_change_pct / 100.0) * 0.35
        control_mult = 1.0 - (bsi_reduction_pct / 100.0) * 0.6

        sim_risk = float(np.clip(baseline_risk * rf_mult * temp_mult * water_mult * control_mult, 10.0, 99.0))
        sim_cases = float(np.clip(baseline_cases * rf_mult * temp_mult * water_mult * control_mult, 2.0, 150.0))

        delta_risk = round(sim_risk - baseline_risk, 1)

        return {
            "location_name": location_name,
            "baseline_risk_score": baseline_risk,
            "simulated_risk_score": round(sim_risk, 1),
            "risk_score_delta": delta_risk,
            "baseline_cases": baseline_cases,
            "simulated_cases": round(sim_cases, 1),
            "drivers": {
                "rainfall_change_pct": rainfall_change_pct,
                "temperature_change_c": temperature_change_c,
                "water_persistence_change_pct": water_persistence_change_pct,
                "bsi_reduction_pct": bsi_reduction_pct
            },
            "disclaimer": "SIMULATION / SCENARIO ESTIMATE — NOT A GUARANTEED REAL-WORLD OUTCOME."
        }
