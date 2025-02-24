import { useNotification, useSocket, useWaitingTime } from '@hooks';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { DoctorCallPatientEventType, SocketEvent } from '../types';
import { useRouter } from 'next/navigation';

export interface VideoCallProviderProps {
  isContainerMaximized: boolean;
  setContainerMaximized: (isContainerMaximized: boolean) => void;
  handleCallEnd: (patientId: string, doctorId: string) => void;
  callStarted: boolean;
  currentCallEventData: DoctorCallPatientEventType | undefined;
  redirectPatientToJoinCall: () => void;
  resetQueue: () => void;
}

export const VideoCallContext = createContext<
  VideoCallProviderProps | undefined
>(undefined);

export const VideoCallProvider = ({ children }: { children: ReactNode }) => {
  const [isContainerMaximized, setContainerMaximized] = useState<boolean>(true);
  const { socket } = useSocket();
  const { showNotification } = useNotification();
  const router = useRouter();
  const { setMinutes, setSeconds, setCurrentQueueAvailable } = useWaitingTime();
  const [callStarted, setCallStarted] = useState<boolean>(false);
  const [currentCallEventData, setCurrentCallEventData] =
    useState<DoctorCallPatientEventType>();

  useEffect(() => {
    if (socket) {
      socket.on(SocketEvent.DOCTOR_CALLING_PATIENT, handleDoctorCallPatient);
    }
    return () => {
      socket?.off(SocketEvent.DOCTOR_CALLING_PATIENT, handleDoctorCallPatient);
    };
  }, [socket?.connected]);

  const handleDoctorCallPatient = (event: DoctorCallPatientEventType) => {
    console.log('doctor call patient event', event);
    const { callId, doctorId, threadId } = event;
    setCallStarted(true);
    setCurrentCallEventData(event);
    showNotification(
      'Calls Started',
      {
        body: 'Click To JOIN CALL',
      },
      () => {
        window.open(
          `${process.env.NEXT_PUBLIC_HOST_URL}/consultation/call/${callId}/${threadId}/${doctorId}`
        );
      }
    );
  };

  const redirectPatientToJoinCall = () => {
    if (currentCallEventData !== undefined) {
      const { callId, doctorId, threadId } = currentCallEventData;
      router.push(`consultation/call/${callId}/${threadId}/${doctorId}`);
    }
  };

  const handleCallEnd = (patientId: string, doctorId: string) => {
    const eventPayload = { patientId, doctorId };
    resetQueue();
    console.log('handle call end', eventPayload);
    socket && socket?.emit(SocketEvent.DOCTOR_PATIENT_CALL_END, eventPayload);
  };

  const resetQueue = () => {
    setCallStarted(false);
    setMinutes(0);
    setSeconds(0);
    setCurrentQueueAvailable(false);
  };

  const contextValue: VideoCallProviderProps = {
    isContainerMaximized,
    setContainerMaximized,
    handleCallEnd,
    callStarted,
    currentCallEventData,
    redirectPatientToJoinCall,
    resetQueue,
  };

  return (
    <VideoCallContext.Provider value={contextValue}>
      {children}
    </VideoCallContext.Provider>
  );
};
