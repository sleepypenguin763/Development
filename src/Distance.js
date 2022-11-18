const distance = (lat1, lat2, lon1, lon2) => {
  // code from: https://www.geeksforgeeks.org/program-distance-two-points-earth/

  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = (lon1 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;
  const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  const c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  const r = 6371;

  // calculate the result
  return c * r;
};

const calculateRouteDistance = (data) => {
  const out = data.map((flight) => {
    const airportData = flight["airportData"] === null ? null : flight["airportData"];
    let longLatCoordinates = [];
    if (airportData != null) {
      for (var c in airportData) {
        if (airportData[c] === null || airportData[c] === undefined || airportData[c] === "") {
          longLatCoordinates.push([null, null]);
        } else {
          longLatCoordinates.push([airportData[c]["Latitude"], airportData[c]["Longitude"]]);
        }
      }
    }
    let routeDistance = flight["airportData"] === null ? null : 0;
    if (longLatCoordinates.length >= 2) {
      for (var i = 0; i < longLatCoordinates.length - 1; i++) {
        if (
          longLatCoordinates[i][0] === null ||
          longLatCoordinates[i][1] === null ||
          longLatCoordinates[i + 1][0] === null ||
          longLatCoordinates[i + 1][1] === null
        ) {
          routeDistance = null;
          break;
        }
        routeDistance += distance(
          longLatCoordinates[i][0],
          longLatCoordinates[i + 1][0],
          longLatCoordinates[i][1],
          longLatCoordinates[i + 1][1]
        );
      }
    }
    return { ...flight, totalDistance: routeDistance };
  });
  return out;
};

export { calculateRouteDistance };
