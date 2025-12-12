import { BrowserRouter, Route, Routes } from "react-router";
import NaiveScreen from "./screens/Naive";
import NonLaneScreen from "./screens/NonLane";
import IndexScreen from "./screens/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexScreen />} />
        <Route path="/naive" element={<NaiveScreen />} />
        <Route path="/non-lane" element={<NonLaneScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
