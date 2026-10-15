
import { useCallback, useEffect, useState } from "react";
import EventService from "../../services/cms/EventServices";

export default function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await EventService.getEvents();

      setEvents(data);
    } catch (err) {
      setError(
        err?.message || "Failed to load events."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (eventData) => {
    try {
      setError(null);

      const newEvent = await EventService.createEvent(eventData);

      setEvents((prev) => [...prev, newEvent]);

      return newEvent;
    } catch (err) {
      setError(
        err?.message || "Failed to create event."
      );
      throw err;
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      setError(null);

      const updatedEvent = await EventService.updateEvent(
        id,
        eventData
      );

      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? updatedEvent : event
        )
      );

      return updatedEvent;
    } catch (err) {
      setError(
        err?.message || "Failed to update event."
      );
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    try {
      setError(null);

      await EventService.deleteEvent(id);

      setEvents((prev) =>
        prev.filter((event) => event.id !== id)
      );
    } catch (err) {
      setError(
        err?.message || "Failed to delete event."
      );
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,

    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
