import "./App.css";
import { useEffect, useState } from "react";
import { Slider } from "@mui/material";
import jsonFlightData from "./assets/data.json";

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
  if (response.status === 404) {
    const firstTwoChar = callsign.slice(0, 2);
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

const getAirlineData = async (callsign, resp) => {
  if (callsign === undefined || callsign === null || resp === null) {
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

function CurrentAirplenStatus({ data, filter }) {
  let dataToRender = data;
  if (filter.length === 1 && filter[0] === "RemoveAirlineNotFound") {
    dataToRender = data.filter((flight) => {
      return flight["airline"] !== null;
    });
  }

  return dataToRender.map((flight, index) => {
    const callsign = flight[1];
    const flightData = flight["callsign"] === null ? null : flight["callsign"];
    let route = null;
    if (flightData != null) {
      for (var a in flightData) {
        if (a === "AirportCodes") {
          route = flightData[a];
        }
      }
    }

    const airlineData = flight["airline"] === null ? null : flight["airline"];
    let airline = null;
    if (airlineData != null) {
      for (var b in airlineData) {
        if (b === "Name") {
          airline = airlineData[b];
        }
      }
    }

    const airportData = flight["airportData"] === null ? null : flight["airportData"];
    let airportNames = "";
    if (airportData != null) {
      for (var c in airportData) {
        if (airportData[c] === null || airportData[c] === undefined || airportData[c] === "") {
          airportNames += "Airport not found";
        } else {
          airportNames += airportData[c]["Location"];
        }
        if (c < airportData.length - 1) {
          airportNames += " => ";
        }
      }
    }

    const invalidCallsign = callsign === null || callsign === undefined || callsign === "";

    return (
      <div key={index}>
        <h1>CallSign: {invalidCallsign ? "Undefined" : callsign}</h1>
        <p>Airline: {airline === null ? "Airline not found" : airline}</p>
        <p>Route (ICAO): {route === null ? "Route not found" : route}</p>
        <p>Route: {airportNames === "" ? "Route not found" : airportNames}</p>
        <p>Velocity: {(parseFloat(flight[9]) * 3.6).toFixed(3)} km/h</p>
        <p>Geographic Altitude: {flight[13]}</p>
        <p>
          Longitude / Latitude: {parseFloat(flight[5])} / {parseFloat(flight[6])}
        </p>

        <br></br>
      </div>
    );
  });
}

function App() {
  const [flights, setFlights] = useState();
  const [loadComplete, setLoadComplete] = useState(false);

  const [batchLoadingIndex, setbatchLoadingIndex] = useState(0);
  const [loadStartIndex, setLoadStartIndex] = useState(0);

  const [loadedLiveFlights, setLoadedLiveFlights] = useState(false);

  const [dataFilter, setDataFilter] = useState([]);

  const loadUsingJSON = true;

  const batchLoadingItemNum = 500;

  useEffect(() => {
    const getFlightsFromAPI = async () => {
      await apiRequest().then((out) => {
        setFlights(out);
        setLoadedLiveFlights(true);
      });
    };
    !loadUsingJSON && getFlightsFromAPI();

    const getFlightsFromJSON = jsonFlightData;
    const loadInit = async () => {
      if (loadedLiveFlights === false && loadUsingJSON === false) {
        return;
      }
      const tmp = getFlightsFromJSON.states.map(async (flight, index) => {
        if (index < batchLoadingItemNum) {
          const resp = await getFlightRoutes(flight[1]);
          const airlineName = await getAirlineData(flight[1], resp);
          const airportData = await getAirportData(resp);
          return { ...flight, callsign: resp, airline: airlineName, airportData: airportData };
        }
        return { ...flight, callsign: null, airline: null, airportData: null };
      });
      await Promise.all(tmp).then((out) => {
        setFlights(out);
        setLoadComplete(true);
        setLoadStartIndex(batchLoadingItemNum);
      });
    };
    loadInit();
  }, []);

  /*
    Manual Batch Loading in order for Chrome to not raise "net::ERR_INSUFFICIENT_RESOURCES"
  */
  useEffect(() => {
    const loadMoreData = async () => {
      if (flights === null || flights === undefined) {
        return null;
      }
      const tmp = flights.map(async (flight, index) => {
        if ((index >= loadStartIndex) & (index < loadStartIndex + batchLoadingItemNum)) {
          const resp = await getFlightRoutes(flight[1]);
          const airlineName = await getAirlineData(flight[1], resp);
          const airportData = await getAirportData(resp);
          return { ...flight, callsign: resp, airline: airlineName, airportData: airportData };
        }
        return { ...flight };
      });
      await Promise.all(tmp).then((out) => {
        setFlights(out);
        if (loadStartIndex + batchLoadingItemNum < flights.length) {
          setLoadStartIndex(loadStartIndex + batchLoadingItemNum);
          setbatchLoadingIndex(batchLoadingIndex + 1);
        }
      });
    };
    loadMoreData();
  }, [batchLoadingIndex, loadStartIndex]);

  if (loadComplete === true && batchLoadingIndex === 0) {
    setbatchLoadingIndex(1);
  }

  /* 
    Simple Data Filter that removed airline that is not found.
  */
  const filterData = () => {
    if (dataFilter.length === 0) {
      setDataFilter(["RemoveAirlineNotFound"]);
    } else {
      setDataFilter([]);
    }
  };

  const [altitude, setAltitude] = useState([0, 20000]);
  function valueText(value) {
    return `${value} km/h`;
  }
  const handleChange = (event, newValue) => {
    setAltitude(newValue);
  };

  return (
    <div className="App">
      <h1>Flight Description</h1>
      {loadComplete && (
        <div className="container">
          <div className="row mb-5">
            <div calassName="col-6">
              <button onClick={() => filterData()}>Remove flights operated by unrecognized airline</button>
            </div>
          </div>
          <div className="row justify-content-center mb-5 align-items-center">
            <div className="col-4 text-end">Altitude:</div>
            <div className="col-4">
              <Slider
                getAriaLabel={() => "Filter with Altitude"}
                value={altitude}
                onChange={handleChange}
                getAriaValueText={valueText}
                step={100}
                min={0}
                max={20000}
                valueLabelDisplay={"auto"}
              />
            </div>
            <div className="col-4 text-start">
              <button className="btn btn-primary">Filter With Altitude</button>
            </div>
          </div>
        </div>
      )}
      {loadComplete === false ? (
        <div>Please wait for the data to load</div>
      ) : (
        <CurrentAirplenStatus data={flights} filter={dataFilter} />
      )}

      <button onClick={() => saveDataAsJSON(flights)}> Save RealTime JSON Data </button>
    </div>
  );
}

export default App;
