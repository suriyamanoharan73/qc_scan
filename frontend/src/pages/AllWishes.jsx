import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://127.0.0.1:8000";

function AllWishes() {
  const [wishes, setWishes] = useState([]);
  const [index, setIndex] = useState(0);
  const [showFullText, setShowFullText] = useState(false);

  const fetchWishes = async () => {
    try {
      const response = await axios.get(`${API_URL}/wishes`);
      setWishes(response.data);
    } catch (error) {
      console.log("Error fetching wishes:", error);
    }
  };

  useEffect(() => {
    fetchWishes();

    const apiTimer = setInterval(() => {
      fetchWishes();
    }, 7000);

    return () => clearInterval(apiTimer);
  }, []);

  useEffect(() => {
    if (wishes.length === 0 || showFullText) return;

    const sliderTimer = setInterval(() => {
      setIndex((prev) => (prev + 1) % wishes.length);
    }, 4000);

    return () => clearInterval(sliderTimer);
  }, [wishes.length, showFullText]);

  useEffect(() => {
    if (wishes.length > 0 && index >= wishes.length) {
      setIndex(0);
    }
  }, [wishes, index]);

  if (wishes.length === 0) {
    return (
      <div className="page slider-page">
        <div className="empty-state">
          <h1>🎉 No Wishes Yet</h1>
          <p>Waiting for wishes to appear...</p>
        </div>
      </div>
    );
  }

  const wish = wishes[index];

  return (
    <div className="page slider-page">
      <h1 className="slider-title">🎉 Wishes Gallery 🎉</h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={wish.id}
          className="wish-card"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ duration: 0.7 }}
        >
          <img src={wish.image_url} alt={wish.name} />

          <div className="wish-content">
            <h2 className="wish-name">{wish.name}</h2>

            <p className="wish-text">{wish.wish_text}</p>

            {wish.wish_text.length > 120 && (
              <button
                className="read-more-btn"
                onClick={() => setShowFullText(true)}
              >
                Read More
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {showFullText && (
        <div
          className="popup-overlay"
          onClick={() => setShowFullText(false)}
        >
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{wish.name}</h2>
            <p>{wish.wish_text}</p>

            <button onClick={() => setShowFullText(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="dots">
        {wishes.map((_, i) => (
          <span
            key={i}
            onClick={() => {
              setIndex(i);
              setShowFullText(false);
            }}
            className={i === index ? "dot active" : "dot"}
          />
        ))}
      </div>
    </div>
  );
}

export default AllWishes;