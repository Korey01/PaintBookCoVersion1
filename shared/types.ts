/**
 * Core types shared between client and server
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  userType: "customer" | "painter";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserResponse;
  error?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  userType: "customer" | "painter";
  customerProfile?: CustomerProfileResponse;
  painterProfile?: PainterProfileResponse;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface CustomerProfileResponse {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  postcode?: string;
  favoritesPainterIds: string[];
}

export interface UpdateCustomerProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  postcode?: string;
}

// ============================================================================
// PAINTER TYPES
// ============================================================================

export interface PainterProfileResponse {
  id: string;
  businessName?: string;
  bio?: string;
  phone?: string;
  postcode: string;
  serviceRadius: number;
  skills: string[];
  availability: string[];
  rateMin: number;
  rateMax: number;
  portfolioImages: string[];
  verificationStatus: "pending" | "under_review" | "approved" | "denied";
  tier: "starter" | "pro" | "premium";
  reliabilityScore: number;
  totalJobs: number;
  totalEarnings: number;
  cancellationRate: number;
}

export interface UpdatePainterProfileRequest {
  businessName?: string;
  bio?: string;
  phone?: string;
  postcode?: string;
  serviceRadius?: number;
  skills?: string[];
  availability?: string[];
  rateMin?: number;
  rateMax?: number;
}

export interface PainterOnboardingRequest {
  businessName?: string;
  bio?: string;
  postcode: string;
  serviceRadius?: number;
  skills: string[];
  availability?: string[];
  rateMin: number;
  rateMax: number;
  portfolioImages?: string[];
  idType?: string;
  idNumber?: string;
  idExpiryDate?: string;
  idDocuments?: string[];
  hasInsurance?: boolean;
  insuranceInsurer?: string;
  insurancePolicy?: string;
  insuranceExpiry?: string;
  insuranceDocs?: string[];
}

// ============================================================================
// JOB TYPES
// ============================================================================

export interface CreateJobRequest {
  jobType: string;
  title: string;
  description?: string;
  postcode: string;
  budgetMin?: number;
  budgetMax?: number;
  images?: string[];
  paintBrand?: string;
  rooms?: RoomDimension[];
  estimatedMaterialCost?: number;
  estimatedLitres?: number;
  estimatedWallArea?: number;
  useEscrow?: boolean;
  customerEmail?: string;
  customerPhone?: string;
}

export interface RoomDimension {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  coats: number;
}

export interface JobResponse {
  id: string;
  jobType: string;
  title: string;
  description?: string;
  postcode: string;
  budgetMin?: number;
  budgetMax?: number;
  images: string[];
  paintBrand?: string;
  rooms: RoomDimension[];
  estimatedMaterialCost?: number;
  estimatedLitres?: number;
  estimatedWallArea?: number;
  useEscrow: boolean;
  status: string;
  painterId?: string;
  escrowAmount?: number;
  escrowStatus: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  images?: string[];
  paintBrand?: string;
  rooms?: RoomDimension[];
  estimatedMaterialCost?: number;
  estimatedLitres?: number;
  estimatedWallArea?: number;
}

// ============================================================================
// QUOTE TYPES
// ============================================================================

export interface CreateQuoteRequest {
  jobId: string;
  jobPrice: number;
  consultationFee?: number;
}

export interface QuoteResponse {
  id: string;
  jobId: string;
  painterId: string;
  jobPrice: number;
  consultationFee: number;
  totalPrice: number;
  status: string;
  rejectionReason?: string;
  negotiationHistory: NegotiationEntry[];
  createdAt: string;
  acceptedAt?: string;
  expiresAt?: string;
}

export interface NegotiationEntry {
  proposedBy: string;
  price: number;
  timestamp: string;
  status: string;
}

export interface UpdateQuoteRequest {
  status?: string;
  jobPrice?: number;
  consultationFee?: number;
  rejectionReason?: string;
}

// ============================================================================
// PAYMENT & ESCROW TYPES
// ============================================================================

export interface InitiatePaymentRequest {
  jobId: string;
  amount: number;
  paymentMethod: "stripe" | "card";
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  escrowTransactionId?: string;
  status?: string;
  error?: string;
}

export interface TranspactEscrowRequest {
  amount: number;
  jobId: string;
  customerId: string;
  painterId: string;
  itemDescription: string;
  returnUrl: string;
  notificationUrl: string;
}

export interface EscrowTransactionResponse {
  id: string;
  jobId: string;
  transpactTransactionId?: string;
  transpactStatus?: string;
  totalAmount: number;
  painterbookcoCommission: number;
  escrowCost: number;
  painterAmount: number;
  commissionRate: number;
  status: string;
  customerPaidAmount: number;
  painterPaidAmount: number;
  fundedAt?: string;
  releasedAt?: string;
}

// ============================================================================
// DISPUTE TYPES
// ============================================================================

export interface CreateDisputeRequest {
  jobId: string;
  reason: string;
  description?: string;
  evidence?: EvidenceItem[];
}

export interface EvidenceItem {
  type: "photo" | "message";
  data: string;
}

export interface DisputeResponse {
  id: string;
  jobId: string;
  initiatedBy: string;
  reason: string;
  description?: string;
  status: string;
  evidence: EvidenceSubmissionResponse[];
  resolution?: string;
  customerRefundAmount?: number;
  painterCompensationAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface EvidenceSubmissionResponse {
  id: string;
  disputeId: string;
  submittedBy: string;
  evidence: EvidenceItem;
  createdAt: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface SendMessageRequest {
  jobId: string;
  recipientId: string;
  content: string;
  attachments?: string[];
}

export interface MessageResponse {
  id: string;
  jobId: string;
  senderId: string;
  recipientId: string;
  content: string;
  attachments: string[];
  createdAt: string;
  readAt?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationResponse {
  id: string;
  userId: string;
  jobId: string;
  type: string;
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

// ============================================================================
// B2B TYPES
// ============================================================================

export interface CreateB2BCustomerRequest {
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  projectDescription?: string;
  location?: string;
}

export interface B2BCustomerResponse {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  projectDescription?: string;
  location?: string;
  status: string;
  meetingDate?: string;
  agreementStatus: string;
  milestones: B2BMilestoneResponse[];
}

export interface B2BMilestoneResponse {
  id: string;
  title: string;
  description?: string;
  scope?: string;
  budgetAmount: number;
  status: string;
  dueDate?: string;
  completedAt?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode?: number;
  details?: Record<string, any>;
}
