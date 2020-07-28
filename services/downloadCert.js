/** @format */
var express =require('express');
var router =express.Router();
const blobServiceClient =require('./blobStorageConn');
const streamToStr=require('./streamToString');

var deviceCert = { cert: '', key: '', certName: '', keyName: '' };
	var files = [];
	var certFileName = [];

// router.get('/',async (req,res)=>{
	const getDeviceCertificates=async (mac_address)=>{
	var blobContainerName="iotdevicecertificates";
	//let mac_address=req.query.mac_address;
	const device_mac_addr = mac_address.replace(/:/g, '');
	var containerClient = blobServiceClient.getContainerClient(
		blobContainerName
	);
	let iter = containerClient.listBlobsByHierarchy('/', {
		prefix: device_mac_addr + '/',
	});
	let entity = await iter.next();
	while (!entity.done) {
		let item = entity.value;
		if (item.kind === 'prefix') {
			console.log(`\tBlobPrefix: ${item.name}`);
		} else {
			const blockBlobClient = containerClient.getBlobClient(item.name);
			var filename = item.name.split('/')[1];
			const downloadBlockBlobResponse = await blockBlobClient.download(0);
			const downloadedCert = await streamToStr.streamToString(
				downloadBlockBlobResponse.readableStreamBody
			);
			files.push(downloadedCert);
			certFileName.push(filename);
		}
		entity = await iter.next();
	}
	deviceCert = {
		cert: files[0],
		key: files[1],
		certName: certFileName[0],
		keyName: certFileName[1],
	};


return deviceCert;
};

exports.getDeviceCertificates =getDeviceCertificates;