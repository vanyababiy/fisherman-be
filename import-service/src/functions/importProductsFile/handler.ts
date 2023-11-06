import { awsRegion } from '@constants/aws-region.constant';
import { fishermanImportUploadedBucketName } from '@constants/fisherman-import-uploaded.constant';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getSignedUrl } from '@services/aws.service';

const importProductsFileHandler: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  console.log('LAMBDA EVENT\n', event);

  const name = event?.queryStringParameters?.name;

  if (!name) {
    throw new Error('Please provide name');
  }

  console.log('\n\n\nname');
  console.log(name);

  try {
    const fileUploadKey = `uploaded/${name}`;
    const signedUrl = await getSignedUrl(
      fishermanImportUploadedBucketName,
      awsRegion,
      fileUploadKey,
    );

    console.log('\n\n\nsignedUrl');
    console.log(signedUrl);
    return formatJSONResponse({ url: signedUrl }, 200);
  } catch (err) {
    return formatJSONResponse({ message: err.message }, 400);
  }
};

export const importProductsFile = middyfy(importProductsFileHandler);
