const API_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = `${API_URL}/testimonies`;

const getTestimonials = async () => {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch testimonials.");
  }

  return response.json();
};

const TestimonialServices = {
  getTestimonials,
};

export default TestimonialServices;