import { awsRegion } from '@constants/aws-region.constant';
import { fishermanImportUploadedBucketName } from '@constants/fisherman-import-uploaded.constant';
import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { parseStream } from 'fast-csv';

const importFileParserHandler = async (event: S3Event): Promise<void> => {
  console.log('LAMBDA EVENT\n', JSON.stringify(event, null, 2));
  const bucketName = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const getObjectParams = {
    Bucket: bucketName,
    Key: key,
  };
  const s3Client = new AWS.S3({
    region: awsRegion,
    apiVersion: '2006-03-01',
  });

  try {
    const s3Stream = s3Client.getObject(getObjectParams).createReadStream();
    const results = [];

    parseStream(s3Stream)
      .on('data', (row) => {
        console.log('row', row);
        const [title, description, count, price] = row[0].split(';');
        results.push({
          title,
          description,
          count: parseInt(count),
          price: parseFloat(price),
        });
      })
      .on('end', () => {
        console.log('results:\n');
        console.log(results);
      })
      .on('error', (error) => {
        console.log('error', error);
      });

    const [, fileName] = key.split('/');
    const destinationKey = `parsed/${fileName}`;
    const copySource = `${fishermanImportUploadedBucketName}/${key}`;
    const copyObjectS3Params = {
      Bucket: fishermanImportUploadedBucketName,
      CopySource: copySource,
      Key: destinationKey,
    };

    await s3Client.copyObject(copyObjectS3Params, (err, data) => {
      if (err) {
        console.log('error', err);

        throw err;
      }

      console.log('Object was successfully copied.');
    }).promise();

    const deleteObjectS3Params = {
      Bucket: fishermanImportUploadedBucketName,
      Key: key,
    };

    await s3Client.deleteObject(deleteObjectS3Params, (err, data) => {
      if (err) {
        console.log('error', err);

        throw err;
      }

      console.log('Source object was successfully deleted.');
    }).promise();
  } catch (err) {
    console.error(err);
  }
};

export const importFileParser = importFileParserHandler;
