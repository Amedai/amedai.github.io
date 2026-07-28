import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainScreen from './pages/main/MainScreen';

function App() {
  return (
    <BrowserRouter basename="/%D0%BC%D0%B5%D0%BD%D0%B4%D0%B5%D0%BB%D0%B5%D0%B5%D0%B2%D1%81%D0%BA">
      <Routes>
        <Route path="/*" element={<MainScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
