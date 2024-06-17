import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select.jsx";
import "./App.css";

function App() {
  const [stats, setStats] = useState(null);
  const [previousStats, setPreviousStats] = useState(null);
  const [initialStats, setInitialStats] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [compareWith, setCompareWith] = useState("previous"); // "previous" or "initial"
  const [selectedStat, setSelectedStat] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10);
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
        if (selectedStat) {
          setGraphData(prevData => [...prevData, { time: new Date(), value: data.query.statistics[selectedStat] }]);
        }
      })
      .catch(error => console.error("Error fetching Wikipedia stats:", error));
  };

  const resetTimer = (manual = false) => {
    if (manual) {
      fetchStats();
    }
    setCountdown(refreshInterval);
    clearInterval(timerRef.current);
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            fetchStats();
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleStatClick = (stat) => {
    setSelectedStat(stat);
    setGraphData([]);
  };

  const saveSettings = () => {
    localStorage.setItem("autoRefresh", autoRefresh);
    localStorage.setItem("refreshInterval", refreshInterval);
  };

  useEffect(() => {
    const savedAutoRefresh = localStorage.getItem("autoRefresh");
    const savedRefreshInterval = localStorage.getItem("refreshInterval");
    if (savedAutoRefresh !== null) {
      setAutoRefresh(JSON.parse(savedAutoRefresh));
    }
    if (savedRefreshInterval !== null) {
      setRefreshInterval(Number(savedRefreshInterval));
    }
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
              <p onClick={() => handleStatClick("articles")}>Total Articles: {stats.articles} {comparisonStats && getChangeIndicator(stats.articles, comparisonStats.articles)}</p>
              <p onClick={() => handleStatClick("edits")}>Total Edits: {stats.edits} {comparisonStats && getChangeIndicator(stats.edits, comparisonStats.edits)}</p>
              <p onClick={() => handleStatClick("images")}>Total Images: {stats.images} {comparisonStats && getChangeIndicator(stats.images, comparisonStats.images)}</p>
              <p onClick={() => handleStatClick("users")}>Total Users: {stats.users} {comparisonStats && getChangeIndicator(stats.users, comparisonStats.users)}</p>
              <p onClick={() => handleStatClick("activeusers")}>Active Users: {stats.activeusers} {comparisonStats && getChangeIndicator(stats.activeusers, comparisonStats.activeusers)}</p>
              <p onClick={() => handleStatClick("admins")}>Admins: {stats.admins} {comparisonStats && getChangeIndicator(stats.admins, comparisonStats.admins)}</p>
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
          <div>
            <label>
              Auto Refresh:
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            </label>
            <label>
              Refresh Interval:
              <Input type="number" value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} />
            </label>
            <Button onClick={saveSettings}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
      {selectedStat && (
        <Dialog open={!!selectedStat} onOpenChange={() => setSelectedStat(null)}>
          <DialogTrigger asChild>
            <Button>View Graph</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{selectedStat} Graph</DialogTitle>
            <Line
              data={{
                labels: graphData.map(data => data.time.toLocaleTimeString()),
                datasets: [
                  {
                    label: selectedStat,
                    data: graphData.map(data => data.value),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }
                ]
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default App;