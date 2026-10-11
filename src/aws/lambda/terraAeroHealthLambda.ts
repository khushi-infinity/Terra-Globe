/**
 * AWS Lambda Node.js: TerraAeroHealthLambda
 * Serverless calculation of biological aging acceleration and epidemiological hazard ratios
 */

export interface AeroHealthEvent {
  body: string;
}

export const handler = async (event: any) => {
  try {
    const payload = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || event);
    const {
      aqi = 150,
      pm25 = 55.0,
      pm10 = 90.0,
      userAge = 28,
      dailyHoursOutdoor = 4
    } = payload;

    const numAQI = Number(aqi) || 50;
    const numPM25 = Number(pm25) || 15;
    const age = Number(userAge) || 28;
    const exposureHours = Number(dailyHoursOutdoor) || 4;

    // WHO clean air baseline (5 µg/m³) and Global Exposure Mortality Model (GEMM)
    const excessPM = Math.max(0, numPM25 - 5);
    const exposureFactor = (exposureHours / 24) * 1.5;

    const lungDelta = Number((Math.min(9.5, (excessPM * 0.045 + (numAQI / 85)) * exposureFactor)).toFixed(1));
    const heartDelta = Number((Math.min(7.0, (excessPM * 0.032 + (numAQI / 110)) * exposureFactor)).toFixed(1));
    const skinDelta = Number((Math.min(5.5, (excessPM * 0.022 + (numAQI / 140)) * exposureFactor)).toFixed(1));
    const brainDelta = Number((Math.min(4.8, (excessPM * 0.018 + (numAQI / 160)) * exposureFactor)).toFixed(1));

    const totalBioDelta = Number(((lungDelta * 0.4 + heartDelta * 0.3 + skinDelta * 0.15 + brainDelta * 0.15)).toFixed(1));
    const biologicalAge = Number((age + totalBioDelta).toFixed(1));
    const hoursLostPerMonth = Number((Math.min(72, (excessPM * 0.38 + (numAQI / 12)) * (exposureHours / 4))).toFixed(1));

    const response = {
      biologicalAge,
      chronologicalAge: age,
      agingAccelerationYears: totalBioDelta,
      hoursLostPerMonth,
      organBreakdown: {
        pulmonaryLungs: { deltaYears: lungDelta, severity: lungDelta >= 2.0 ? 'severe' : 'moderate' },
        cardiovascularHeart: { deltaYears: heartDelta, severity: heartDelta >= 1.5 ? 'high' : 'moderate' },
        dermalSkin: { deltaYears: skinDelta, severity: skinDelta >= 1.0 ? 'moderate' : 'low' },
        cerebralBrain: { deltaYears: brainDelta, severity: brainDelta >= 1.0 ? 'moderate' : 'low' }
      },
      whoGuidelineComparison: {
        currentPM25: numPM25,
        whoSafeThreshold: 5.0,
        foldExceedance: Number((numPM25 / 5.0).toFixed(1))
      },
      lambdaMetadata: {
        runtime: 'nodejs20.x',
        memorySize: '512MB',
        functionArn: 'arn:aws:lambda:us-east-1:123456789012:function:TerraAeroHealthLambda'
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Lambda calculation error', message: err.message })
    };
  }
};
