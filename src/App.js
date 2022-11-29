import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { apiRequest, getAirlineData, getAirportData, getFlightRoutes } from "./APIRequests.js";
import "./App.css";
import jsonFlightData from "./assets/predefinedData.json";
import { aggregataTotalDistance, calculateRouteDistance } from "./Distance.js";
import { filterData, FilterSliders } from "./Filter.js";
import { SetupProgressBar } from "./ProgressBar.js";
import { SortByMenu, sortData } from "./Sort.js";

const importAllLogos = (r) => {
  //Way to import 100s of images without writing import statements
  let images = {};
  r.keys().map((item, _) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

//Will only show 1000 relevant planes in order to reduce the memory usage
function CurrentAirplenStatus({ data, filter, sortBy, bookmark, setBookmark, logos }) {
  const dataToRender = sortData(filterData(data, filter), sortBy);
  const onSetBookMark = useCallback(
    (index) => {
      //using dictionary instead of list for bookmarks in order to reduce memory usage
      if (bookmark && index in bookmark) {
        const currVal = bookmark[index];
        setBookmark((prevState) => ({ ...prevState, [index]: !currVal }));
      } else {
        setBookmark((prevState) => ({ ...prevState, [index]: true }));
      }
    },
    [bookmark, setBookmark]
  );

  const dataSection = dataToRender.map((flight, index) => {
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

    const invalidCallsign = callsign === null || callsign === undefined || callsign.trim() === "";

    const routeDistance = flight["totalDistance"];

    const flightID = flight["id"];

    const logoPath = invalidCallsign ? null : callsign.slice(0, 3) + ".png";

    return (
      <div key={index} className="col-sm-12 col-md-6 col-lg-6">
        <FormControl component="fieldset" className="text-center mx-auto">
          <FormControlLabel
            value="start"
            control={
              <Tooltip title="Click to add / remove to bookmark" placement="top">
                <Checkbox
                  icon={<BookmarkBorderIcon />}
                  checkedIcon={<BookmarkIcon />}
                  onChange={() => {
                    onSetBookMark(flightID);
                  }}
                  checked={bookmark && flightID in bookmark && bookmark[flightID] === true ? true : false}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: "2rem",
                    },
                  }}
                />
              </Tooltip>
            }
            label={
              <Typography variant="h4">
                <img style={{ maxWidth: "50px", marginRight: "10px" }} src={logos[logoPath]} />
                {invalidCallsign ? "Callsign Undefined" : callsign}
              </Typography>
            }
            labelPlacement="start"
          />
        </FormControl>
        {<p>Airline: {airline === null ? "Airline not found" : airline}</p>}
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
        <br></br>
        <br></br>
      </div>
    );
  });
  return (
    <div className="container">
      <div className="row">{dataSection}</div>
    </div>
  );
}

function ShowAggregatedContent({ totalDistance }) {
  const knownDistance = totalDistance[0].toFixed(3);
  const unknownRouteTotal = totalDistance[1];
  return (
    <div>
      <h3>Aggregation (Filters applied in bookmark will not affect the below stats)</h3>
      <h4>Total Route Distance (for recognized flights): {knownDistance} km</h4>
      <h4>Number of Unrecognized Flights: {unknownRouteTotal}</h4>
      <br></br>
    </div>
  );
}

function ViewBookmarked({ data, bookmark, filter, sortBy, setBookmark, logos }) {
  const dataToRender = data.filter((flight) => {
    return flight["id"] in bookmark && bookmark[flight["id"]] === true;
  });
  const totalRouteDistance = aggregataTotalDistance(dataToRender);
  return (
    <div>
      <ShowAggregatedContent totalDistance={totalRouteDistance} />
      <CurrentAirplenStatus
        data={dataToRender}
        filter={filter}
        sortBy={sortBy}
        bookmark={bookmark}
        setBookmark={setBookmark}
        logos={logos}
      />
    </div>
  );
}

function App() {
  const [flights, setFlights] = useState();
  const [loadComplete, setLoadComplete] = useState(false);

  const [batchLoadingIndex, setbatchLoadingIndex] = useState(0);
  const [loadStartIndex, setLoadStartIndex] = useState(0);

  const [dataFilter, setDataFilter] = useState({
    showNullAirlineEntry: true,
    altitude: [5000, 7000],
    speed: [300, 500],
    routeDistance: [0, 25000],
    showUnknownRouteDistance: true,
  });
  const [sortBy, setSortBy] = useState("Default");

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [dataSize, setDataSize] = useState(1);

  const [bookmark, setBookmark] = useState({});
  const [logos, setLogos] = useState([]);

  const [viewBookmarked, setViewBookmarked] = useState(false);

  const [loadUsingJSON, setLoadUsingJSON] = useState(true);

  const batchLoadingItemNum = 500;

  useEffect(() => {
    const getFlightsFromJSON = jsonFlightData;
    loadUsingJSON && setDataSize(getFlightsFromJSON.states.length);
    const loadInit = async (data) => {
      //Initialize/reset the state to take care of the case when the user decides to change between live and static data
      setLoadComplete(false);
      setBookmark({});
      setSortBy("Default");
      setDataFilter({
        showNullAirlineEntry: true,
        altitude: [5000, 7000],
        speed: [300, 500],
        routeDistance: [0, 25000],
        showUnknownRouteDistance: true,
      });

      !loadUsingJSON && setDataSize(data.states.length);

      const flightStates = loadUsingJSON ? getFlightsFromJSON.states : data.states;

      const tmp = flightStates.map(async (flight, index) => {
        if (index < batchLoadingItemNum) {
          const resp = await getFlightRoutes(flight[1]);
          const airlineName = await getAirlineData(flight[1]);
          const airportData = await getAirportData(resp);
          return { ...flight, callsign: resp, airline: airlineName, airportData: airportData, id: index };
        }
        return { ...flight, callsign: null, airline: null, airportData: null, id: index };
      });
      await Promise.all(tmp).then((out) => {
        setLoadStartIndex(batchLoadingItemNum);
        setbatchLoadingIndex(0);
        setLoadingProgress(batchLoadingItemNum);
        setFlights(calculateRouteDistance(out, 0, batchLoadingItemNum));
      });
    };

    const getFlightsFromAPI = async () => {
      await apiRequest().then((out) => {
        setFlights(out);
        // the output data gets passed into loadInit. This is to prevent the case when the set flight does not get completed on time.
        // This could happen especially since the data we handle it extremely large.
        loadInit(out);
      });
    };

    if (loadUsingJSON) {
      loadInit(null);
    } else {
      getFlightsFromAPI();
    }
  }, [loadUsingJSON]);

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
          const airlineName = await getAirlineData(flight[1]);
          const airportData = await getAirportData(resp);
          return { ...flight, callsign: resp, airline: airlineName, airportData: airportData, id: index };
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
        } else {
          setLoadComplete(true);
          const images = importAllLogos(require.context("./assets/logos", false, /\.(png)$/));
          setLogos(images);
        }
      });
    };
    loadMoreData();
  }, [batchLoadingIndex, loadStartIndex]);

  if (loadComplete === true && batchLoadingIndex === 0) {
    setbatchLoadingIndex(1);
  }

  const changeLoadingMode = useCallback(() => {
    setLoadUsingJSON(!loadUsingJSON);
  }, [loadUsingJSON]);

  return (
    <div className="App">
      <h1 className="mb-5">{loadUsingJSON ? "Predefined Flight Detail Viewer" : "Live Flight Detail Viewer"}</h1>
      {(100 * loadingProgress) / dataSize < 99.5 && <SetupProgressBar value={(100 * loadingProgress) / dataSize} />}

      {loadComplete && (
        <FilterSliders
          dataFilter={dataFilter}
          setDataFilter={setDataFilter}
          setViewBookmarked={setViewBookmarked}
          viewBookmarked={viewBookmarked}
        />
      )}
      {loadComplete && <SortByMenu sortBy={sortBy} setSortBy={setSortBy} />}
      {loadComplete && viewBookmarked && (
        <ViewBookmarked
          bookmark={bookmark}
          data={flights}
          filter={dataFilter}
          sortBy={sortBy}
          setBookmark={setBookmark}
          logos={logos}
        />
      )}
      {loadComplete === false ? (
        <div>Please wait for the data to load</div>
      ) : (
        !viewBookmarked && (
          <CurrentAirplenStatus
            data={flights}
            filter={dataFilter}
            sortBy={sortBy}
            bookmark={bookmark}
            setBookmark={setBookmark}
            logos={logos}
          />
        )
      )}
      {
        <Button variant="contained" color="warning" onClick={changeLoadingMode} className="mb-5">
          {loadUsingJSON
            ? "Load Using Live Data"
            : "Load predefined data (please select this when you can not load the page)"}
        </Button>
      }
    </div>
  );
}

export default App;
