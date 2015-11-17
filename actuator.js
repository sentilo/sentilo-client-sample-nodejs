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

var Gpio = require('onoff').Gpio;
var led;

/**
 * Sample module that perfoms operations over the actuator
 */
module.exports = {

	/**
     * Initializes the actuator. For this example, we've connected a LED as a
     * output in the GPIO 14
     */
    init : function() {
        // Configure the GPIO as OUTPUT
        led = new Gpio(14, 'out');

        console.log('Turning OFF the LED');

        // Turn off the LED on startup
        led.writeSync(0);
    },

    /**
     * Execute an order in the actuator. For this example, we've mounted a LED
     * in GPIO 14, where we can turn it ON (order=ON) or OFF (order=OFF)
     * 
     * @param order
     *            A Sentilo order object structure
     */
    executeOrder : function(order) {
        console.log('Executing order: ' + order.message);

        if (order.message === 'ON') {
            console.log('Turning ON the LED');
            led.writeSync(1);
        } else if (order.message === 'OFF') {
            console.log('Turning OFF the LED');
            led.writeSync(0);
        }

    }

};