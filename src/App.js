import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

// Make a GET request to the fruityvice api to retrieve some fruit data
const PROXY_URL = 'https://cs1300-cors-anywhere.herokuapp.com/'
const buildProxyEndpoint = (endpoint) => `${PROXY_URL}${endpoint}`;
const apiRequest = async () => {
  const BASE_URL = 'https://www.fruityvice.com/api/'

  // This endpoint (https://www.fruityvice.com/doc/index.html#api-GET-getAll) returns a list of all the fruits and their info, feel free to play around with different endpoints!
  const resourcePath = 'fruit/all'

  // Making a fetch request to an API endpoint
  // Note: a fetch request is an asynchronous operation, and `await` tells the program to wait until the request has been completed before continuing
  const endpoint = BASE_URL + resourcePath;
  const response = await fetch(buildProxyEndpoint(endpoint), {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // console.log(response);

  // Return the response in JSON format
  return response.json();
}

function App() {
  const [fruits, setFruits] = useState([]);
  const [allFruits, setAllFruits] = useState([]);
  useEffect(() => {
    const fruitsArray = async() => {
      const resp = await apiRequest();
      setAllFruits(resp);
      const sugaryFruits = await resp.filter((fruit) => {return fruit.nutritions.sugar > 5});
      setFruits(sugaryFruits);
    };
    fruitsArray();
  }, []);

  const changeList = async() => {
    const newFilter = await allFruits.filter((fruit) => {return fruit.nutritions.sugar < 5});
    setFruits(newFilter);
  };

  return (
    <div className="App">
      <h1>My Bakery</h1> {/* TODO: personalize your bakery (if you want) */}

      {fruits.map((fruit) => ( // TODO: map bakeryData to BakeryItem components
        // replace with BakeryItem component
        <div>
          <h1>{fruit.name} ({fruit.nutritions.sugar})</h1>
        </div>
      ))}
      <button onClick={() => changeList()}> test </button>
    </div>
  );
}

export default App;
