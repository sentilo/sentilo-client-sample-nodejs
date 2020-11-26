# Example usage Sentilo Node.js client library

This repository is a code for the [tutorial on Sentilo with NodeJS and Rapberry Pi](https://sentilo.readthedocs.io/en/latest/tutorials/raspberrypi_tutorial.html).
 This is a sample code that uses the [Sentilo Javascript Client Library](https://github.com/sentilo/sentilo-client-nodejs). 

This code will work on Node.js at least v8.0+.

Creates a Sentilo client that lets you operate a GPIO actuator via a simple HTTP API, via the Sentilo broker. 
It also publishes various data to Sentilo every minute.   

## Prerequistes
- Some Sentilo instance, either your own, or [Thingtia](https://www.thingtia.cloud/), or even the [Sentilo VM](https://sentilo.readthedocs.io/en/latest/use_a_virtual_machine.html)
- Your Raspi's IP should be accessible by the Sentilo instance (only needed for the subscription). If you're running Sentilo on your LAN or localhost, 
  you should be fine. If you're on LAN and using Thingtia, the subscription part won't probably work unless 
  you have a static IP address and setup a NAT.
- Node.js 8 or higher
- Npm


## Setting up Sentilo
- You have to create a new provider 'samples-provider' or choose an existing one.  
- In the Catalog, section "Types of Sensors / Actuators" ensure a `sensorType` 'status' exists
- In the Catalog, section "Types of components" ensure a `componentType` 'generic' exists


## Configuration

Edit the `samplesOptions` in `server.js` file:
 
- Replace `YOUR_SENTILO-INSTANCE-IDENTITY-KEY` with the token of your provider 'samples-provider'
- Replace `YOUR_SENTILO-INSTANCE-URL` with the URL of Sentilo¡s API server, i.e. 'http://sentilo:8081'
<pre>
const samplesOptions = {
    apiUrl : 'YOUR_SENTILO-INSTANCE-URL',
    headers : {
           identity_key : 'YOUR_SENTILO-INSTANCE-IDENTITY-KEY'
    },
    provider : 'samples-provider',
    sensor : 'sample-sensor-nodejs',
    component : 'sample-component',
    componentType : 'generic',
    sensorDataType : 'TEXT',
    sensorType : 'status',
    sensorUnit : '',
    sensorLocation : '41.387015 2.170047'
};
</pre>



## Running the sample

Run the sample by typing in bash:
<pre>
npm install
$ node server.js
</pre>

You can then access the server at http://your-raspi-ip:8000.

