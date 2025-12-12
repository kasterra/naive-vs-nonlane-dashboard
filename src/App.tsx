import { BrowserRouter, Route, Routes } from "react-router";
import NaiveScreen from "./screens/Naive";
import NonLaneScreen from "./screens/NonLane";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/naive" element={<NaiveScreen />} />
        <Route path="/non-lane" element={<NonLaneScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
