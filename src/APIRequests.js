const twoCharRouteDirs = ["CN", "N9", "SH", "N5", "BM"]; //This is a constant, and will not be updated what so ever during the life cycle, so no need to use states.

const apiRequest = async (path) => {
  const BASE_URL = "https://opensky-network.org/api/";
  const currFlightPath = path == null ? "states/all" : path;
  const endpoint = BASE_URL + currFlightPath;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

const saveDataAsJSON = async (flights) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(flights))}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "data.json";

  link.click();
};

const getFlightRoutes = async (callsign) => {
  if (callsign === undefined || callsign === null) {
    return null;
  }
  const firstThreeChar = callsign.slice(0, 3);
  const callsignWithoutSpace = callsign.replace(/ /g, "");
  const url =
    "https://sleepypenguin763.github.io/Aviation/routes/" +
    firstThreeChar +
    "/" +
    callsignWithoutSpace +
    "/AirportCodes";

  const response = await fetch(url);
  if (response.status !== 200) {
    const firstTwoChar = callsign.slice(0, 2);
    if ((firstTwoChar in twoCharRouteDirs) === false){
      return null;
    }
    const url2 =
      "https://sleepypenguin763.github.io/Aviation/routes/" +
      firstTwoChar +
      "-/" +
      callsignWithoutSpace +
      "/AirportCodes";
    const response2 = await fetch(url2);
    if (response2.status === 404) {
      return null;
    }
    return await response2.json();
  }
  return await response.json();
};

const getAirlineData = async (callsign) => {
  if (callsign === undefined || callsign === null) {
    return null;
  }
  const firstThreeChar = callsign.slice(0, 3);
  const url = "https://sleepypenguin763.github.io/Airlines/airlines/" + firstThreeChar;
  const response = await fetch(url);
  if (response.status === 404) {
    const firstTwoChar = callsign.slice(0, 2);
    const url2 = "https://sleepypenguin763.github.io/Airlines/airlines/" + firstTwoChar;
    const response2 = await fetch(url2);
    if (response2.status === 404) {
      return null;
    }
    return await response2.json();
  }
  return await response.json();
};

const getAirportData = async (resp) => {
  if (resp === undefined || resp === null) {
    return null;
  }
  const route = resp["AirportCodes"];
  const split = route.split("-");
  const airportData = split.map(async (airport) => {
    const fullAirportCode = airport.slice(0, 4);
    const firstTwoChar = airport.slice(0, 2);
    const url = "https://sleepypenguin763.github.io/Airlines/airports/" + firstTwoChar + "/" + fullAirportCode;
    const response = await fetch(url);
    if (response.status === 404) {
      return null;
    }
    return await response.json();
  });
  return await Promise.all(airportData).then((out) => {
    return out;
  });
};

export { apiRequest, saveDataAsJSON, getFlightRoutes, getAirlineData, getAirportData };
