import { useEffect, useState } from "react";
import API from "./api/axios";

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    API.get("/")
      .then(() => setStatus("Backend connected ✅"))
      .catch(() => setStatus("Backend not reachable ❌"));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>CipherChat</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
