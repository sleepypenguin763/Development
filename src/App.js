import axios from 'axios';
import './App.css';
import { useEffect, useState } from 'react';
import jsonFlightData from "./assets/data.json";

const apiRequest = async(path) => {
  const BASE_URL = "https://opensky-network.org/api/";
  const currFlightPath = path == null ? "states/all" : path;
  const endpoint = BASE_URL + currFlightPath;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
    }
  })
  return response.json();
}

const saveDataAsJSON = async(flights) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(flights)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "data.json";

  link.click();
};


//Call this inside useEffect
const getFlightRouteData = async(flightsData) =>{
  const url = 'https://sleepypenguin763.github.io/FlightData/routes/AAC.json';

  const response = await fetch(url);
  let queryResult = "11111"
  await response.json().then(json => queryResult = json);
  
  //const cleanData = flightsData.states.map(async(flight) => {
   // const callsign = flight[1];
    //return null;
  //});
  return queryResult;
}

function App() {
  const [flights, setFlights] = useState([]);
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    /*
    const getFlightsFromAPI = async() => {
      const resp = await apiRequest();
      setFlights(resp);
    };
    getFlightsFromAPI();*/
    const getFlightsFromJSON = jsonFlightData;
    setFlights(getFlightsFromJSON);
    const getFlightRoute = async() => {
      const resp = await getFlightRouteData(flights);
      setRoutes(resp);
    };
    getFlightRoute();
    console.log(routes["AAC710"]["AirportCodes"]);
  }, []);

 const data = flights.states;
 //https://opensky-network.org/api/tracks/all?icao24=n71lp&time=0
 //https://opensky-network.org/api/routes?callsign=UAL5
 //https://opensky-network.org/api/airports?icao=KIAH

  return (
    <div className="App">
      <h1>Flight Description</h1>
      {data == null ? <div>Please wait for the data to load</div> : data.map((flight) => (
        <div>
          <h1>CallSign: {flight[1]}</h1>
          <p>Origin: {flight[2]}</p>
          <p>Velocity: {(parseFloat(flight[9]) * 3.6).toFixed(3)} km/h</p>
          <p>Geographic Altitude: {flight[13]}</p>
          <br></br>
        </div>
      ))}

      <button onClick={() => saveDataAsJSON(flights)}> Save RealTime JSON Data </button>
    </div>
  );
}

export default App;
