// iss.js

const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};

/**
 * Makes a single API request to retrieve the lat/lng for a given IPv4 address.
 * Input:
 *   - The ip (ipv4) address (string)
 *   - A callback (to pass back an error or the lat/lng object)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The lat and lng as an object (null if error). Example:
 *     { latitude: '49.27670', longitude: '-123.13000' }
 */
const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`), null);
      return;
    }

    const { latitude, longitude } = JSON.parse(body).data;
    // console.log('lat/lng data:', { latitude, longitude });

    callback(null, { latitude, longitude });
  });
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

// Only export nextISSTimesForMyLocation and not the other three (API request) functions.
// This is because they are not needed by external modules.
module.exports = { nextISSTimesForMyLocation };

// --------------------------- previous version of solution ------------------
// // iss.js
// /*
//  * Makes a single API request to retrieve the user's IP address.
//  * Input:
//  *   - A callback (to pass back an error or the IP string)
//  * Returns (via Callback):
//  *   - An error, if any (nullable)
//  *   - The IP address as a string (null if error). Example: "162.245.144.188"
//  */

// const request = require('request');
// const URL = 'https://api.ipify.org?format=json';
// const fetchMyIP = function(callback) {
//   request(URL, (error, response, IPbody) => {  // use request to fetch IP address from JSON API
//     if (response.statusCode !== 200) {  // if non-200 status, assume server error
//       const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${IPbody}`;
//       callback(Error(msg), null);
//       return;
//     }
//     if (error) {
//       callback(error, null);
//       return;
//     } else {
//       const IPdata = JSON.parse(IPbody);
//       const IPaddress = IPdata.ip;
//       callback(null, IPaddress);
//     }
//   });
// };

// const fetchCoordsByIP = function(ip, callback) {
//   const ipURL = 'https://ipvigilante.com/' + ip;
//   // const ipURL = 'https://ipvigilante.com/' + '207.228.85.169';
//   // console.log('ipURL :', ipURL);
//   request(ipURL, (error, response, locBody) => {  // use request to fetch location from IP address
//     if (response.statusCode !== 200) {  // if non-200 status, assume server error
//       const msg = `Status Code ${response.statusCode} when fetching location. Response: ${locBody}`;
//       callback(Error(msg), null);
//       return;
//     }
//     if (error) {
//       callback(error, null);
//       return;
//     } else {
//       const locationData = JSON.parse(locBody);
//       const latlong = {latitude: locationData.data.latitude, longitude: locationData.data.longitude};
//       callback(null, latlong);
//     }
//   });
// };

// /**
//  * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
//  * Input:
//  *   - An object with keys `latitude` and `longitude`
//  *   - A callback (to pass back an error or the array of resulting data)
//  * Returns (via Callback):
//  *   - An error, if any (nullable)
//  *   - The fly over times as an array of objects (null if error). Example:
//  *     [ { risetime: 134564234, duration: 600 }, ... ]
//  */
// const fetchISSFlyOverTimes = function(coords, callback) {

//   // { latitude: '51.18340', longitude: '-114.46870' }
//   const latlong = `lat=${coords.latitude}&lon=${coords.longitude}`;
//   // console.log('latlong :', latlong);
//   const flyoverURL = 'http://api.open-notify.org/iss-pass.json?' + latlong;
//   // console.log('flyoverULR :', flyoverURL);
//   request(flyoverURL, (error, response, flyoverBody) => {  // use request to fetch location from IP address
//     if (response.statusCode !== 200) {  // if non-200 status, assume server error
//       const msg = `Status Code ${response.statusCode} when fetching location. Response: ${flyoverBody}`;
//       callback(Error(msg), null);
//       return;
//     }
//     if (error) {
//       callback(error, null);
//       return;
//     } else {
//       const flyoverData = JSON.parse(flyoverBody);
//       const risetimeDuration = flyoverData.response;
//       // console.log('risetimeDuration :', risetimeDuration);
//       callback(null, risetimeDuration);
//     }
//   });
// };

// module.exports = {fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes};