export type NotificationInfo = {
  id: string;
  title: string;
  type: NotificationType;
  name: string;
  time: string;
  icon: string;
  data: string;
};

export type NotificationData = {
  opdInfo?: OpdInfo;
  ipdInfo?: IpdInfo;
  coSignInfo?: {};
  lab?: {};
};

export type IpdInfo = {
  patient?: PatientInfo;
};

export type TabType = 'inProgress' | 'finished';
export type IconType = 'visit_ipd' | 'visit_opd' | 'co_sign_order' | 'laboratory';

export type OpdInfo = {
  pathName?: TabType;
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
  visitTime?: string;
};

export type NotificationType = 'opd' | 'ipd' | 'cosign' | 'lab';