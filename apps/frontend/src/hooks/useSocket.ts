import { useContext } from "react";
import { SocketContext, SocketContextProps } from "../providers";

export const useSocket = (): SocketContextProps => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within an SocketProvider");
    }
    return context;
};
