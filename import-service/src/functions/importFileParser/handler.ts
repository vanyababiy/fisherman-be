import { middyfy } from '@libs/lambda';

const importFileParserHandler = async (event: AWS.S3.Event) => {
  console.log('LAMBDA EVENT\n', event);
};

export const importFileParser = middyfy(importFileParserHandler);
