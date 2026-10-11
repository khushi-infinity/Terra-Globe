"""
Amazon SageMaker AI Inference Script: TERRA Aerosol Anomaly & Toxicity Predictor
Runs on AWS SageMaker Real-Time Endpoint or Serverless Inference.
"""

import json
import logging
import numpy as np

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def model_fn(model_dir):
    """
    Load pre-trained Environmental Anomaly Detection model.
    In real production, loads a Scikit-Learn IsolationForest or PyTorch Autoencoder.
    """
    logger.info("Initializing TERRA Aerosol Anomaly Model from %s", model_dir)
    return {
        "model_type": "AerosolAnomalyIsolationForest",
        "version": "1.4.0",
        "features": ["pm25", "pm10", "no2", "so2", "o3", "temp", "humidity", "windSpeed"]
    }

def input_fn(request_body, request_content_type):
    """
    Deserialize request payload.
    """
    if request_content_type == "application/json":
        data = json.loads(request_body)
        return data
    raise ValueError(f"Unsupported content type: {request_content_type}")

def predict_fn(input_data, model):
    """
    Compute aerosol anomaly score and toxicological risk index.
    """
    pm25 = float(input_data.get("pm25", 25.0))
    pm10 = float(input_data.get("pm10", 45.0))
    aod = float(input_data.get("aod", 0.3))
    humidity = float(input_data.get("humidity", 50.0))
    wind_speed = float(input_data.get("windSpeed", 3.5))

    # GEMM (Global Exposure Mortality Model) baseline threshold calculation
    excess_pm = max(0.0, pm25 - 5.0)
    
    # Anomaly score between 0.0 (normal) and 1.0 (extreme spike)
    # Stagnant air (low wind) + high humidity + high PM dramatically increases acute particulate retention
    stagnation_factor = 1.0 + (max(0.0, 5.0 - wind_speed) * 0.1) + (max(0.0, humidity - 65.0) * 0.005)
    normalized_spike = (excess_pm / 150.0) * stagnation_factor
    anomaly_score = float(np.clip(normalized_spike, 0.05, 0.99))

    # Toxicological hazard index
    if anomaly_score >= 0.75:
        hazard_level = "CRITICAL_INVERSION"
        action_recommendation = "N95/HEPA Mandatory; Suspend Outdoor Physical Exertion; Trigger Municipal Smog Protocol"
    elif anomaly_score >= 0.50:
        hazard_level = "HIGH_PARTICULATE_RETENTION"
        action_recommendation = "Sensitive Populations Stay Indoors; Air Purifier Level 3 Recommended"
    elif anomaly_score >= 0.25:
        hazard_level = "ELEVATED_AMBIENT_EXPOSURE"
        action_recommendation = "Moderate Exposure; Limit Prolonged Aerobic Exercise"
    else:
        hazard_level = "WHO_GUIDELINE_COMPLIANT"
        action_recommendation = "Air Quality Optimal; Clean Baseline"

    return {
        "anomalyScore": round(anomaly_score, 3),
        "hazardLevel": hazard_level,
        "pm25BaselineRatio": round(pm25 / 5.0, 1),
        "atmosphericDispersionIndex": round(wind_speed * 1.8, 1),
        "actionRecommendation": action_recommendation,
        "sageMakerInferenceModel": model["model_type"],
        "endpointArn": "arn:aws:sagemaker:us-east-1:123456789012:endpoint/terra-aerosol-anomaly-detector"
    }

def output_fn(prediction, accept):
    """
    Serialize prediction response.
    """
    if accept == "application/json":
        return json.dumps(prediction), accept
    raise ValueError(f"Unsupported accept type: {accept}")
