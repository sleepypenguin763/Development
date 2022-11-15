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

const getFlightRoutes = async(callsign) => {
  if (callsign === undefined || callsign === null) {
    return null;
  }
  const firstThreeChar = callsign.slice(0, 3);
  const callsignWithoutSpace = callsign.replace(/ /g, '');
  const url = 'https://sleepypenguin763.github.io/Aviation/routes/' + firstThreeChar + '/' + callsignWithoutSpace + '/AirportCodes';
  
  const response = await fetch(url);
  if (response.status === 404){
    //return null;
    const firstTwoChar = callsign.slice(0, 2);
    const url2 = 'https://sleepypenguin763.github.io/Aviation-Routes/' + firstTwoChar + '-/' + callsignWithoutSpace + '/AirportCodes';
    const response2 = await fetch(url2);
    if (response2.status === 404){
      return null;
    }
    return response2.json();
  }
  return response.json();
}

const getAirlineData = async(callsign, resp) => {
  if (callsign === undefined || callsign === null || resp === null) {
    return null;
  }
  const firstThreeChar = callsign.slice(0, 3);
  const url = 'https://sleepypenguin763.github.io/Aviation/airlines/' + firstThreeChar;
  const response = await fetch(url);
  if (response.status === 404){
    //return null;
    const firstTwoChar = callsign.slice(0, 2);
    const url2 = 'https://sleepypenguin763.github.io/Aviation-Routes/' + firstTwoChar;
    const response2 = await fetch(url2);
    if (response2.status === 404){
      return null;
    }
    return await response2.json();
  }
  return response.json();
}

function CurrentAirplenStatus({data}) {
  return(
    data.map((flight) => {
      const callsign = flight[1];
      const flightData = (flight["callsign"] === null) ? null : flight["callsign"];
      console.log(typeof(flightData));
      let route = null;
      if (flightData != null){
        for(var a in flightData){
          if (a == "AirportCodes"){
            route = flightData[a];
          }
        }
      }
      return (<div key={flight}>
        <h1>CallSign: {callsign}</h1>
        <p>Velocity: {(parseFloat(flight[9]) * 3.6).toFixed(3)} km/h</p>
        <p>Geographic Altitude: {flight[13]}</p>
        <p>Longitude / Latitude: {(parseFloat(flight[5]))} / {(parseFloat(flight[6]))}</p>
        <p>Route: {route == null ? "Can not find the route" : route}</p>
        <br></br>
      </div>
      );
    }));
}

function App() {
  const [flights, setFlights] = useState();
  const [loadComplete, setLoadComplete] = useState(false);
  useEffect(() => {
    /*
    const getFlightsFromAPI = async() => {
      const resp = await apiRequest();
      setFlights(resp);
    };
    getFlightsFromAPI();*/
    const getFlightsFromJSON = jsonFlightData;
    const loadInit = async() => {
      const tmp = getFlightsFromJSON.states.map(async(flight, index) => {
        if (index < 2000){
          const resp = getFlightRoutes(flight[1]);
          const airlineName = getAirlineData(flight[1], resp);

          return Promise.all([resp, airlineName]).then(([resp1, resp2]) => {
            return {...flight, callsign: resp1, airline: resp2};
          });
        }
        return {...flight, callsign: null, airline: null};
      });
      setFlights(tmp);
      await Promise.all(tmp).then(out => {
        setFlights(out);
        setLoadComplete(true);
      });
    };
    loadInit();
  }, []);

  return (
    <div className="App">
      <h1>Flight Description</h1>
      {loadComplete === false  ? <div>Please wait for the data to load</div> : <CurrentAirplenStatus data={flights}/>}

      <button onClick={() => saveDataAsJSON(flights)}> Save RealTime JSON Data </button>
    </div>
  );
}

export default App;
