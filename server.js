/*
 * Sentilo
 * 
 *      
 * Original version 1.4 Copyright (C) 2013 Institut Municipal d’Informàtica, Ajuntament de Barcelona.
 * Modified by Opentrends adding support for multitenant deployments and SaaS. 
 * Modifications on version 1.5 Copyright (C) 2015 Opentrends Solucions i Sistemes, S.L.
 * 
 * This program is licensed and may be used, modified and redistributed under the terms of the
 * European Public License (EUPL), either version 1.1 or (at your option) any later version as soon
 * as they are approved by the European Commission.
 * 
 * Alternatively, you may redistribute and/or modify this program under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied.
 * 
 * See the licenses for the specific language governing permissions, limitations and more details.
 * 
 * You should have received a copy of the EUPL1.1 and the LGPLv3 licenses along with this program;
 * if not, you may find them at:
 * 
 * https://joinup.ec.europa.eu/software/page/eupl/licence-eupl http://www.gnu.org/licenses/ and
 * https://www.gnu.org/licenses/lgpl.txt
 */
// The OS information module
var os = require('os');

// Include some Sentilo operations from the Nodejs client library
var sentilo = require('sentilo-client-nodejs');

// Module that interacts with the local sensor
var sensor = require('./sensor.js');

// Module that interacts with the local actuator
var actuator = require('./actuator.js');
actuator.init();

// Get some OS values, like the sensor IP
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
var myIp = addresses[0];
var myPort = 3000;
var myEndpoint = 'http://'+myIp+':'+myPort;
var myOrderEndointPath = '/order'; 
var myOrderEndoint = myEndpoint + myOrderEndointPath;
var systemObservationsTimeout = 60000;
 
// Service and example options
// You must modify it under your requeriments
var samplesOptions = {
    host : 'YOUR-SENTILO-INSTANCE-HOST-IP',
    port : 'YOUR-SENTILO-INSTANCE-HOST-PORT',
    headers : {
        identity_key : 'YOUR_SENTILO-INSTANCE-DEFAULT-IDENTITY-KEY'
    },
    tokenId : 'YOUR-SENTILO-INSTANCE-IDENTITY-KEY',
    providerTokenId : 'YOUR-SENTILO-INSTANCE-PROVIDER-IDENTITY-KEY',
    provider : 'samples-provider',
    sensor : 'sample-sensor-nodejs',
    component : 'sample-component',
    componentType : 'generic',
    sensorDataType : 'TEXT',
    sensorType : 'status',
    sensorUnit : '',
    sensorLocation : 'YOUR_SENSOR_LOCATION'
};
 
// A very simple RESTFul server module
var express = require('express');
var server = express();
server.use(express.json()) // for parsing application/json
server.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

server.get('/', (req, res) => {
	var output = `<p>Test server is listening at port: ${myPort}</p>`;
	output += `<p>The server is now ready to receive POST incoming callsat: ${myOrderEndoint}</p>`;
  	res.send(output);
});

// We only need a POST endpoint service to receive ordercs callbacks
// The path will be [POST] http://localhost:3000/order
server.post('/order', function(req, res, next) {
	var order = req.body;
	console.info("[server][POST] Order received: " + JSON.stringify(order));
    
	res.json(req.body);
	
    // Execute the order in the actuator
    actuator.executeOrder(req.body);

    var value = 'Order received and executed: ' + JSON.stringify(order.message);
    sentilo.publishObservations(value, samplesOptions);

    return next();
});

function sentiloInit() {
	console.log('[server][sentilo-init] Initializing the NodeJS client example for Sentilo');
	
	// Init Sentilo services for this example
	// Here you must pass as paramether the specific configuration
	sentilo.init(samplesOptions);
	
	// Test if is there the sensor configured in the catalog
	console.log(`[server][sentilo-init] Registering the ${samplesOptions.sensor} sensor...`);
	var existsSensor = sentilo.existsSensorInCatalog(samplesOptions);
	if (!existsSensor) {
	    // If not, then create it
	    sentilo.createSensor(samplesOptions);
	    console.log(`[server][sentilo-init] Sensor ${samplesOptions.sensor} successfully created`);
	} else {
		console.log(`[server][sentilo-init] Sensor ${samplesOptions.sensor} already exists, we'll use it`);
	}
	
	// Now we can publish a first alarm that informs that the sensor is up
	// First of all let create an external alert
	console.log('[server][sentilo-init] Registering the System Status Alert...');
	var alertsListInputMessage = {
	    alerts : [ {
	        id : 'SYSTEM_STATUS_ALERT',
	        name : 'SYSTEM_STATUS_ALERT',
	        description : 'Custom alert to inform the system status',
	        type : 'EXTERNAL'
	    } ]
	};
	sentilo.createAlerts(alertsListInputMessage);
	
	// And then, we can publish an alarm to inform that the system is up now
	var alarmInputMessage = {
	    message : 'The system goes up on ' + new Date()
	};
	sentilo.publishAlarm('SYSTEM_STATUS_ALERT', alarmInputMessage);
	console.log('[server][sentilo-init] Alarm published: ' + alarmInputMessage.message);
	
	// Subscribe the sensor orders
	// We'll manage it throught our server on POST service
	var subscriptionInputMessage = {
	    endpoint : myOrderEndoint
	};
	sentilo.subscribeOrder(subscriptionInputMessage);
	// sentilo.subscribeOrderToAll(subscriptionInputMessage);
	console.log('[server][sentilo-init] Sensor\'s orders succsessfully subscribed to this server');
	
	// Now, we can publish observations every 60 seconds
	// And still waiting for incoming orders
	publishTestData();
}

function publishTestData() {
	console.log('[server][publishTestdata] The sensor is now up, and we\'ll be sending some observations every ' + systemObservationsTimeout + ' ms');
	setInterval(function() {
	    // Send some System information
	    var freeMemValue = "OS freemem: " + os.freemem();
	    console.log('[server][publishTestdata] Retrieved system freemem value: [' + freeMemValue + '] and publishing it as an observation...');
	    sentilo.publishObservations(freeMemValue, samplesOptions);
	
	    // Retrieve some sensor data and send it as observation...
	    var sensorDataValue = "Sensor value: " + sensor.readSensorValue();
	    console.log('[server][publishTestdata] Retrieved sensor value: [' + sensorDataValue + '] and publishing it as an observation...');
	    sentilo.publishObservations(sensorDataValue, samplesOptions);
	}, systemObservationsTimeout);
}

server.listen(myPort, () => {
  	console.log(`[server] My ip address is: ${myIp}`);
  	console.log(`[server] Test server is listening at: ${myEndpoint}`);
	console.log(`[server] The server is now ready to receive POST incoming calls at: ${myOrderEndoint}`);
	
	// Initialize the example
	sentiloInit();
})