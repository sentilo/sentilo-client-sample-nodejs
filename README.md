# Sample for Sentilo Node.js client library v1.1.0

This is a sample code that uses the Sentilo Nodejs Client Library. The _server_ application file is the _server.js_ file, that imports the library.

## Install

First of all it is mandatory to install the local dependencies through _npm_. 

Use the following command:

<pre>$ npm install</pre>


## Config

You must apply a few changes in your code in order to complete the sample configuration.

Follow next steps to configure this sample:

- Download and put in the same directory the Sentilo's Nodejs client library and this sample code
- Edit the _server.js_ file to set your Sentilo instance configurations, and replace the sequences _YOUR-SENTILO-INSTANCE-XXX_ with your custom configurations as it corresponds, such some like this:
<pre>
var samplesOptions = {
    host : 'YOUR-SENTILO-INSTANCE-HOST-IP',
    port : 'YOUR-SENTILO-INSTANCE-HOST-PORT',
    headers : {
        identity_key : 'YOUR_SENTILO-INSTANCE-DEFAULT-IDENTITY-KEY'
    }
    tokenId : 'YOUR-SENTILO-INSTANCE-IDENTITY-KEY',
    providerTokenId : 'YOUR-SENTILO-INSTANCE-PROVIDER-IDENTITY-KEY',
	providerId  : 'samples-provider',
	sensorId	: 'sample-sensor-nodejs',
	componentType : 'generic',
	sensorDataType : 'TEXT',
	sensorType : 'status',
	sensorUnit : '',
	sensorLocation: '41.4122494 2.2101553'
};
</pre>

Note that the sensor type must already exist.

## Usage

Once you have imported and initialized the **sentilo-client-nodejs** library, you can invoke the services that you'll find in the **node_modules/sentilo-client-nodejs/sentilo.js** file (this is a simple wrapper to the service files):

* **init** : initialize all library client services
* **existsSensorInCatalog** : test if is there the sensor in the catalog
* **createSensor** : create the sensor in the catalog
* **publishObservations** : publish observations to the Sentilo instance
* **createAlerts** : create alerts passed as list
* **publishAlarm** : publish an alarm for an alert

For more information, please look at https://github.com/sentilo/sentilo-client-nodejs, where you'll find all the available services.

## Running the sample

Run the sample by typping in bash:
<pre>$ node server.js</pre>

