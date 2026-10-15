import { useCallback, useEffect, useState } from "react";
import GalleryServices from "../../services/public/GalleryServices";

export default function useGallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await GalleryServices.getGallery();

      setGalleryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return {
    galleryItems,
    loading,
    error,
    refreshGallery: fetchGallery,
  };
}