import * as AWS from 'aws-sdk';

export const getSignedUrl = async (bucketName: string, region: string, key: string): Promise<string> => {
  const s3Client = new AWS.S3({
    region,
    apiVersion: '2006-03-01',
    signatureVersion: 'v4',
  });
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: 60,
  }

  return s3Client.getSignedUrlPromise('putObject', params);
}