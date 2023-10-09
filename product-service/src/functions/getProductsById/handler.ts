import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { productSchema } from '../../schemas/productSchema';
import { productsListMock } from '../../mock/productsListMock';


const getProductsByIdHandler: ValidatedEventAPIGatewayProxyEvent<typeof productSchema> = async (event) => {
  try {
    const data = Promise.resolve([...productsListMock]);
    const products = await data;

    const id = event?.pathParameters?.productId;

    const findedProduct = products.find(product => product?.id === id);
    
    if (!findedProduct) {
      throw new Error(`Product with such id doesnt exists: ${id}`);
    }
    
    return formatJSONResponse(findedProduct);
  } catch (err) {
    throw err;
  }
};

export const getProductsById = middyfy(getProductsByIdHandler);
