/**
 * AWS Lambda Function: TerraReportsHandler
 * 
 * Target DynamoDB Table: TerraReports
 * Primary Key: ReportId (String)
 * Global Secondary Index: CityName-Timestamp-Index (CityName HASH, Timestamp RANGE)
 * Geospatial Attributes: Latitude (N), Longitude (N)
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_REPORTS_TABLE || 'TerraReports';

interface APIGatewayEvent {
  httpMethod: string;
  body?: string | null;
  queryStringParameters?: Record<string, string> | null;
}

interface APIGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayResponse> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  try {
    if (event.httpMethod === 'POST') {
      const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      const {
        latitude,
        longitude,
        imageUrl,
        pollutionType,
        description = '',
        severity = 'high',
        cityName = 'Unspecified Region',
        authorName = 'Citizen Reporter',
        timestamp = new Date().toISOString()
      } = data;

      if (latitude === undefined || longitude === undefined || !pollutionType) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required parameters: latitude, longitude, pollutionType' })
        };
      }

      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const item = {
        ReportId: reportId,
        id: reportId,
        CityName: cityName,
        Latitude: Number(latitude),
        Longitude: Number(longitude),
        PollutionType: pollutionType,
        Severity: severity,
        ImageUrl: imageUrl || '',
        Description: description,
        Timestamp: timestamp,
        Status: 'Verified',
        AuthorName: authorName,
        Upvotes: 1
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Pollution ground truth report registered in DynamoDB',
          report: item
        })
      };
    }

    if (event.httpMethod === 'GET') {
      // Query by geographic bounding box if provided: ?north=..&south=..&east=..&west=..
      const queryParams = event.queryStringParameters || {};
      const north = queryParams.north ? Number(queryParams.north) : undefined;
      const south = queryParams.south ? Number(queryParams.south) : undefined;
      const east = queryParams.east ? Number(queryParams.east) : undefined;
      const west = queryParams.west ? Number(queryParams.west) : undefined;

      const scanResult = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 100
      }));

      let reports = (scanResult.Items || []).map(item => ({
        id: item.ReportId || item.id,
        cityName: item.CityName,
        latitude: item.Latitude,
        longitude: item.Longitude,
        pollutionType: item.PollutionType,
        severity: item.Severity,
        imageUrl: item.ImageUrl,
        description: item.Description,
        timestamp: item.Timestamp,
        status: item.Status || 'Verified',
        authorName: item.AuthorName || 'Citizen Sentinel',
        upvotes: item.Upvotes || 0
      }));

      // Bounding box filter
      if (north !== undefined && south !== undefined && east !== undefined && west !== undefined) {
        reports = reports.filter(r =>
          r.latitude <= north &&
          r.latitude >= south &&
          r.longitude <= east &&
          r.longitude >= west
        );
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          count: reports.length,
          reports
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error: any) {
    console.error('DynamoDB TerraReports error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal DynamoDB Error', details: error.message })
    };
  }
};
