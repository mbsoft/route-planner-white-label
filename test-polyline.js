const polyline = require('@mapbox/polyline');

// Test polyline from Google's documentation
const testPolyline = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

console.log('Mapbox polyline decode:', polyline.decode(testPolyline));

// Test precision
const mapboxResult = polyline.decode(testPolyline);
console.log('Mapbox first coordinate:', mapboxResult[0]);
console.log('Mapbox raw values (multiplied by 1e5):', mapboxResult[0].map(coord => coord * 1e5));

// Our current decoder logic
function decodePolyline(encoded) {
  const poly = [];
  let index = 0;
  let len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let shift = 0;
    let result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }

  return poly;
}

console.log('Our decoder:', decodePolyline(testPolyline));

// Test with different precision factors
function decodePolylineWithPrecision(encoded, precision = 1e5) {
  const poly = [];
  let index = 0;
  let len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let shift = 0;
    let result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / precision, lng / precision]);
  }

  return poly;
}

console.log('\nTesting different precision factors:');
console.log('With 1e5 (our current):', decodePolylineWithPrecision(testPolyline, 1e5)[0]);
console.log('With 1e6:', decodePolylineWithPrecision(testPolyline, 1e6)[0]);
console.log('With 1e7:', decodePolylineWithPrecision(testPolyline, 1e7)[0]);
console.log('With 1e4:', decodePolylineWithPrecision(testPolyline, 1e4)[0]); 