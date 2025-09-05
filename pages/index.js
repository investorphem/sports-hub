// pages/index.js
import { useEffect, useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/matches");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">⚽ Sports Hub</h1>

      {loading && (
        <div className="text-center text-gray-600">Loading matches...</div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.homeTeam.crest || "/logo.png"}
                  alt={match.homeTeam.name}
                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm font-semibold text-center">
                  {match.homeTeam.name}
                </span>
              </div>

              <span className="text-lg font-bold mx-3">vs</span>

              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.awayTeam.crest || "/logo.png"}
                  alt={match.awayTeam.name}
                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm font-semibold text-center">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>

            <div className="mt-3 text-gray-600 text-sm text-center">
              {new Date(match.utcDate).toLocaleString()}
              <br />
              Status:{" "}
              <span className="font-medium text-gray-800">{match.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}            <p className="text-sm text-gray-600">
              {new Date(match.utcDate).toLocaleString()}
            </p>
            <p className="text-sm">Status: {match.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
