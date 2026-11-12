export interface NotificationItem {


  id: string;


  title: string;


  message: string;


  date: string;


  read: boolean;


  type: 'deadline' | 'admit' | 'application' | 'exam' | 'system';


  link?: string;


}


export interface JobAlertPreference {


  categories: string[];


  districts: string[];


  grades: string[];


  emailAlert: boolean;


  smsAlert: boolean;


  whatsappAlert: boolean;


  frequency: 'daily' | 'weekly' | 'instant';


}
