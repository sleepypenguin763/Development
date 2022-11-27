import { styled } from "@mui/material/styles";
import FlightIcon from "@mui/icons-material/Flight";
import Slider, { SliderThumb } from "@mui/material/Slider";

const CheckMarkSlider = styled(Slider)(({ theme }) => ({
  color: "#3a8589",
  height: 3,
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 25,
    width: 25,
    backgroundColor: "#3a8589",
    color: "#fff",
    "& .checkmark-bar": {
      height: 9,
      width: 1,
      backgroundColor: "currentColor",
      marginLeft: 1,
      marginRight: 1,
    },
  },
  "& .MuiSlider-track": {
    color: (theme.palette.mode = "#3a8589"),
    height: 5,
  },
  "& .MuiSlider-rail": {
    color: theme.palette.mode === "dark" ? "#3a8589" : "#d8d8d8",
    opacity: theme.palette.mode === "dark" ? undefined : 1,
    height: 5,
  },
}));

function CheckMarkThumbComponent(props) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <FlightIcon />
    </SliderThumb>
  );
}

export function SetupProgressBar({ value }) {
  //Loading screen credit: https://codesandbox.io/s/customizedslider-material-demo-forked-299xcn?fontsize=14&hidenavigation=1&theme=dark&file=/demo.tsx:32-91
  return (
    <div className="container">
      <div className="row justify-content-center mb-5 mx-auto">
        <div className="col-lg-2 col-md-4 col-sm-6">Loading... </div>
        <div className="col-lg-4 col-md-6 col-sm-12  align-bottom">
          <CheckMarkSlider value={value} disabled components={{ Thumb: CheckMarkThumbComponent }} />
        </div>
      </div>
    </div>
  );
}
