import SortIcon from "@mui/icons-material/Sort";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useCallback, useState } from "react";

const sortOptions = ["Default", "Callsign", "Speed", "Route Distance"];

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

export { SortByMenu };
