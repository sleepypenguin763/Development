import SortIcon from "@mui/icons-material/Sort";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useCallback, useState } from "react";

const sortOptions = ["Default", "Callsign", "Speed", "Route Distance"];

// Alphanumeric sort taken from: https://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
function AlphaNumericSort() {
  const reA = /[^a-zA-Z]/g;
  const reN = /[^0-9]/g;
  return function (a, b) {
    // equal items sort equally
    if (a[1] === b[1]) {
      return 0;
    }

    // nulls sort after anything else
    if (a[1] === null) {
      return 1;
    }
    if (b[1] === null) {
      return -1;
    }

    const aA = a[1].replace(reA, "");
    const bA = b[1].replace(reA, "");
    if (aA === bA) {
      const aN = parseInt(a[1].replace(reN, ""), 10);
      const bN = parseInt(b[1].replace(reN, ""), 10);
      return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
      return aA > bA ? 1 : -1;
    }
  };
}

function SortWithSpeed() {
  return function (a, b) {
    // equal items sort equally
    if (a[9] === b[9]) {
      return 0;
    }

    // nulls sort after anything else
    if (a[9] === null) {
      return 1;
    }
    if (b[9] === null) {
      return -1;
    }
    return a[9] - b[9];
  };
}

const sortData = (data, option) => {
  switch (option) {
    case sortOptions[1]:
      return data.sort(AlphaNumericSort());
    case sortOptions[2]:
      return data.sort(SortWithSpeed());
    default:
      return data;
  }
};

function SortByMenu({ sortBy, setSortBy }) {
  const [selectedSortOption, setSelectedSortOption] = useState(sortBy);
  const onSortOptionChange = useCallback((_, newValue) => {
    setSelectedSortOption(newValue.props.children);
  }, []);
  const onSort = useCallback(() => {
    setSortBy(selectedSortOption);
  }, [selectedSortOption, setSortBy]);
  return (
    <div className="container">
      <div className="row justify-content-center mb-5 align-items-center">
        <div className="col-4">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Sort By</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedSortOption}
              label="Sort By"
              onChange={onSortOptionChange}
            >
              <MenuItem value={sortOptions[0]}>Default</MenuItem>
              <MenuItem value={sortOptions[1]}>Callsign</MenuItem>
              <MenuItem value={sortOptions[2]}>Speed</MenuItem>
              <MenuItem value={sortOptions[3]}>Route Distance</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="col-4">
          <Button variant="contained" color="warning" onClick={onSort} startIcon={<SortIcon />}>
            Sort
          </Button>
        </div>
      </div>
    </div>
  );
}

export { SortByMenu, sortData };
