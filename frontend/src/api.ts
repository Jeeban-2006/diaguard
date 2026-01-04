import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function explainRisk(data: any) {
  const response = await API.post("/explain-risk/", data);
  return response.data;
}
