export enum SocketEvent {
    PATIENT_ADD_TO_QUEUE = "TD::Patient:Add-To-Queue",
    PATIENT_QUEUE_UPDATED = "TD::Patient:Queue-Updated",
    DOCTOR_CALLING_PATIENT = "TD::Patient:Doctor-Calling-Patient",
    DOCTOR_PATIENT_CALL_END = "TD::Patient:Doctor-Patient-Call-End",
    PATIENT_ADD_DOCTOR_QUEUE = "TD::Doctor:Patient-Add-Doctor-Queue",
    DOCTOR_STATUS_ONLINE = "TD::Doctor:Doctor-Status-Online",
    DOCTOR_STATUS_OFFLINE ="TD::Doctor:Doctor-Status-Offline"
}
