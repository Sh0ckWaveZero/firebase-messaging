import { env } from 'bun';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { CoSignOrderData, IpdInfo, NotificationData, NotificationInfo, NotificationType, OpdInfo, PatientInfo } from '../types';
import { FirebaseService } from './firebase_service';
import { faker } from '@faker-js/faker';

export class MessageService {
  constructor(private firebaseService: FirebaseService) { }

  public createOpdPatient(): PatientInfo {
    return {
      patientId: faker.string.uuid(),
      patientVisitId: faker.string.uuid(),
      patientImageId: faker.string.uuid(),
      patientName: faker.person.fullName(),
      mrn: faker.number.bigInt({ min: 1000000n, max: 9999999n }).toString(),
      visitNumber: faker.number.bigInt({ min: 1000000n, max: 9999999n }).toString(),
      visitType: faker.helpers.arrayElement(["Follow-up Visit/การติดตาม", "Initial Visit/การเยี่ยมชมเริ่มต้น"]),
      department: faker.helpers.arrayElement(["Pediatrics", "Cardiology", "Neurology"]),
      visitTime: faker.date.future().toISOString(),
      gender: faker.helpers.arrayElement(["male", "female"]),
      status: faker.helpers.arrayElement(["In Progress", "Completed", "Scheduled"])
    };
  }

  public createOpdInfo(patient: PatientInfo): OpdInfo {
    return {
      patient: patient,
      pathName: 'inProgress',
    };
  }

  public createNotificationData(opdInfo: OpdInfo, ipdInfo: IpdInfo, consignInfo: CoSignOrderData): NotificationData {
    return {
      opdInfo: opdInfo || {},
      ipdInfo: ipdInfo || {},
      consign: consignInfo || {},
      lab: {}
    };
  }

  public createNotificationInfo(notificationType: NotificationType, notificationData: NotificationData): NotificationInfo {
    return {
      id: '1',
      title: 'Notification Title',
      type: notificationType,
      name: 'Notification Name',
      time: 'Notification Time',
      icon: 'Notification Icon',
      data: JSON.stringify(notificationData)
    };
  }

  public createMessage(): Message {
    const fvmToken = env.FCM_TOKEN ?? '';
    const opdPatient = this.createOpdPatient();
    const ipdPatient: PatientInfo = {};
    const opdInfo = this.createOpdInfo(opdPatient);
    const ipdInfo: IpdInfo = { patient: ipdPatient };
    const consignInfo: CoSignOrderData = {};
    const notificationType: NotificationType = 'opd';
    const notificationData = this.createNotificationData(opdInfo, ipdInfo, consignInfo);
    const notificationInfo = this.createNotificationInfo(notificationType, notificationData);

    return {
      token: fvmToken,
      notification: {
        title: "NEW OPD",
        body: faker.person.fullName(),
      },
      data: notificationInfo,
    };
  }

  public async handlePushMessage() {
    const message = this.createMessage();
    return this.firebaseService.sendMessage(message);
  }
}