import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import UploadWish from "./pages/UploadWish";
import AllWishes from "./pages/AllWishes";
import QRCodePage from "./pages/QRCodePage";
import ManageWishes from "./pages/ManageWishes";

function App() {
  return (
    <BrowserRouter>
      {/* <nav className="navbar">
        <Link to="/">Upload Wish</Link>
        <Link to="/wishes">All Wishes</Link>
        <Link to="/qr">QR Code</Link>
      </nav> */}

      <Routes>
        <Route path="/" element={<UploadWish />} />
        <Route path="/wishes" element={<AllWishes />} />
        <Route path="/qr" element={<QRCodePage />} />
        <Route path="/admin/wishes" element={<ManageWishes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;