import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { nanoid } from 'nanoid';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { inputText, inputFilePath } = JSON.parse(event.body || '{}');

        const dynamoParams = {
            TableName: process.env.TABLE_NAME!,
            Item: {
                id: nanoid(),
                input_text: inputText,
                input_file_path: inputFilePath,
            },
        };
        await dynamodb.put(dynamoParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved to DynamoDB.' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error.' }),
        };
    }
};
