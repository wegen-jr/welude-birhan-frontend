import { useCallback, useEffect, useState } from "react";
import GalleryService from "../../services/cms/GalleryServices";

export default function useGallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await GalleryService.getGallery();

      setGallery(data);
    } catch (err) {
      setError(
        err?.message || "Failed to load gallery."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createGalleryItem = async (galleryData) => {
    try {
      setError(null);

      const newItem =
        await GalleryService.createGalleryItem(galleryData);

      setGallery((prev) => [...prev, newItem]);

      return newItem;
    } catch (err) {
      setError(
        err?.message || "Failed to create gallery item."
      );
      throw err;
    }
  };

  const updateGalleryItem = async (id, galleryData) => {
    try {
      setError(null);

      const updatedItem =
        await GalleryService.updateGalleryItem(
          id,
          galleryData
        );

      setGallery((prev) =>
        prev.map((item) =>
          item.id === id ? updatedItem : item
        )
      );

      return updatedItem;
    } catch (err) {
      setError(
        err?.message || "Failed to update gallery item."
      );
      throw err;
    }
  };

  const deleteGalleryItem = async (id) => {
    try {
      setError(null);

      await GalleryService.deleteGalleryItem(id);

      setGallery((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err?.message || "Failed to delete gallery item."
      );
      throw err;
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return {
    gallery,
    loading,
    error,
    fetchGallery,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  };
}
