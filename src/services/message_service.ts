import { env } from 'bun';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { CoSignOrderData, IconType, IpdInfo, NotificationData, NotificationInfo, NotificationType, OpdInfo, PatientInfo } from '../types';
import { FirebaseService } from './firebase_service';
import { faker } from '@faker-js/faker';

export class MessageService {
  patientName: string = '';

  title: string = '';
  notificationType: NotificationType = 'lab';
  iconType: IconType = 'laboratory';
  constructor(private firebaseService: FirebaseService) {
    this.patientName = faker.person.fullName();
  }
  private getFvmToken(): string {
    return env.FCM_TOKEN ?? '';
  }

  private getIconType(type: string): IconType {
    if (type === 'opd') {
      return 'visit_opd';
    } else if (type === 'ipd') {
      return 'visit_ipd';
    } else if (type === 'cosign') {
      return 'co_sign_order';
    }
    return 'laboratory';
  }

  private getTile(type: string): string {
    if (type === 'opd') {
      return 'New OPD patient';
    } else if (type === 'ipd') {
      return 'New IPD patient';
    } else if (type === 'cosign') {
      return 'Co-Sign Request';
    }
    return 'Laboratory';
  }

  public createOpdPatient(): PatientInfo {
    return {
      patientId: faker.string.uuid(),
      patientVisitId: faker.string.uuid(),
      patientImageId: faker.string.uuid(),
      patientName: this.patientName,
      mrn: faker.number.bigInt({ min: 1000000n, max: 9999999n }).toString(),
      visitNumber: faker.number.bigInt({ min: 1000000n, max: 9999999n }).toString(),
      visitType: faker.helpers.arrayElement(["Follow-up Visit/การติดตาม", "Initial Visit/การเยี่ยมชมเริ่มต้น"]),
      department: faker.helpers.arrayElement(["Pediatrics", "Cardiology", "Neurology"]),
      visitTime: new Date(Date.now()).toISOString(),
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

  public createNotificationData(opdInfo: OpdInfo, ipdInfo: IpdInfo, coSignInfo: CoSignOrderData): NotificationData {
    return {
      opdInfo: opdInfo,
      ipdInfo: ipdInfo,
      coSignInfo: coSignInfo,
      lab: {}
    };
  }

  public createNotificationInfo(notificationType: NotificationType, notificationData: NotificationData, iconType: IconType): NotificationInfo {
    const title: string = this.getTile(this.notificationType);

    return {
      id: faker.string.uuid(),
      title: title,
      type: notificationType,
      name: this.patientName,
      time: new Date(Date.now()).toISOString(),
      icon: iconType,
      data: JSON.stringify(notificationData)
    };
  }

  public createMessage(): Message {
    const fvmToken = this.getFvmToken();
    const opdPatient = this.createOpdPatient();
    const ipdPatient: PatientInfo = {};
    const opdInfo = this.createOpdInfo(opdPatient);
    const ipdInfo: IpdInfo = { patient: ipdPatient };
    const consignInfo = this.createConsignInfo();
    const iconType = this.getIconType(this.notificationType);
    const notificationData = this.createNotificationData(opdInfo, ipdInfo, consignInfo);
    const notificationInfo = this.createNotificationInfo(this.notificationType, notificationData, iconType);
    const title: string = this.getTile(this.notificationType);

    return {
      token: fvmToken,
      notification: this.createNotification(title),
      data: notificationInfo,
    };
  }

  private createConsignInfo(): CoSignOrderData {
    return {
      patientId: faker.string.uuid(),
      patientVisitId: faker.string.uuid(),
      patientOrderId: faker.string.uuid(),
      patientOrderItemId: faker.string.uuid(),
      patientImageId: faker.string.uuid(),
      patientName: faker.person.fullName(),
      dateOfBirth: faker.date.past().toISOString(),
      mrn: faker.number.bigInt({ min: 1000000n, max: 9999999n }).toString(),
      orderName: faker.lorem.sentence(),
      visitTime: new Date(Date.now()).toISOString(),
      departmentId: faker.string.uuid(),
      department: faker.helpers.arrayElement(["Pediatrics", "Cardiology", "Neurology"]),
      gender: faker.helpers.arrayElement(["male", "female"]),
    };
  }

  private createNotification(title: string): { title: string, body: string } {
    return {
      title: title,
      body: this.patientName,
    };
  }

  public async handlePushMessage(body: any) {
    this.notificationType = body.from ?? 'lab';
    this.patientName = faker.person.fullName();
    const message = this.createMessage();
    return this.firebaseService.sendMessage(message);
  }
}