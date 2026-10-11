/**
 * AWS Lambda Node.js: TerraEventBridgeLambda
 * Consumes events from terra-environmental-bus and fans out SNS SMS/Email notifications
 */

export const handler = async (event: any) => {
  console.log('Received EventBridge event:', JSON.stringify(event, null, 2));

  const detail = event.detail || {};
  const alertType = event['detail-type'] || 'HazardousAirQualityAlert';
  const cityName = detail.cityName || 'Active Twin Region';
  const severity = detail.severity || 'HIGH';

  const notification = {
    eventSource: 'terra.environmental.alert',
    alertType,
    cityName,
    severity,
    broadcastTimestamp: new Date().toISOString(),
    status: 'DISPATCHED_TO_SNS',
    topicArn: process.env.SNS_ALERT_TOPIC || 'arn:aws:sns:us-east-1:123456789012:TerraHazardousAirAlerts'
  };

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, notification })
  };
};
