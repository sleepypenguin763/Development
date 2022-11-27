# Development

### Link to Deployed Website
https://sleepypenguin763.github.io/Development/

### API
[Here](https://github.com/sleepypenguin763/Airlines) is where the mock REST API regarding the airline, aircraft, airports, and country lives. Please read the README in side this repo to see how the Mock REST API is organized.

### Goal and Value of the Application
The goal of this application is to see the LIVE information regarding the airplanes flying around in the world. The website can get the data of most airplanes, which are claimed via open source API called [OpenSky](https://openskynetwork.github.io/opensky-api/rest.html). This API claims the LIVE data of aircraft flying around the world with its ICAO24(basically id), flight's callsign, current position and velocity. In order to get the details of the route, I used [this](https://github.com/vradarserver/standing-data) dataset where I can map flight's callsign to its routes and airport/aircraft data, since OpenSky API does not take care of that. There are two python scripts I wrote where it converts csv to JSON file, and then to convert JSON file to HTML format JSON to use it as an mock REST API. The logo of each airline is taken from [this](https://github.com/sexym0nk3y/airline-logos) GitHub repository. It does not include all possible airline logo, however.

### Usability Principles Considered

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

### How the User Triggers State Changes
There are two sliders and one button at the top of the screen. Two sliders can filter the speed and altitude of the flight, and the page will show the airplanes that is flying in that range of altitude / speed. There are also a button that filters undefined airplanes (i.e. private jets / cesna etc.). The program will only show 1000 relevant flights in order to increase the page loading speed. 

### Aggregation
Aggregation system is implemented via "bookmark" feature. User can click on the icon right beside each flight's callsign to bookmark the flight. Then, the user can click on "Show Bookmarked flights" in order to view which flights have been bookmarked, and will show the aggregated total route distance if availabel. Since it is possible that certain flights do not have relevant information (i.e. private jets), it will also count for number of unknown route/callsigns. 


### Note about the data provided
Due to the larger volume of data being loaded, it is possible that sometimes it fails to load few data points and will show "Airline not found" even when the logo is present. However, this is rare, and it is also possible that the route of the flight is not plotted on the dataset I am using to map each callsigns to airline/routes. Also, the data presented on this website can be delayed by few minuites and might not be completely accurate. 

