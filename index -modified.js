/** @format */
const cors = require('cors');
const certificates=require('./services/downloadCert');
const registerDevice=require('./services/registerDevice');
const express = require('express');
const bodyParser = require('body-parser');
const {pool}=require('./dbconn');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let test = {
	name: 'dheeraj',
	class: '12',
};
app.use(cors());
app.get('/', async (req, res) => {
let mac_address=req.query.mac_address;
const query = `SELECT * FROM device WHERE  mac_address='${mac_address}';`; 
const deviceResult = await pool.query(query);
const rows_count=deviceResult.rows.length;
//check is mac address exists in db
if(rows_count<=0){
    console.log("The device you entered does not exist");
    res.send("The device you entered does not exist");

}else{
	//if mac address exist in db check is there any record in device_link table related to this mac addr
  let device_id1=null;
 deviceResult.rows.map((data)=>{
	 let {device_id}=data;
	 device_id1=device_id;
	 });
	 //console.log(device_id1);
const query1 = {
            text: 'select device_id from device_link where device_id=$1',
            values: [device_id1]
			};
const device_exist_res = await pool.query(query1);       
//if record is not there insert its id in device_link table
//console.log("device_link=",device_exist_res.rowCount);
if (device_exist_res.rows.length <= 0) {
const query2 = {
                text: 'INSERT INTO device_link (device_id) VALUES ($1);',
                values: [device_id1],};
await pool.query(query2);
}
//  
const query3= {
            // text:'select * from device_link where device_id=$1 and (extract(minute from current_timestamp)-extract(minute from curr_time))<=10',
            text:'select * from device_link where device_id=$1 and (extract(minute from now()) -extract(minute from curr_time))<='+10,
			values: [device_id1]
			};
const save_User_res = await pool.query(query3);
//console.log("session=",save_User_res.rows.length);
if (save_User_res.rows.length <= 0) {
 const query1 = {
                text: 'DELETE FROM device_link WHERE device_id=$1',
                values: [device_id1]
				};
await pool.query(query1);
res.send('OOpppsss session expired for this device');
}else{
 let cert1=(await certificates.getDeviceCertificates(mac_address)).cert.toString('ascii');
 let key1=(await certificates.getDeviceCertificates(mac_address)).key.toString('ascii');
 let deviceCert = {
	cert: cert1,
	key: key1
};
cert1=cert1.fontsize(2);
key1=key1.fontsize(2);
let deviceCertificates=cert1+'<br/><br/>'+key1+'<br/>';
res.send(deviceCertificates);
}
}
});

app.use('/regDevice', async (req, res) => {
	let mac_address=req.body.mac_address;
	console.log(mac_address);
	const query1 = {
		text: 'select mac_address from device where mac_address = $1',
		values: [mac_address],
	};
	const res1 = await pool.query(query1);
	if (res1.rows.length <= 0) {
        res.status(400).send({
            error: `Device with mac addrerss - ${mac_address} is not Enrolled`,
        });
	} else {
	registerDevice.registerDevice(mac_address,handle);
	function handle(result){
		setTimeout(()=>{
			//console.log(result);
		 var callbackres=result.split(':');
		 //console.log(callbackres);
		 if(callbackres[0]==400){
			res.status(400).send({
				error:callbackres[1]
			 });
		 }else if(callbackres[0]==200){
			res.status(200).send({ 
				success: callbackres[1]
				});
		 }
	},3000); 
   }
 }
});



const port = process.env.PORT || 5000;

app.listen(port, () => console.log(port));
