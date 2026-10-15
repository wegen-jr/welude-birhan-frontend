const API_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = `${API_URL}/testimonies`;

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const getTestimonials = async () => {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch testimonials.");
  }

  return response.json();
};

const createTestimonial = async (testimonialData) => {
  const formData = new FormData();

  formData.append("image", testimonialData.image);
  formData.append("name", testimonialData.name);
  formData.append("baptismalName", testimonialData.baptismalName);
  formData.append("graduateTitle", testimonialData.graduateTitle);
  formData.append("year", testimonialData.year);
  formData.append(
    "inspirationQuote",
    testimonialData.inspirationQuote
  );

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText ||
        `Failed to create testimonial (${response.status})`
    );
  }

  return JSON.parse(responseText);
};

const updateTestimonial = async (id, testimonialData) => {
  const formData = new FormData();

  if (testimonialData.image) {
    formData.append("image", testimonialData.image);
  }

  formData.append("name", testimonialData.name);
  formData.append(
    "baptismalName",
    testimonialData.baptismalName
  );
  formData.append(
    "graduateTitle",
    testimonialData.graduateTitle
  );
  formData.append("year", testimonialData.year);
  formData.append(
    "inspirationQuote",
    testimonialData.inspirationQuote
  );

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText ||
        `Failed to update testimonial (${response.status})`
    );
  }

  return JSON.parse(responseText);
};

const deleteTestimonial = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete testimonial.");
  }

  return response.json();
};

const TestimonialServices = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};

export default TestimonialServices;
