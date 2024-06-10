export type NotificationData = {
  opdInfo?: OpdInfo;
  ipdInfo?: IpdInfo;
  consign?: {};
  lab?: {};
};

export type IpdInfo = {
  patient?: PatientInfo;
};

export type OpdInfo = {
  patient?: PatientInfo;
};

export type PatientInfo = {
  department?: string;
  departmentId?: string;
  gender?: string;
  mrn?: string;
  patientId?: string;
  patientImageId?: string;
  patientName?: string;
  patientVisitId?: string;
  status?: string;
  visitNumber?: string;
  visitTime?: string;
  visitType?: string;
  ward?: string;
  dateOfBirth?: string;
};

export type CoSignOrderData = {
  patientId?: string;
  patientVisitId?: string;
  patientImageId?: string;
  patientName?: string;
  mrn?: string;
  orderName?: string;
  departmentId?: string;
  department?: string;
  gender?: string;
  dateOfBirth?: string;
  patientOrderId?: string;
  patientOrderItemId?: string;
};

export type NotificationType = 'opd' | 'ipd' | 'cosign' | 'lab';