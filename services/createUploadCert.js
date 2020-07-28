var pem = require('pem');
var camelcase = require('camelcase');
const blobServiceClient =require('./blobStorageConn');
const streamToStr=require('./streamToString');
const util=require('util');

const createUploadCertificates= async (mac_address) => {
    const device_mac_addr =mac_address.replace(/:/g,"");
    var commonName = device_mac_addr;
    outputFilenameRoot = camelcase(commonName);
    var blobContainerName="iotdevicecertificates";

    var containerClient=blobServiceClient.getContainerClient(blobContainerName);
let files=Array();
let certNames=Array();
var parentCommonName=null;
let iter = containerClient.listBlobsByHierarchy("/", { prefix: "rootCertificate" + "\/" });
let entity = await iter.next();
while (!entity.done) {
      let item = entity.value;
if (item.kind === "prefix") {
     // console.log(`\tBlobPrefix: ${item.name}`);
      return false;
} else {
      //console.log(`\tBlobItem: name - ${item.name}`);
      parentCommonName=(item.name).split('/')[1];
      certNames.push(parentCommonName);
      //console.log(parentCommonName);
      const blockBlobClient = containerClient.getBlobClient(item.name);
      const downloadBlockBlobResponse =await blockBlobClient.download(0);
      const downloadedCert=await streamToStr.streamToString(downloadBlockBlobResponse.readableStreamBody);
      files.push(downloadedCert);
    }
    entity = await iter.next();
 }
  
   var parentFilenameRoot=certNames[0];

    parentCert =files[0]; 
    parentKey =files[1]; 
var certOptions = {
  commonName: commonName,
  serial: Math.floor(Math.random() * 1000000000),
  days: 30,
};

certOptions.config = [
    '[req]',
    'req_extensions = v3_req',
    'distinguished_name = req_distinguished_name',
    '[req_distinguished_name]',
    'commonName = ' + commonName,
    '[v3_req]',
    'extendedKeyUsage = critical,clientAuth'
  ].join('\n');


if (parentCert) {
  certOptions.serviceKey = parentKey;
  certOptions.serviceCertificate = parentCert;
} else {
  certOptions.selfSigned = true;
}
var deviceCert = { cert: '', key: ''};

var createCert=util.promisify(pem.createCertificate);
var cert=(await createCert(certOptions)).certificate;
var key=(await createCert(certOptions)).clientKey;
deviceCert = { cert:cert, key: key};

// pem.createCertificate(certOptions, async function(err, cert) {
//     if (err) {
//       console.log('Could not create certificate: ' + err.message);
//     } else {
//       var content1=(cert.certificate).toString('ascii');;
//       var content2=(cert.clientKey).toString('ascii');
//       //upload device certificates to blob
//     const blobcertname1=outputFilenameRoot+'_cert.pem';
//     const blobcertname2=outputFilenameRoot+'_key.pem';
//     const blobName1 = device_mac_addr+"\/"+blobcertname1;
//     const blockBlobClient1 = containerClient.getBlockBlobClient(blobName1);
//     const uploadBlobResponse1 = await blockBlobClient1.upload(content1, Buffer.byteLength(content1));
//    console.log(`Upload block blob ${blobName1} successfully`, uploadBlobResponse1.requestId);
//     const blobName2 = device_mac_addr+"/"+blobcertname2;
//     const blockBlobClient2 = containerClient.getBlockBlobClient(blobName2);
//   const uploadBlobResponse2 = await blockBlobClient2.upload(content2, Buffer.byteLength(content2));
//    console.log(`Upload block blob ${blobName2} successfully`, uploadBlobResponse2.requestId);
//     }

//   });
return deviceCert;
}

exports.createUploadCertificates =createUploadCertificates;
//createUploadCertificates("00:08:dc:59:66:4b");