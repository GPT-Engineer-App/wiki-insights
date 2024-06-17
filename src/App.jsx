import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import "./App.css";

function App() {
  const [stats, setStats] = useState(null);
  const [previousStats, setPreviousStats] = useState(null);
  const [initialStats, setInitialStats] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [compareWith, setCompareWith] = useState("previous"); // "previous" or "initial"
  const timerRef = useRef(null);

  const fetchStats = () => {
    fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&meta=siteinfo&siprop=statistics&origin=*")
      .then(response => response.json())
      .then(data => {
        setPreviousStats(stats);
        setStats(data.query.statistics);
        if (!initialStats) {
          setInitialStats(data.query.statistics);
        }
      })
      .catch(error => console.error("Error fetching Wikipedia stats:", error));
  };

  const resetTimer = (manual = false) => {
    if (manual) {
      fetchStats();
    }
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

  const getChangeIndicator = (current, previous) => {
    if (current > previous) {
      return <span className="change-indicator up"><ArrowUp /> +{current - previous}</span>;
    } else if (current < previous) {
      return <span className="change-indicator down"><ArrowDown /> -{previous - current}</span>;
    } else {
      return <span className="change-indicator neutral"><Minus /> -</span>;
    }
  };

  const getComparisonStats = () => {
    if (compareWith === "previous" && previousStats) {
      return previousStats;
    } else if (compareWith === "initial" && initialStats) {
      return initialStats;
    }
    return null;
  };

  const comparisonStats = getComparisonStats();

  return (
    <div className="App">
      <Card>
        <CardHeader>
          <CardTitle>Live Wikipedia Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div>
              <p>Total Articles: {stats.articles} {comparisonStats && getChangeIndicator(stats.articles, comparisonStats.articles)}</p>
              <p>Total Edits: {stats.edits} {comparisonStats && getChangeIndicator(stats.edits, comparisonStats.edits)}</p>
              <p>Total Images: {stats.images} {comparisonStats && getChangeIndicator(stats.images, comparisonStats.images)}</p>
              <p>Total Users: {stats.users} {comparisonStats && getChangeIndicator(stats.users, comparisonStats.users)}</p>
              <p>Active Users: {stats.activeusers} {comparisonStats && getChangeIndicator(stats.activeusers, comparisonStats.activeusers)}</p>
              <p>Admins: {stats.admins} {comparisonStats && getChangeIndicator(stats.admins, comparisonStats.admins)}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
          <div>
            <p>Next refresh in: {countdown} seconds</p>
            <Button onClick={() => resetTimer(true)}>Refresh Now</Button>
          </div>
          <div>
            <label>
              Compare with:
              <select value={compareWith} onChange={(e) => setCompareWith(e.target.value)}>
                <option value="previous">Previous Refresh</option>
                <option value="initial">Start of Session</option>
              </select>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;