import { useCallback, useEffect, useState } from "react";
import TestimonialService from "../../services/cms/TestimonialServices";

export default function useTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await TestimonialService.getTestimonials();

      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
      setError(error.message || "Failed to fetch testimonials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const createTestimonial = async (testimonialData) => {
    const created =
      await TestimonialService.createTestimonial(testimonialData);

    await fetchTestimonials();

    return created;
  };

  const updateTestimonial = async (id, testimonialData) => {
    const updated =
      await TestimonialService.updateTestimonial(
        id,
        testimonialData
      );

    await fetchTestimonials();

    return updated;
  };

  const deleteTestimonial = async (id) => {
    const deleted =
      await TestimonialService.deleteTestimonial(id);

    await fetchTestimonials();

    return deleted;
  };

  return {
    testimonials,
    loading,
    error,
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
}
