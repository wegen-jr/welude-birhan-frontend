import { useCallback, useEffect, useState } from "react";
import TestimonialServices from "../../services/public/TestimonialServices";

export default function useTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await TestimonialServices.getTestimonials();

      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return {
    testimonials,
    loading,
    error,
    refreshTestimonials: fetchTestimonials,
  };
}