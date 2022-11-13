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
const getFlightRouteData = async(flights) => {
  const url = 'https://sleepypenguin763.github.io/aviation/AAZ/AAZ311/';
    const response = await fetch(url);
    if (response.status == 404){
      return null;
    }

    const resp =  await response.json();
    return resp;
  /*
  const out = flights.map(async(curr) => {
    const callsign = curr[1];
    const iata = callsign.slice(0, 3);
    const url = 'https://sleepypenguin763.github.io/FlightData/routes/' + iata + '.json';
    const response = await fetch(url);
    if (response.status == 404){
      return null;
    }

    const resp =  await response.json();
    return resp;
  });
  return out;
  */
  
  
  //const cleanData = flightsData.states.map(async(flight) => {
   // const callsign = flight[1];
    //return null;
  //});
  //return queryResult;
}

const testGetFlight = async(callsign) => {
  if (callsign == undefined || callsign == null) {
    return null;
  }
  const firstThreeChar = callsign.slice(0, 3);
  const url = 'https://sleepypenguin763.github.io/Aviation-Routes/' + firstThreeChar + '/' + callsign;
  const response = await fetch(url);
  if (response.status == 404){
    return null;
    const firstTwoChar = callsign.slice(0, 2);
    const url2 = 'https://sleepypenguin763.github.io/Aviation-Routes/' + firstTwoChar + '-/' + callsign;
    const response2 = await fetch(url2);
    if (response2.status == 404){
      return null;
    }
    return await response2.json();
  }
  return response.json();
}

function CurrentAirplenStatus({data}) {
  // const test = Promise.resolve(data[0])
  // const tmp = await test.then(cal => {
  //   return cal
  // });
  //Promise.resolve(data).then((val) => {console.log(val[0]?.result);});
  return(
    data.map((t) => {
      const flight = t;
      //const flight = Promise.resolve(t).then(val => {return val;});
      const callsign = flight[1];
      const flightData = (flight["callsign"] === null) ? null : flight["callsign"];
      //console.log(typeof(flightData));
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
        <p>Origin: {flight[2]}</p>
        <p>Velocity: {(parseFloat(flight[9]) * 3.6).toFixed(3)} km/h</p>
        <p>Geographic Altitude: {flight[13]}</p>
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
    const out = async() => {
      const tmp = await getFlightsFromJSON.states.map(async(flight, index) => {
        const resp = await testGetFlight(flight[1]);
        return {...flight, callsign: resp};
      });
      setFlights(tmp);
      await Promise.all(tmp).then(out => {
        setFlights(out);
        setLoadComplete(true);
      });
    };
    out();
    console.log("Load Complete3");
    //setLoadComplete(true);
  }, []);
  //console.log((routes == null || !routes.hasOwnProperty("UAL188799")) ? "Data Not Found" : routes["UAL188799"]["AirportCodes"]);

  console.log(111);
  //https://opensky-network.org/api/tracks/all?icao24=n71lp&time=0
  //https://opensky-network.org/api/routes?callsign=UAL5
  //https://opensky-network.org/api/airports?icao=KIAH
  //https://sleepypenguin763.github.io/FlightData/routes/ADZ.json?Callsign=ADZ402

  return (
    <div className="App">
      <h1>Flight Description</h1>
      {loadComplete === false  ? <div>Please wait for the data to load</div> : <CurrentAirplenStatus data={flights}/>}

      <button onClick={() => saveDataAsJSON(flights)}> Save RealTime JSON Data </button>
    </div>
  );
}

export default App;
