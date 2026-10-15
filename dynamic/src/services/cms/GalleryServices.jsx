const API_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = `${API_URL}/gallery`;

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const getGallery = async () => {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch gallery.");
  }

  return response.json();
};
const createGalleryItem = async (galleryData) => {
  const formData = new FormData();

  formData.append("image", galleryData.image);
  formData.append("mediaTitle", galleryData.mediaTitle);
  formData.append("category", galleryData.category);
  formData.append("eventDate", galleryData.eventDate);
  formData.append("description", galleryData.description);

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  const responseText = await response.text();

  console.log("Gallery response status:", response.status);
  console.log("Gallery response:", responseText);

  if (!response.ok) {
    throw new Error(
      responseText || `Failed to create gallery item (${response.status})`
    );
  }

  return JSON.parse(responseText);
};

const updateGalleryItem = async (id, galleryData) => {
  const formData = new FormData();

  // Only send image if the user selected a new one
  if (galleryData.image) {
    formData.append("image", galleryData.image);
  }

  formData.append("mediaTitle", galleryData.mediaTitle);
  formData.append("category", galleryData.category);
  formData.append("eventDate", galleryData.eventDate);
  formData.append("description", galleryData.description);

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update gallery item.");
  }

  return response.json();
};

const deleteGalleryItem = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete gallery item.");
  }

  return response.json();
};

const GalleryService = {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};

export default GalleryService;