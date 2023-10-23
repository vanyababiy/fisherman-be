import { fishermanImportUploadedBucketName } from '@constants/fisherman-import-uploaded.constant';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.importFileParser`,
  url: true,
  events: [
    {
      s3: {
        bucket: fishermanImportUploadedBucketName,
        event: 's3:ObjectCreated:*',
        existing: true,
        rules: [
          {
            prefix: 'uploaded/',
          },
          {
            suffix: '.csv',
          },
        ],
      },
    },
  ],
};
