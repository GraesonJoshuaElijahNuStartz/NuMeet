import { useContext } from "react";
import { WaitingTimeContext, WaitingTimeContextProps } from "../providers";

export const useWaitingTime = (): WaitingTimeContextProps => {
    const context = useContext(WaitingTimeContext);
    if (!context) {
        throw new Error("useWaitingTime must be used within an WaitingTimeProvider");
    }
    return context;
};