const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllEnrollments = async (token) => {
  const response = await fetch(
    `${BASE_URL}/class-enrollment`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch student enrollments.");
  }

  return await response.json();
};