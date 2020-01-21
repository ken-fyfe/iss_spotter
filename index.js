// index.js
const {fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes} = require('./iss');

fetchMyIP((error, ip) => {
  if (error) {
    console.log("It didn't work!" , error);
    return;
  }
  console.log('It worked! Returned IP:' , ip);
});

// fetchCoordsByIP(ip, (error, latlong) => {
fetchCoordsByIP('68.146.34.29', (error, latlong) => {
  if (error) {
    console.log('Some problem here! Error code: ', error);
    return;
  }
  console.log('Coordinate (lat, long)', latlong);
});

fetchISSFlyOverTimes({ latitude: '51.18340', longitude: '-114.46870' }, (error, times) => {
  if (error) {
    console.log('Some problem here! Error code: ', error);
    return;
  }
  console.log('fly over times: ', times);
});