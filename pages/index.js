import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          setMessage("Football data loaded ✅");
        } else {
          setMessage("No matches found ⚽");
        }
      } catch (err) {
        setMessage("Error loading matches ❌");
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Sports Hub</h1>
      <p>{message}</p>
    </div>
  );
}
