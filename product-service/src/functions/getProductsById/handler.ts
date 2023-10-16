import * as AWS from 'aws-sdk';
import { middyfy } from '@libs/lambda';
import { formatJSONResponse } from '@libs/api-gateway';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

import { productSchema } from '../../schemas/productSchema';

const DYNAMODB_TABLE_PRODUCTS = process.env.DYNAMODB_TABLE_PRODUCTS;
const DYNAMODB_TABLE_STOCKS = process.env.DYNAMODB_TABLE_STOCKS;

const getProductsByIdHandler: ValidatedEventAPIGatewayProxyEvent<typeof productSchema> = async (event) => {
  try {
    console.log(`GET PRODUCT BY ID EVENT\n + ${JSON.stringify(event, null, 2)}`);

    const id = event?.pathParameters?.productId;
    const dynamoDBClient = new AWS.DynamoDB.DocumentClient({});
    const productParams = {
      TableName: DYNAMODB_TABLE_PRODUCTS,
      KeyConditionExpression: 'Id = :id',
      ExpressionAttributeValues: { ':id': id }
      ,
    };
    const productQueryResponse = await dynamoDBClient.query(productParams).promise();

    const stocksParams = {
      TableName: DYNAMODB_TABLE_STOCKS,
      KeyConditionExpression: 'ProductId = :id',
      ExpressionAttributeValues: { ':id': id }
    };
    const stockQueryResponse = await dynamoDBClient.query(stocksParams).promise();

    if (!productQueryResponse.Count || !stockQueryResponse.Count) {
      throw new Error(`Product with such id doesnt exists: ${id}`);
    }

    const product = {
      ...productQueryResponse.Items[0],
      id: productQueryResponse.Items[0].id,
      price: Number(productQueryResponse.Items[0].price),
      count: Number(stockQueryResponse.Items[0].count),
    };

    return formatJSONResponse(product);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }, null, 2 ),
    }
  }
};

export const getProductsById = middyfy(getProductsByIdHandler);
