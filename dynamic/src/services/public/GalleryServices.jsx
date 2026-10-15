const API_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = `${API_URL}/gallery`;

const getGallery = async () => {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch gallery.");
  }

  return response.json();
};

const GalleryServices = {
  getGallery,
};

export default GalleryServices;