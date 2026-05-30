import {
  Role,
  BookingStatus,
  DocumentStatus,
  DocumentType,
  PaymentStatus,
} from "@prisma/client";

export type { Role, BookingStatus, DocumentStatus, DocumentType, PaymentStatus };

export interface SafeUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone: string | null;
  avatar: string | null;
  isVerified: boolean;
  createdAt: Date;
}
