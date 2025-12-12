import { BrowserRouter, Route, Routes } from "react-router";
import NaiveScreen from "./screens/Naive";
import DeferredTransition from "./screens/DeferredTransition";
import IndexScreen from "./screens/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexScreen />} />
        <Route path="/naive" element={<NaiveScreen />} />
        <Route path="/deferred-transition" element={<DeferredTransition />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
