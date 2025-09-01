import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Server } from '../types/server';

const fetchServers = async (): Promise<Server[]> => {
  const response = await axios.get('http://localhost:3001/api/servers');
  return response.data;
};

export const useServers = () => {
  return useQuery({
    queryKey: ['servers'],
    queryFn: fetchServers,
    refetchInterval: 45000, // Refetch every 45 seconds
  });
};