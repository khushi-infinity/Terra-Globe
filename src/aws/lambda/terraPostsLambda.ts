/**
 * AWS Lambda Function: TerraPostsHandler
 * 
 * Target DynamoDB Table: TerraPosts
 * Partition Key: CityName (String)
 * Sort Key: Timestamp (String, ISO8601)
 * Secondary Index: PostType-Timestamp-Index (for category filtering: complaint, volunteer, fundraise, discuss)
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_POSTS_TABLE || 'TerraPosts';

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
    // POST /api/posts - Create localized community post
    if (event.httpMethod === 'POST') {
      const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      const {
        cityName,
        postType,
        authorName = 'Citizen Sentinel',
        authorEmail = 'anonymous@terra.earth',
        title,
        content,
        imageUrl,
        targetGoal,
        currentAmount = 0,
        eventDate,
        rsvpCount = 0,
        coordinates,
        taggedAuthorities = []
      } = data;

      if (!cityName || !postType || !title || !content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'cityName, postType, title, and content are required' })
        };
      }

      const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const timestamp = new Date().toISOString();

      const item = {
        PostId: postId,
        id: postId,
        CityName: cityName,
        Timestamp: timestamp,
        timestamp,
        postType,
        authorName,
        authorEmail,
        authorRole: 'Verified Citizen',
        title,
        content,
        imageUrl: imageUrl || '',
        targetGoal: targetGoal !== undefined ? Number(targetGoal) : undefined,
        currentAmount: Number(currentAmount) || 0,
        eventDate: eventDate || undefined,
        rsvpCount: Number(rsvpCount) || 0,
        upvotes: 1,
        commentsCount: 0,
        coordinates: coordinates || null,
        taggedAuthorities
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
          message: 'Post successfully stored in Amazon DynamoDB TerraPosts',
          post: item
        })
      };
    }

    // GET /api/posts - Fetch latest 20 posts for a specific city or global
    if (event.httpMethod === 'GET') {
      const queryParams = event.queryStringParameters || {};
      const cityName = queryParams.cityName;
      const category = queryParams.category;

      let posts: any[] = [];

      if (cityName && cityName.toLowerCase() !== 'all') {
        // Query by CityName partition key in reverse chronological order
        const queryResult = await docClient.send(new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'CityName = :city',
          ExpressionAttributeValues: {
            ':city': cityName
          },
          ScanIndexForward: false, // Descending by Timestamp
          Limit: 20
        }));
        posts = queryResult.Items || [];
      } else {
        // Scan across table for global community feed
        const scanResult = await docClient.send(new ScanCommand({
          TableName: TABLE_NAME,
          Limit: 50
        }));
        posts = (scanResult.Items || []).sort(
          (a, b) => new Date(b.Timestamp || b.timestamp).getTime() - new Date(a.Timestamp || a.timestamp).getTime()
        ).slice(0, 20);
      }

      // Optional postType category filter (complaint, volunteer, fundraise, discuss)
      if (category && category !== 'all') {
        posts = posts.filter(p => p.postType === category || p.PostType === category);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          count: posts.length,
          cityName: cityName || 'All Cities',
          posts
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error: any) {
    console.error('DynamoDB TerraPosts Lambda error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal DynamoDB Error', details: error.message })
    };
  }
};
