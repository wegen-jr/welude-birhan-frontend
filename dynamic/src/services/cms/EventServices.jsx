
const API_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = `${API_URL}/announcements`;

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const getEvents = async () => {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch events.");
  }

  return response.json();
};

const createEvent = async (eventData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error("Failed to create event.");
  }

  return response.json();
};

const updateEvent = async (id, eventData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error(response.message);
  }

  return response.json();
};

const deleteEvent = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete event.");
  }

  return response.json();
};

const EventService = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};

export default EventService;