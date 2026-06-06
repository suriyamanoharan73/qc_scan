import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function ManageWishes() {
  const [wishes, setWishes] = useState([]);
  const [editingWish, setEditingWish] = useState(null);
  const [selectedWish, setSelectedWish] = useState(null);

  const [name, setName] = useState("");
  const [wishText, setWishText] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const MAX_NAME_LENGTH = 40;
  const MAX_WISH_LENGTH = 180;

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      const response = await axios.get(`${API_URL}/wishes`);
      setWishes(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const startEdit = (wish) => {
    setEditingWish(wish);
    setName(wish.name.slice(0, MAX_NAME_LENGTH));
    setWishText(wish.wish_text.slice(0, MAX_WISH_LENGTH));
    setImage(null);
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingWish(null);
    setName("");
    setWishText("");
    setImage(null);
  };

  const updateWish = async (e) => {
    e.preventDefault();

    if (!editingWish) return;

    if (name.trim().length < 2) {
      setMessage("Name must contain at least 2 characters");
      return;
    }

    if (wishText.trim().length < 2) {
      setMessage("Wish text must contain at least 2 characters");
      return;
    }

    if (wishText.length > MAX_WISH_LENGTH) {
      setMessage(`Wish text cannot exceed ${MAX_WISH_LENGTH} characters`);
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("wish_text", wishText.trim());

    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.put(`${API_URL}/wishes/${editingWish.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Wish updated successfully");
      cancelEdit();
      fetchWishes();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.detail || "Update failed");
    }
  };

  const deleteWish = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this wish?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/wishes/${id}`);
      setMessage("Wish deleted successfully");
      fetchWishes();
    } catch (error) {
      console.log(error);
      setMessage("Delete failed");
    }
  };

  return (
    <div className="manage-page">
      <h1>Manage Wishes</h1>

      {message && <p className="admin-message">{message}</p>}

      {editingWish && (
        <div className="edit-box">
          <h2>Edit Wish</h2>

          <form onSubmit={updateWish}>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
            />

            <p className="char-count">{name.length}/{MAX_NAME_LENGTH}</p>

            <textarea
              placeholder="Enter Wish Text"
              value={wishText}
              maxLength={MAX_WISH_LENGTH}
              onChange={(e) => setWishText(e.target.value)}
            />

            <p className="char-count">
              {wishText.length}/{MAX_WISH_LENGTH}
            </p>

            <p className="current-image-label">Current Image:</p>

            <img
              src={editingWish.image_url}
              alt={editingWish.name}
              className="edit-preview"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <div className="edit-actions">
              <button type="submit" className="save-btn">
                Save Changes
              </button>

              <button type="button" className="cancel-btn" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="manage-grid">
        {wishes.map((wish) => (
          <div key={wish.id} className="manage-card">
            <img src={wish.image_url} alt={wish.name} />

            <h2>{wish.name}</h2>

            <p className="manage-wish-text">{wish.wish_text}</p>

            {wish.wish_text.length > 120 && (
              <button
                type="button"
                className="manage-read-more-btn"
                onClick={() => setSelectedWish(wish)}
              >
                Read More
              </button>
            )}

            <div className="card-actions">
              <button onClick={() => startEdit(wish)} className="edit-btn">
                Edit
              </button>

              <button onClick={() => deleteWish(wish.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedWish && (
        <div className="popup-overlay" onClick={() => setSelectedWish(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedWish.name}</h2>

            <p>{selectedWish.wish_text}</p>

            <button onClick={() => setSelectedWish(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageWishes;