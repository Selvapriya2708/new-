export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
  isLocked: boolean;
  isApproved: boolean;
  failedLoginAttempts: number;
  lastLoginDate?: Date;
  createdDate: Date;
  lastUpdated?: Date;
}

export interface JwtAuthResponse {
  token: string;
  user: User;
}