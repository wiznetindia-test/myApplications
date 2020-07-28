const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const account = 'iotsolutioncert';
const accountKey =
    'LwgWDa7al49V3n0c0qwbLGmQ2OuOJaIWVexK+VaNb2HW/3jINs2hvEwPgM9EQozx47fwgjesczKE9kP7wMBqow==';
const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey
);
const blobServiceClient = new BlobServiceClient(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
);

module.exports=blobServiceClient;