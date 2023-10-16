import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { BatchGetItemCommand, DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb"

import { productSchema } from './productSchema';

const DYNAMODB_TABLE_PRODUCTS = process.env.DYNAMODB_TABLE_PRODUCTS;
const DYNAMODB_TABLE_STOCKS = process.env.DYNAMODB_TABLE_STOCKS;

const getProductsListHandler: ValidatedEventAPIGatewayProxyEvent<typeof productSchema[]> = async () => {
  const dynamoDBClient = new DynamoDBClient({ region: 'eu-west-1'});

  try {
    const productsParams = {
      TableName: DYNAMODB_TABLE_PRODUCTS,
    };
    const productsScanCommand = new ScanCommand(productsParams);
    const productsResponse = await dynamoDBClient.send(productsScanCommand);

    if (productsResponse.Items.length === 0) {
      throw new Error('Product not found!');
    }

    const stocksParams = {
      RequestItems: {
        [DYNAMODB_TABLE_STOCKS]: {
          Keys: productsResponse.Items.map((product) => {
            return {
              ProductId: { S: product.Id.S },
            }
          }),
        },
      },
    };
    const stocksScanCommand = new BatchGetItemCommand(stocksParams);
    const stocksResponse = await dynamoDBClient.send(stocksScanCommand);

    const response = productsResponse.Items.map(product => {
      const count = stocksResponse.Responses.Stocks.find(stock => stock.ProductId.S === product.Id.S).count.N;

      return {
        id: product.Id.S,
        description: product.description.S,
        price: product.price.N,
        title: product.title.S,
        count,
      }
    });
    
    return formatJSONResponse(response);
  } catch (err) {
    throw err;
  }
};

export const getProductsList = middyfy(getProductsListHandler);
