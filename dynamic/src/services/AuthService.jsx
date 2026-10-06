import { API_BASE_URL } from './api';

export async function signIn(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function signUp(formData) {
  const res = await fetch(`${API_BASE_URL}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  return res.json().then((data) => ({ ok: res.ok, data }));
}
