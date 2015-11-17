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
// A very simple RESTFul server module
var restify = require('restify');

// The OS information module
var os = require('os');

// Include some Sentilo operations from the Nodejs client library
var sentilo = require('./sentilo.js');

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
var myPort = 8080;
var myEndpoint = 'http://'+myIp+':'+myPort;
var myOrderEndointPath = '/order'; 
var myOrderEndoint = myEndpoint + myOrderEndointPath;

console.log('My ip address is: ' + myIp + ', and my port: ' + myPort);

// Service and example options
// You must modify it under your requeriments
var samplesOptions = {
    host : 'YOUR_SENTILO_INSTANCE_HOST_IP',
    port : 'YOUR_SENTILO_INSTANCE_HOST_PORT',
    headers : {
        identity_key : 'YOUR_SENTILO_INSTANCE_DEFAULT_IDENTITY_KEY'
    },
    tokenId : 'YOUR_SENTILO_INSTANCE_IDENTITY_KEY',
    providerTokenId : 'YOUR_SENTILO_INSTANCE_PROVIDER_IDENTITY_KEY',
    provider : 'samples-provider',
    sensor : 'sample-sensor-nodejs',
    component : 'sample-component',
    componentType : 'generic',
    sensorDataType : 'TEXT',
    sensorType : 'status',
    sensorUnit : '',
    sensorLocation : 'YOUR_SENSOR_LOCATION'
};

// Starts a RESTFul server to manage orders inputs via POST calls
var server = restify.createServer({
    name : 'SentiloClient for Nodejs Example Server',
    version : '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// We only need a POST endpoint service to receive ordercs callbacks
// The path will be [POST] http://localhost:8080/order
server.post('/order', function(req, res, next) {
    res.send(req.params);

    console.info("[POST] Order received: " + JSON.stringify(req.params));

    // Execute the order in the actuator
    actuator.executeOrder(req.params);

    var value = 'Order received and executed: ' + JSON.stringify(req.params.message);
    sentilo.publishObservations(value, samplesOptions);

    return next();
});

// Starts the server and listen on port 8080
server.listen(myPort, function() {
    console.log('%s listening at %s', server.name, myEndpoint);
    console.log('The server is now ready to receive POST incoming calls');
});

// Init Sentilo services for this example
// Here you must pass as paramether the specific configuration
sentilo.init(samplesOptions);

// Test if is there the sensor configured in the catalog
var existsSensor = sentilo.existsSensorInCatalog(samplesOptions);
if (!existsSensor) {
    // If not, then create it
    sentilo.createSensor(samplesOptions);
}

// Now we can publish a first alarm that informs that the sensor is up
// First of all let create an external alert
console.log('Registering the System Status Alert...');
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
console.log('Alarm published: ' + alarmInputMessage.message);

// Subscribe the sensor orders
// We'll manage it throught our server on POST service
var subscriptionInputMessage = {
    endpoint : myOrderEndoint
};
sentilo.subscribeOrder(subscriptionInputMessage);
// sentilo.subscribeOrderToAll(subscriptionInputMessage);

// Now, we can publish observations every 60 seconds
// And still waiting for incoming orders
var systemObservationsTimeout = 60000;
console.log('The sensor is now up, and we\'ll be sending some observations every ' + systemObservationsTimeout + ' ms');
setInterval(function() {
    // Send some System information
    var freeMemValue = "OS freemem: " + os.freemem();
    console.log('Retrieved system freemem value: [' + freeMemValue + '] and publishing it as an observation...');
    sentilo.publishObservations(freeMemValue, samplesOptions);

    // Retrieve some sensor data and send it as observation...
    var sensorDataValue = "Sensor value: " + sensor.readSensorValue();
    console.log('Retrieved sensor value: [' + sensorDataValue + '] and publishing it as an observation...');
    sentilo.publishObservations(sensorDataValue, samplesOptions);
}, systemObservationsTimeout);