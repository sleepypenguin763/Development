# Development

### Link to Deployed Website
https://sleepypenguin763.github.io/Development/
> **Warning**
> 
> It will take roughly 30 seconds to load the page if you decide to load the LIVE Data by clicking on the button, and this is because there are a lot of API fetching going on. You can see the loading progress bar once you get to the page, but if the progress bar does not reach 100% even after waiting for a minuite or so, please refresh the page. Also, once you can see the content of the page, please DO NOT refresh the page as this will trigger new set of API fetching, and OpenSky has limited free API calls per timeframe.

> **Note**
> 
> Initially, the application will load predefined data, which only consists of ~1000 data points. This is to reduce the time for you when grading the assignment. The content of this data will most likely be outdated, since the data is taken from past flights. If you want to load the page with LIVE data, please click on the orange button on the loading screen / main screen. (It is more cool to see this since you can search the flight with callsign on Google, and you'll see that the data mostly matches with what is being displayed on my screen)

### API
[Here](https://github.com/sleepypenguin763/Airlines) is where the mock REST API regarding the airline, aircraft, airports, and country lives. Please read the README in side this repo to see how the Mock REST API is organized.

### Goal and Value of the Application
The goal of this application is to see the LIVE information regarding the airplanes flying around in the world. The website can get the data of most airplanes, which are claimed via open source API called [OpenSky](https://openskynetwork.github.io/opensky-api/rest.html). This API claims the LIVE data of aircraft flying around the world with its ICAO24(basically id), flight's callsign, current position and velocity. In order to get the details of the route, I used [this](https://github.com/vradarserver/standing-data) dataset where I can map flight's callsign to its routes and airport/aircraft data, since OpenSky API does not take care of that. There are two python scripts I wrote where it converts csv to JSON file, and then to convert JSON file to HTML format JSON to use it as an mock REST API. The logo of each airline is taken from [this](https://github.com/sexym0nk3y/airline-logos) GitHub repository. It does not include all possible airline logo, however.

### Usability Principles Considered
This is something that needs more improvement, especially since it is taking roughly 30seconds to initially load the page. However, this is hard to solve since the assignment requires everything to be on one page, so I was not able to implement pagination. However, the website is mostly user friendly in a sense that it is implemented using responsive designing principles.

Now, there is a checkbox stating 'Show Flights with unknown route distance'. You might be confused about the difference between this and 'Hide unrecognized flights'. These are TWO DIFFERENT BUTTONS. Flights with valid/invalid callsign can have undefined routes, and this is independent of callsign/airline being recognizable. For instance, it is possible that we have some flight XXX where we know the operator of the aircraft but we do not know where the origin/destination is. In this case, we can not determine the route distance, and by unchecking the checkbox saying 'Show Flights with unknown route distance', it will remove from the list.

> **Note**
> 
> Unrecognized flights are defined as the following: a) if a flight has unknown callsign OR b) flight's operator is unknown. This filter will basically remove all private jets and ground vehicle(such as towing car).

### Organization of Components
Each component consists of the following:
- Airline: (shows airline name if available)
- Route (ICAO): (shows route in ICAO format if available)
- Route: (shows route in text format if available)
- Total Route Distance: (shows total route distance if available in km. Calculated using the longitude / latitude data of origin/destination airport)
- Velocity: (current plane's velocity in km/h)
- Geographic Altitude: (current altitude of the plane in meters)
- Longitude / Latitude: (current longitude and latitude of the plane)

Now, the "Route" and "Total Route Distance" component will not appear if the Airline/Route information is not available for the given callsign.


### How Data is Passed Down Through Components
There are few files: App, APIRequests, Distance, Filter, ProgressBar, and Sort.js. App does the bulk of initial API triggering and rendering the component that you see on the page. APIRequests is the file that deals with fetching data from the mock API server or from OpenSky. Sort is the file that makes sorting options and implements sorting algorithm. Sorting will be done in ascending order. Filter is the file that deals with sorting slider (Altitude and speed). Distance is the file that is used to calculate the distance between two given geographics coordinates, using some math. It also calculates the aggregated distance when the user opens the bookmark section of the page. 
In terms of data handling, all the lists excluding the static one and the ones that are used when filtering are in states. This is because there are no need to store static array in states, and for filtering, we only used the filtered list once after the user clicks on "filter" (which also allows the "default" sorting option, which is what is held in the state initially when the data is fetched).
Everything else uses state variables, and almost all function returns a React component, which in that case, uses props to pass down data. However, when there are no react component being returned, with some exception, I always used const instead of function. These exception functions are in sort.js, and this is because I am passing a function to the "sort()" function.

### How the User Triggers State Changes
There are two sliders and one button at the top of the screen. Two sliders can filter the speed and altitude of the flight, and the page will show the airplanes that is flying in that range of altitude / speed. There are also a button that filters undefined airplanes (i.e. private jets / cesna etc.). The program will only show 1000 relevant flights in order to increase the page loading speed. 

### Aggregation
Aggregation system is implemented via "bookmark" feature. User can click on the icon right beside each flight's callsign to bookmark the flight. Then, the user can click on "Show Bookmarked flights" in order to view which flights have been bookmarked, and will show the aggregated total route distance if availabel. Since it is possible that certain flights do not have relevant information (i.e. private jets), it will also count for number of unknown route/callsigns. 


### Note About the Data Provided
Due to the larger volume of data being loaded, it is possible that sometimes it fails to load few data points and will show "Airline not found" even when the logo is present. However, this is rare, and it is also possible that the route of the flight is not plotted on the dataset I am using to map each callsigns to airline/routes. Also, the data presented on this website can be delayed by few minuites and might not be completely accurate. Lastly, it is possible that the dataset I am using to map the callsign to route is inaccurate (i.e. if the flights only operate on given route on specific day of the week, the data shown on the website might be completely wrong).

> **Warning**
> 
> It seems to be that the routes in the U.S. are especially inaccurate. Please keep that in mind when utilizing this tool


### Note About Filters
The definition of undefined airplane could either mean that the flight has missing callsign or that the flight's operator can not be identified (such as the private jets).

