import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  occupancy: { count: number; max: number };
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  occupancy: { count: 0, max: 150 },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [occupancy, setOccupancy] = useState({ count: 0, max: 150 });

  useEffect(() => {
    // In this environment, the frontend is on the same host as the backend Express server
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('occupancy-update', (data: { count: number; max: number }) => {
      setOccupancy(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, occupancy }}>
      {children}
    </SocketContext.Provider>
  );
};
