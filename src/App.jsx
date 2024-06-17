import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&meta=siteinfo&siprop=statistics&origin=*")
      .then(response => response.json())
      .then(data => setStats(data.query.statistics))
      .catch(error => console.error("Error fetching Wikipedia stats:", error));
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
        </CardContent>
      </Card>
    </div>
  );
}

export default App;