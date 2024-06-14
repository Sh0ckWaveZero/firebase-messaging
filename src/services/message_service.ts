import { env } from 'bun';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { CoSignOrderData, IconType, IpdInfo, MessageType, NotificationData, NotificationInfo, NotificationType, OpdInfo, PatientInfo } from 'NotificationModule';
import { FirebaseService } from './firebase_service';
import { faker } from '@faker-js/faker';

export class MessageService {
  patientName: string = '';
  title: string = '';
  notificationType: NotificationType = 'lab';
  iconType: IconType = 'laboratory';
  fcmToken: string = '';
  constructor(
    private firebaseService: FirebaseService
  ) {
    this.patientName = faker.person.fullName();
  }


  private messageMap: { [key: string]: MessageType } = {
    'opd': { iconType: 'visit_opd', title: 'New OPD patient' },
    'ipd': { iconType: 'visit_ipd', title: 'New IPD patient' },
    'cosign': { iconType: 'co_sign_order', title: 'Co-Sign Request' },
    'default': { iconType: 'laboratory', title: 'Laboratory' }
  };

  private getIconType(type: string): IconType {
    return this.messageMap[type]?.iconType || this.messageMap['default'].iconType;
  }

  private getTitle(type: string): string {
    return this.messageMap[type]?.title || this.messageMap['default'].title;
  }

  private generateFakePatientData(): PatientInfo {
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

  public createOpdPatient(): PatientInfo {
    return this.generateFakePatientData();
  }

  public createIpdPatient(): PatientInfo {
    return this.generateFakePatientData();
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
    const title: string = this.getTitle(this.notificationType);

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
    const opdPatient = this.createOpdPatient();
    const ipdPatient: PatientInfo = this.createIpdPatient();
    const opdInfo = this.createOpdInfo(opdPatient);
    const ipdInfo: IpdInfo = { patient: ipdPatient };
    const consignInfo = this.createConsignInfo();
    const iconType = this.getIconType(this.notificationType);
    const notificationData = this.createNotificationData(opdInfo, ipdInfo, consignInfo);
    const notificationInfo = this.createNotificationInfo(this.notificationType, notificationData, iconType);
    const title: string = this.getTitle(this.notificationType);

    return {
      token: this.fcmToken,
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

  public async handlePushMessage(body: any): Promise<any> {
    const { from = 'lab', token } = body;
    this.notificationType = from;
    this.fcmToken = token ?? env.FCM_TOKEN;
    this.patientName = faker.person.fullName();
    const message = this.createMessage();
    return this.firebaseService.sendMessage(message);
  }
}