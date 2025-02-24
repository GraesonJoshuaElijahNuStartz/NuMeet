import { useCurrentUser, useSocket, useTimeCounter } from '@hooks';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { useFetchWaitingTime } from '../queries/queue.query';
import { QueueEventType, QueueType, SocketEvent } from '../types';

export interface WaitingTimeContextProps {
  minutes: number;
  seconds: number;
  setMinutes: (minute: number) => void;
  setSeconds: (second: number) => void;
  isCurrentQueueAvailable: boolean;
  setCurrentQueueAvailable: (status: boolean) => void;
}

export const WaitingTimeContext = createContext<
  WaitingTimeContextProps | undefined
>(undefined);

const specificWaitingTime = 10; // Minutes;
const generalWaitingTime = 5; // Minutes;

export const WaitingTimeProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const [prevIndex, setPrevIndex] = useState<number>();
  const { minutes, seconds, setMinutes, setSeconds } = useTimeCounter({});
  const { currentUser } = useCurrentUser();
  const [isCurrentQueueAvailable, setCurrentQueueAvailable] =
    useState<boolean>(false);
  const { data: waitingTimeData } = useFetchWaitingTime(
    currentUser?.profileId ?? ''
  );

  useEffect(() => {
    if (![null, undefined].includes(waitingTimeData)) {
      checkRemainingTimeExists();
    }
  }, [waitingTimeData]);

  useEffect(() => {
    if (socket) {
      socket.on(SocketEvent.PATIENT_ADD_TO_QUEUE, queueEvent);
      socket.on(SocketEvent.PATIENT_QUEUE_UPDATED, queueEvent);
    }
    return () => {
      socket?.off(SocketEvent.PATIENT_ADD_TO_QUEUE, queueEvent);
      socket?.off(SocketEvent.PATIENT_QUEUE_UPDATED, queueEvent);
    };
  }, [socket?.connected]);

  const queueEvent = (event: QueueEventType) => {
    console.log('queueEvent', event);
    setCurrentQueueAvailable(true);
    if (event.type === QueueType.SPECIFIC) {
      specificQueue(event);
    } else {
      generalQueue(event);
    }
  };

  const specificQueue = (event: QueueEventType) => {
    const { index = 0 } = event;
    if (prevIndex !== index || prevIndex === null) {
      setPrevIndex(index);
      const minute = index ? index * specificWaitingTime : 1;
      setMinutes(minute - 1);
      setSeconds(59);
    }
  };

  const generalQueue = (event: QueueEventType) => {
    const { totalPatients = 0, totalDoctors = 0 } = event;
    const minute =
      Math.round((totalPatients * generalWaitingTime) / totalDoctors) || 0;
    setMinutes(minute ? minute - 1 : minute);
    setSeconds(59);
  };

  const checkRemainingTimeExists = () => {
    const { index, startTime } = waitingTimeData;
    const waitingTime = index * specificWaitingTime * 60 * 1000; // per patient 10 mins in milliseconds
    const currentTime = new Date();
    const startTimeDate = new Date(startTime);
    if (startTimeDate.getDate() === currentTime.getDate()) {
      const elapsedTime = currentTime.getTime() - startTimeDate.getTime();
      const remainingTime = waitingTime - elapsedTime;
      if (remainingTime > 0) {
        const minutes = Math.floor(remainingTime / 1000 / 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        setMinutes(minutes);
        setSeconds(seconds);
        setCurrentQueueAvailable(true);
      }
    }
  };

  return (
    <WaitingTimeContext.Provider
      value={{
        minutes,
        seconds,
        setSeconds,
        setMinutes,
        isCurrentQueueAvailable,
        setCurrentQueueAvailable,
      }}
    >
      {children}
    </WaitingTimeContext.Provider>
  );
};
