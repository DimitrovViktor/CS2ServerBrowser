import React, { useEffect, useState } from 'react';
import { FaGlobeAmericas, FaUsers, FaBolt } from 'react-icons/fa';
import axios from 'axios';

const StatsBar: React.FC = () => {
  const [totalOnlineServers, setTotalOnlineServers] = useState(0);
  const [totalOnlinePlayers, setTotalOnlinePlayers] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get('http://localhost:3001/api/servers');
        const servers = res.data;
        const onlineServers = servers.filter((s: any) => s.status === 'online');
        setTotalOnlineServers(onlineServers.length);
        setTotalOnlinePlayers(onlineServers.reduce((sum: number, s: any) => sum + (s.current_players || 0), 0));
      } catch {
        setTotalOnlineServers(0);
        setTotalOnlinePlayers(0);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stats-bar header-width">
      <div className="stats-item">
        <FaGlobeAmericas />
        <span>Total Online Servers: <strong>{totalOnlineServers}</strong></span>
      </div>
      <div className="stats-item">
        <FaUsers />
        <span>Online Players in all servers: <strong>{totalOnlinePlayers}</strong></span>
      </div>
      <div className="stats-item">
        <FaBolt />
        <span>Your Ping: <strong>0ms</strong></span>
      </div>
    </div>
  );
};

export default StatsBar;