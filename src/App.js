import { useEffect, useState } from "react";
import { apiRequest, getAirlineData, getAirportData, getFlightRoutes, saveDataAsJSON } from "./APIRequests.js";
import "./App.css";
import jsonFlightData from "./assets/data.json";
import { calculateRouteDistance } from "./Distance.js";
import { filterData, FilterSliders } from "./Filter.js";
import { SetupProgressBar } from "./ProgressBar.js";
import { SortByMenu, sortData } from "./Sort.js";

//https://github.com/sexym0nk3y/airline-logos airline logo

function CurrentAirplenStatus({ data, filter, sortBy }) {
  const dataToRender = sortData(filterData(data, filter), sortBy);

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

    const invalidCallsign = callsign === null || callsign === undefined || callsign.trim() === '';

    const routeDistance = flight["totalDistance"];

    return (
      <div key={index}>
        <h1>CallSign: {invalidCallsign ? "Undefined" : callsign}</h1>
        {!invalidCallsign && <p>Airline: {airline === null ? "Airline not found" : airline}</p>}
        <p>Route (ICAO): {route === null ? "Route not found" : route}</p>
        {route !== null && <p>Route: {airportNames === "" ? "Route not found" : airportNames}</p>}
        {route !== null && (
          <p>
            Total Route Distance: {routeDistance === null ? "Distance not available" : routeDistance.toFixed(2) + " km"}
          </p>
        )}
        <hr className={"w-25 mx-auto"} />
        <p>Velocity: {(parseFloat(flight[9]) * 3.6).toFixed(3)} km/h</p>
        <p>Geographic Altitude: {flight[13] ?? "Altitude not found"}</p>
        <p>
          Longitude / Latitude: {parseFloat(flight[5])} / {parseFloat(flight[6])}
        </p>
        <hr></hr>
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

  const [dataFilter, setDataFilter] = useState({ showNullAirlineEntry: true, altitude: [0, 15000], speed: [0, 1500] });
  const [sortBy, setSortBy] = useState("Default");

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [dataSize, setDataSize] = useState(1);

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
    setDataSize(getFlightsFromJSON.states.length);
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
        setLoadComplete(true);
        setLoadStartIndex(batchLoadingItemNum);
        setLoadingProgress(batchLoadingItemNum);
        setFlights(calculateRouteDistance(out, 0, batchLoadingItemNum));
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
        setLoadingProgress(Math.min(dataSize, loadingProgress + batchLoadingItemNum));
        setFlights(calculateRouteDistance(out, loadStartIndex, loadStartIndex + batchLoadingItemNum));
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

  return (
    <div className="App">
      <h1 className="mb-5">Flight Description</h1>
      {(100 * loadingProgress) / dataSize < 99.5 && <SetupProgressBar value={(100 * loadingProgress) / dataSize} />}

      {loadComplete && <FilterSliders dataFilter={dataFilter} setDataFilter={setDataFilter} />}
      {loadComplete && <SortByMenu sortBy={sortBy} setSortBy={setSortBy} />}
      {loadComplete === false ? (
        <div>Please wait for the data to load</div>
      ) : (
        <CurrentAirplenStatus data={flights} filter={dataFilter} sortBy={sortBy} />
      )}

      <button onClick={() => saveDataAsJSON(flights)}> Save RealTime JSON Data </button>
    </div>
  );
}

export default App;
