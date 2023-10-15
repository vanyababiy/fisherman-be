import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { productSchema } from './productSchema';
import { productsListMock } from '../../mock/productsListMock';


const getProductsListHandler: ValidatedEventAPIGatewayProxyEvent<typeof productSchema[]> = async () => {
  try {
    const data = Promise.resolve([...productsListMock]);
    const products = await data;

    if (!products) {
      throw new Error('Product not found!');
    }
    
    return formatJSONResponse(products);
  } catch (err) {
    throw err;
  }
};

export const getProductsList = middyfy(getProductsListHandler);
