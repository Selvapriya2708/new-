export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  status: string;
  loginAttempts: number;
  locked: boolean;
  registrationDate: Date;
  approvalDate?: Date;
  lastLoginDate?: Date;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  accountType: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
