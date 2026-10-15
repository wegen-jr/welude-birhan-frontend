const API_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = `${API_URL}/announcements`;

const getEvents = async () => {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch events.");
  }

  return response.json();
};

const EventServices = {
  getEvents,
};

export default EventServices;