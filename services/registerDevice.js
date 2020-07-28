var Transport = require('azure-iot-provisioning-device-http').Http;
var X509Security = require('azure-iot-security-x509').X509Security;
var ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
var util=require('util');
const getDeviceCertificates=require('./downloadCert');

const registerDevice = async (mac_address,callback) => {

var provisioningHost ='global.azure-devices-provisioning.net';
var idScope='0ne00130CDC';

let cert1=(await getDeviceCertificates.getDeviceCertificates(mac_address)).cert;
 let key1=(await getDeviceCertificates.getDeviceCertificates(mac_address)).key;
var deviceCert = {
  cert: cert1.toString(),
  key: key1.toString()
};
const registrationId = mac_address.replace(/:/g, '');

var securityClient = new X509Security(registrationId, deviceCert);
var deviceClient = ProvisioningDeviceClient.create(provisioningHost, idScope, new Transport(), securityClient);

var myCallback=function(err,result){
    if (err) {
          return callback('400:error registering device - '+err);
        } else {
          return callback('200:successfully device registered ');
        }
  }
  deviceClient.register(myCallback);

}
exports.registerDevice=registerDevice;
