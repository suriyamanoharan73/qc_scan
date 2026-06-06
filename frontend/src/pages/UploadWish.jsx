import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function UploadWish() {
  const [name, setName] = useState("");
  const [wishText, setWishText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !wishText || !image) {
      setMessage("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("wish_text", wishText);
    formData.append("image", image);

    try {
  await axios.post(`${API_URL}/wishes`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  setMessage("Wish uploaded successfully 🎉");

  setName("");
  setWishText("");
  setImage(null);
  setPreview("");

  setTimeout(() => {
    navigate("/wishes");
  }, 1000);
} catch (error) {
  setMessage("Upload failed");
  console.log(error);
}
  };

  return (
    <div className="page upload-page">
      <div className="form-card">
        <h1>Create Your Wish</h1>
        <p className="form-subtitle">
          Upload your photo and message. It will appear on the celebration screen.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Enter Wish Text"
            value={wishText}
            maxLength={180}
            onChange={(e) => setWishText(e.target.value)}
          />

          <p className="char-count">
            {wishText.length}/180
          </p>

          <label className="file-box">
            {image ? "Image selected" : "Click to upload image"}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          {preview && (
            <img src={preview} alt="Preview" className="preview-img" />
          )}

          <button type="submit">Upload Wish</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default UploadWish;