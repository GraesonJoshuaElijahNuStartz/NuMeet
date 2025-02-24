import { getUser } from '@helpers';
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Socket, io } from 'socket.io-client';
import { updateSocket } from '../queries/auth';
import { WaitingTimeProvider } from './WaitingTimeProvider';
import { DoctorEventProvider } from './DoctorEventProvider';

export interface SocketContextProps {
  socket: Socket | null;
  connectSocket: () => void;
  closeSocket: () => void;
}

export const SocketContext = createContext<SocketContextProps | undefined>(
  undefined
);
const WS_URL: string = process.env.NEXT_PUBLIC_SOCKET_URL as string;

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketConnection = useRef<Socket | null>(null);
  const { mutateAsync: updateSocketMutate } = updateSocket({});

  const connectSocket = useCallback(async () => {
    const user = await getUser();
    if (socketConnection.current === null && user?.profileId) {
      const socket = io(WS_URL,{path:'/socket'});
      socket.on('connect', async () => {
        if (socketConnection.current === null) {
          socketConnection.current = socket;
        }
        const socketId = socket.id;
        if (socketId) {
          await createSocketWithProfile(socketId, user.profileId);
        }
      });
      socket.on('disconnect', () => {
        console.log('socket on disconnect', socket.disconnected);
        socketConnection.current = null;
      });
    }
  }, []);

  const closeSocket = useCallback(() => {
    socketConnection.current?.close();
    socketConnection.current = null;
  }, []);

  const createSocketWithProfile = async (
    socketId: string,
    profileId: string
  ) => {
    try {
      const payload = { profileId, socketId };
      await updateSocketMutate(payload);
    } catch (error) {
      console.log('Failed to update socket with profile:', error);
    }
  };

  useEffect(() => {
    connectSocket();
    return () => {
      closeSocket();
    };
  }, [connectSocket]);

  const contextValue: SocketContextProps = {
    socket: socketConnection.current,
    connectSocket,
    closeSocket,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      <WaitingTimeProvider>
        <DoctorEventProvider>{children}</DoctorEventProvider>
      </WaitingTimeProvider>
    </SocketContext.Provider>
  );
};
