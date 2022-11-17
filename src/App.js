import "./App.css";
import { useCallback, useEffect, useState } from "react";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import jsonFlightData from "./assets/data.json";
import FlightIcon from "@mui/icons-material/Flight";

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
  if (filter.length !== 0 && filter.showNullAirlineEntry !== null && filter.showNullAirlineEntry === false) {
    dataToRender = dataToRender.filter((flight) => {
      return flight["airline"] !== null;
    });
  }
  if (filter.length !== 0 && filter.altitude !== null && filter.altitude !== undefined){
    dataToRender = dataToRender.filter((flight) => {
      return (flight[13] !== null && flight[13] !== undefined && flight[13] >= filter.altitude[0] && flight[13] <= filter.altitude[1]);
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

const CheckMarkSlider = styled(Slider)(({ theme }) => ({
  color: "#3a8589",
  height: 3,
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 25,
    width: 25,
    backgroundColor: "#3a8589",
    color: "#fff",
    "& .checkmark-bar": {
      height: 9,
      width: 1,
      backgroundColor: "currentColor",
      marginLeft: 1,
      marginRight: 1
    }
  },
  "& .MuiSlider-track": {
    color: theme.palette.mode = "#3a8589",
    height: 5
  },
  "& .MuiSlider-rail": {
    color: theme.palette.mode === "dark" ? "#3a8589" : "#d8d8d8",
    opacity: theme.palette.mode === "dark" ? undefined : 1,
    height: 5
  }
}));

function CheckMarkThumbComponent(props) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <FlightIcon />
    </SliderThumb>
  );
};

function SetupProgressBar({value}){
  //Loading screen credit: https://codesandbox.io/s/customizedslider-material-demo-forked-299xcn?fontsize=14&hidenavigation=1&theme=dark&file=/demo.tsx:32-91
  return (
    <div className="w-50 mx-auto mb-5">
      <CheckMarkSlider
        value={value}
        disabled
        components={{ Thumb: CheckMarkThumbComponent }}
      />
    </div>
  );
}

function App() {
  const [flights, setFlights] = useState();
  const [loadComplete, setLoadComplete] = useState(false);

  const [batchLoadingIndex, setbatchLoadingIndex] = useState(0);
  const [loadStartIndex, setLoadStartIndex] = useState(0);

  const [loadedLiveFlights, setLoadedLiveFlights] = useState(false);

  const [dataFilter, setDataFilter] = useState({});

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
        setFlights(out);
        setLoadComplete(true);
        setLoadStartIndex(batchLoadingItemNum);
        setLoadingProgress(batchLoadingItemNum);
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
  function GetSlider(){
    const [enableNullAirlineEntry, setEnableNullAirlineEntry] = useState((dataFilter.showNullAirlineEntry === undefined) ? true : dataFilter.showNullAirlineEntry);
    const [altitudeFilter, setAltitudeFilter] = useState((dataFilter.altitude === undefined) ? [0, 15000] : dataFilter.altitude);
    const handleChange = (event, newValue) => {
      setAltitudeFilter(newValue);
    };
    const filterDataByAltitude = useCallback(() => {
      setDataFilter({...dataFilter, altitude: altitudeFilter});
    }, [altitudeFilter]);

    const filterDataByNullEntry = useCallback(() => {
      setDataFilter({...dataFilter, showNullAirlineEntry: !enableNullAirlineEntry});
      setEnableNullAirlineEntry(!enableNullAirlineEntry);
    }, [enableNullAirlineEntry]);
  
    function valueText(value) {
      return `${value} km/h`;
    }
    return (
      <div className="container">
        <div className="row mb-5">
          <div className="col-6 mx-auto">
            <button onClick={filterDataByNullEntry}>Remove flights operated by unrecognized airline</button>
          </div>
        </div>
        <div className="row justify-content-center mb-5 align-items-center">
          <div className="col-4 text-end">Altitude:</div>
          <div className="col-4">
            <Slider
              getAriaLabel={() => "Filter with Altitude"}
              value={altitudeFilter}
              onChange={handleChange}
              getAriaValueText={valueText}
              step={100}
              min={0}
              max={15000}
              valueLabelDisplay={"auto"}
            />
          </div>
          <div className="col-4 text-start">
            <button className="btn btn-primary" onClick={filterDataByAltitude} >Filter With Altitude</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <h1>Flight Description</h1>
      {<SetupProgressBar value={100 * loadingProgress / dataSize}/>}

      {loadComplete && <GetSlider/>}
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
