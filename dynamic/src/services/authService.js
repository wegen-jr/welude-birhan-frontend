import { API_BASE_URL } from './api';
import { userService } from './userService';

export async function signIn(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function signUp(formData) {
  try {
    const data = await userService.signupUser(formData);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, data: error.data || { message: error.message } };
  }
}
