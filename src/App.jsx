import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import "./App.css";

function App() {
  const [stats, setStats] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef(null);

  const fetchStats = () => {
    fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&meta=siteinfo&siprop=statistics&origin=*")
      .then(response => response.json())
      .then(data => setStats(data.query.statistics))
      .catch(error => console.error("Error fetching Wikipedia stats:", error));
  };

  const resetTimer = () => {
    setCountdown(10);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          fetchStats();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    fetchStats();
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="App">
      <Card>
        <CardHeader>
          <CardTitle>Live Wikipedia Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div>
              <p>Total Articles: {stats.articles}</p>
              <p>Total Edits: {stats.edits}</p>
              <p>Total Images: {stats.images}</p>
              <p>Total Users: {stats.users}</p>
              <p>Active Users: {stats.activeusers}</p>
              <p>Admins: {stats.admins}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
          <div>
            <p>Next refresh in: {countdown} seconds</p>
            <Button onClick={resetTimer}>Refresh Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;