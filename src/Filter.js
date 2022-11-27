import { BookmarkBorder, Visibility, VisibilityOff } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import { useCallback, useState } from "react";

const filterData = (data, filter) => {
  let dataToRender = data;
  if (filter.length !== 0 && filter.showNullAirlineEntry !== null && filter.showNullAirlineEntry === false) {
    dataToRender = dataToRender.filter((flight) => {
      return flight["airline"] !== null;
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

  const handleAltitudeChange = (event, newValue) => {
    setAltitudeFilter(newValue);
  };
  const handleSpeedChange = (event, newValue) => {
    setSpeedFilter(newValue);
  };

  const filterDataByNullEntry = useCallback(() => {
    setDataFilter({
      altitude: dataFilter.altitude,
      speed: dataFilter.speed,
      showNullAirlineEntry: !enableNullAirlineEntry,
    });
    setEnableNullAirlineEntry(!enableNullAirlineEntry);
  }, [enableNullAirlineEntry, dataFilter, setDataFilter]);

  function altitudeValueText(value) {
    return `${value} m`;
  }
  function speedValueText(value) {
    return `${value} km/h`;
  }

  const filterDataBySpeedAltitude = useCallback(() => {
    setDataFilter({
      showNullAirlineEntry: dataFilter.showNullAirlineEntry,
      altitude: altitudeFilter,
      speed: speedFilter,
    });
  }, [altitudeFilter, speedFilter, dataFilter.showNullAirlineEntry, setDataFilter]);

  const resetFilter = useCallback(() => {
    setSpeedFilter([0, 1500]);
    setAltitudeFilter([0, 15000]);
    setEnableNullAirlineEntry(true);
    setDataFilter({ showNullAirlineEntry: true, altitude: [0, 15000], speed: [0, 1500] });
  }, [setDataFilter]);

  const showBookmarked = useCallback(() => {
    setViewBookmarked(!viewBookmarked);
  }, [setViewBookmarked, viewBookmarked]);

  return (
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="col-2">Speed:</div>
        <div className="col-4 align-bottom">
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
        <div className="col-2">Altitude:</div>
        <div className="col-4 align-bottom">
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
      <div className="row mb-5 justify-content-center">
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <button className="btn btn-primary" onClick={filterDataBySpeedAltitude}>
            Filter!
          </button>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <Button variant="contained" color="warning" onClick={resetFilter} startIcon={<DeleteIcon />}>
            Reset All Filters
          </Button>
        </div>
      </div>
      <div className="row mb-5 justify-content-center">
        <div className="col-lg-4 col-md-6 col-sm-12">
          <Button
            variant="contained"
            color="warning"
            onClick={filterDataByNullEntry}
            startIcon={enableNullAirlineEntry ? <VisibilityOff /> : <Visibility />}
          >
            {enableNullAirlineEntry ? "Remove unrecognized flights" : "Show unrecognized flights"}
          </Button>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12">
          <Button variant="contained" color="secondary" onClick={showBookmarked} startIcon={<BookmarkBorder />}>
            {viewBookmarked ? "Hide Bookmarked Flights" : "View Bookmarked Flights"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { filterData, FilterSliders };
