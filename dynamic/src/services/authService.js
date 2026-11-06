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


