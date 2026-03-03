export type CaseStatus =
  | 'Case Was Received'
  | 'Case Was Approved'
  | 'Case Was Denied'
  | 'Case Was Transferred'
  | 'Request for Evidence Was Sent'
  | 'Response To RFE Was Received'
  | 'Card Was Mailed To Me'
  | 'Card Was Picked Up By The United States Postal Service'
  | 'Card Was Delivered To Me'
  | 'Case Is Ready To Be Scheduled For An Interview'
  | 'Interview Was Scheduled'
  | 'Interview Was Completed'
  | 'New Card Is Being Produced'
  | 'Case Was Updated To Show Fingerprints Were Taken'
  | 'Expedite Request Received'
  | 'Unknown';

export type FormType =
  | 'I-130'
  | 'I-140'
  | 'I-485'
  | 'I-765'
  | 'I-131'
  | 'I-20'
  | 'I-539'
  | 'I-129'
  | 'I-526'
  | 'I-829'
  | 'N-400'
  | 'Other';

export interface ImmigrationCase {
  id: string;
  receiptNumber: string;
  formType: FormType;
  nickname: string;
  status: CaseStatus;
  lastChecked: number;
  lastUpdated: number;
  statusHistory: StatusHistoryEntry[];
  createdAt: number;
}

export interface StatusHistoryEntry {
  status: CaseStatus;
  date: number;
  description?: string;
}
