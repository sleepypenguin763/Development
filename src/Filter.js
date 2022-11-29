import { BookmarkBorder, Visibility, VisibilityOff } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, useState } from "react";

const filterData = (data, filter) => {
  let dataToRender = data;
  if (filter.length !== 0 && filter.showNullAirlineEntry !== null && filter.showNullAirlineEntry === false) {
    dataToRender = dataToRender.filter((flight) => {
      return (
        flight["airline"] !== null &&
        flight["airline"] !== undefined &&
        flight[1] !== null &&
        flight[1] !== undefined &&
        flight[1].trim() !== ""
      );
    });
  }
  if (filter.length !== 0 && filter.altitude !== null && filter.altitude !== undefined) {
    dataToRender = dataToRender.filter((flight) => {
      return (
        flight[13] !== null &&
        flight[13] !== undefined &&
        flight[13] >= filter.altitude[0] &&
        flight[13] <= filter.altitude[1]
      );
    });
  }
  if (filter.length !== 0 && filter.speed !== null && filter.speed !== undefined) {
    dataToRender = dataToRender.filter((flight) => {
      return (
        flight[9] !== null &&
        flight[9] !== undefined &&
        parseFloat(flight[9]) * 3.6 >= filter.speed[0] &&
        parseFloat(flight[9]) * 3.6 <= filter.speed[1]
      );
    });
  }
  if (filter.length !== 0 && filter.routeDistance !== null && filter.routeDistance !== undefined) {
    dataToRender = dataToRender.filter((flight) => {
      return (
        (flight["totalDistance"] !== null &&
          flight["totalDistance"] !== undefined &&
          parseFloat(flight["totalDistance"]) >= filter.routeDistance[0] &&
          parseFloat(flight["totalDistance"]) <= filter.routeDistance[1]) ||
        ((flight["totalDistance"] === null || flight["totalDistance"] === undefined) &&
          filter.showUnknownRouteDistance === true)
      );
    });
  }
  return dataToRender;
};

function FilterSliders({ dataFilter, setDataFilter, setViewBookmarked, viewBookmarked }) {
  const [enableNullAirlineEntry, setEnableNullAirlineEntry] = useState(
    dataFilter.showNullAirlineEntry === undefined ? true : dataFilter.showNullAirlineEntry
  );
  const [altitudeFilter, setAltitudeFilter] = useState(
    dataFilter.altitude === undefined ? [0, 15000] : dataFilter.altitude
  );
  const [speedFilter, setSpeedFilter] = useState(dataFilter.speed === undefined ? [0, 1500] : dataFilter.speed);
  const [routeDistanceFilter, setRouteDistanceFilter] = useState(
    dataFilter.routeDistance === undefined ? [0, 25000] : dataFilter.routeDistance
  );
  const [showUnknownRouteDistanceFlights, setShowUnknownRouteDistanceFlights] = useState(
    dataFilter.showUnknownRouteDistance ?? true
  );

  const handleAltitudeChange = (event, newValue) => {
    setAltitudeFilter(newValue);
  };
  const handleSpeedChange = (event, newValue) => {
    setSpeedFilter(newValue);
  };
  const handleRouteDistanceChange = (event, newValue) => {
    setRouteDistanceFilter(newValue);
  };

  const filterDataByNullEntry = useCallback(() => {
    setDataFilter({
      altitude: dataFilter.altitude,
      speed: dataFilter.speed,
      showNullAirlineEntry: !enableNullAirlineEntry,
      routeDistance: dataFilter.routeDistance,
      showUnknownRouteDistance: showUnknownRouteDistanceFlights,
    });
    setEnableNullAirlineEntry(!enableNullAirlineEntry);
  }, [enableNullAirlineEntry, dataFilter, setDataFilter, showUnknownRouteDistanceFlights]);

  function altitudeValueText(value) {
    return `${value} m`;
  }
  function speedValueText(value) {
    return `${value} km/h`;
  }
  function routeDistanceValueText(value) {
    return `${value} km`;
  }

  const filterDataBySpeedAltitude = useCallback(() => {
    setDataFilter({
      showNullAirlineEntry: dataFilter.showNullAirlineEntry,
      altitude: altitudeFilter,
      speed: speedFilter,
      routeDistance: routeDistanceFilter,
      showUnknownRouteDistance: showUnknownRouteDistanceFlights,
    });
  }, [
    altitudeFilter,
    speedFilter,
    dataFilter.showNullAirlineEntry,
    setDataFilter,
    routeDistanceFilter,
    showUnknownRouteDistanceFlights,
  ]);

  const resetFilter = useCallback(() => {
    setSpeedFilter([0, 1500]);
    setAltitudeFilter([0, 15000]);
    setEnableNullAirlineEntry(true);
    setRouteDistanceFilter([0, 30000]);
    setShowUnknownRouteDistanceFlights(true);
    setDataFilter({
      showNullAirlineEntry: true,
      altitude: [0, 15000],
      speed: [0, 1500],
      routeDistance: [0, 25000],
      showUnknownRouteDistance: true,
    });
  }, [setDataFilter]);

  const showBookmarked = useCallback(() => {
    setViewBookmarked(!viewBookmarked);
  }, [setViewBookmarked, viewBookmarked]);

  return (
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="col-lg-2 col-md-4 col-sm-4">Speed:</div>
        <div className="col-lg-4 col-md-6 col-sm-12 align-bottom">
          <Slider
            getAriaLabel={() => "Filter with Speed"}
            value={speedFilter}
            onChange={handleSpeedChange}
            getAriaValueText={speedValueText}
            step={10}
            min={0}
            max={1500}
            valueLabelDisplay={"auto"}
            valueLabelFormat={speedValueText}
          />
        </div>
      </div>
      <div className="row justify-content-center mb-5">
        <div className="col-lg-2 col-md-4 col-sm-4">Altitude:</div>
        <div className="col-lg-4 col-md-6 col-sm-12 align-bottom">
          <Slider
            getAriaLabel={() => "Filter with Altitude"}
            value={altitudeFilter}
            onChange={handleAltitudeChange}
            getAriaValueText={altitudeValueText}
            step={100}
            min={0}
            max={15000}
            valueLabelDisplay={"auto"}
            valueLabelFormat={altitudeValueText}
          />
        </div>
      </div>
      <div className="row justify-content-center mb-5">
        <div className="col-lg-2 col-md-4 col-sm-4">Route Distance:</div>
        <div className="col-lg-4 col-md-6 col-sm-12 align-bottom">
          <Slider
            getAriaLabel={() => "Filter with Route Distance"}
            value={routeDistanceFilter}
            onChange={handleRouteDistanceChange}
            getAriaValueText={routeDistanceValueText}
            step={100}
            min={0}
            max={25000}
            valueLabelDisplay={"auto"}
            valueLabelFormat={routeDistanceValueText}
          />
        </div>
      </div>
      <div className="row justify-content-center mb-5">
        <div className="col-lg-4 col-md-6 col-sm-12">
          <FormControl component="fieldset" className="text-center mx-auto">
            <FormControlLabel
              value="start"
              control={
                <Checkbox
                  onChange={() => {
                    setShowUnknownRouteDistanceFlights(!showUnknownRouteDistanceFlights);
                  }}
                />
              }
              checked={showUnknownRouteDistanceFlights}
              label={"Show Flights with unknown route distance"}
              labelPlacement="start"
            />
          </FormControl>
        </div>
      </div>
      <div className="row mb-5 justify-content-center">
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <Tooltip title="Click to apply the filters assigned above, including the checkbox">
            <button className="btn btn-primary" onClick={filterDataBySpeedAltitude}>
              Apply Filter(s) and Options!
            </button>
          </Tooltip>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <Button variant="contained" color="warning" onClick={resetFilter} startIcon={<DeleteIcon />}>
            Reset All Filters
          </Button>
        </div>
      </div>
      <div className="row mb-5 justify-content-center">
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <Tooltip
            title={
              enableNullAirlineEntry
                ? "Click to hide flights with unrecognized operator and/or with unkown callsign"
                : "Click to also show unrecognized flights"
            }
          >
            <Button
              variant="contained"
              color="warning"
              onClick={filterDataByNullEntry}
              startIcon={enableNullAirlineEntry ? <VisibilityOff /> : <Visibility />}
            >
              {enableNullAirlineEntry ? "Remove unrecognized flights" : "Show unrecognized flights"}
            </Button>
          </Tooltip>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <Tooltip
            title={viewBookmarked ? "Click to show all flights" : "Click to just view the content in your bookmark"}
          >
            <Button variant="contained" color="secondary" onClick={showBookmarked} startIcon={<BookmarkBorder />}>
              {viewBookmarked ? "Show All Flights" : "View Bookmarked Flights"}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export { filterData, FilterSliders };
