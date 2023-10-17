import * as AWS from 'aws-sdk';
import { middyfy } from '@libs/lambda';
import { formatJSONResponse } from '@libs/api-gateway';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { v4 as uuidV4 } from 'uuid';

import { productSchema } from '../../schemas/productSchema';

const DYNAMODB_TABLE_PRODUCTS = process.env.DYNAMODB_TABLE_PRODUCTS;
const DYNAMODB_TABLE_STOCKS = process.env.DYNAMODB_TABLE_STOCKS;

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof productSchema> = async (event) => {
  try {
    console.log(`CREATE PRODUCT EVENT\n + ${JSON.stringify(event, null, 2)}`);

    const body = JSON.parse(JSON.stringify(event.body));
    const dynamoDBClient = new AWS.DynamoDB.DocumentClient({});
    const id = uuidV4();
    const createProductParams = {
      TableName: DYNAMODB_TABLE_PRODUCTS,
      Item: {
        Id: id,
        description: body.description,
        title: body.title,
        price: Number(body.price),
      },
    };
    const createStockParams = {
      TableName: DYNAMODB_TABLE_STOCKS,
      Item: {
        ProductId: id,
        count: Number(body.count),
      },
    };
    await Promise.all([
      dynamoDBClient.put(createProductParams).promise(),
      dynamoDBClient.put(createStockParams).promise(),
    ]);

    const product = {
      id,
      description: body.description,
      title: body.title,
      price: Number(body.price),
      count: Number(body.count),
    };

    return formatJSONResponse(product);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }, null, 2 ),
    }
  }
};

export const getProductsById = middyfy(createProduct);
