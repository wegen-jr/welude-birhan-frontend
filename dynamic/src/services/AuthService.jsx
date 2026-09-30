const BASE_URL = "https://welude-birhan-1.onrender.com/auth";
const SIGN_UP_URL = "https://welude-birhan-1.onrender.com/user";


export async function signIn(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function signUp(formData) {
  
  const res = await fetch(`${SIGN_UP_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formData}),
  });

  return res.json().then((data) => ({ ok: res.ok, data }));
}import { useAuth } from "../hooks/useAuth";
