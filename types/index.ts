export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}

export enum QuotationStatus {
  Draft = 1,
  WaitingForApproval = 2,
  Accepted = 3,
  Rejected = 4,
  Cancelled = 5,
  Approved = 6,
}

export enum OrderStatus {
  Created = 1,                 // Oluşturuldu
  InProduction = 2,            // Üretimde
  Produced = 3,                // Üretildi
  Supplied = 4,                // Tedarik Edildi
  WaitingForDelivery = 5,      // Teslimat Bekliyor
  AssemblyDatePending = 6,     // Montaj İçin Gün Verilecek
  AssemblyScheduled = 7,       // Montaj Planlandı
  Completed = 8,               // Sipariş Tamamlandı
  Cancelled = 9,               // İptal Edildi
  InProgress = 10,             // İşlemde
}

export interface EnumItemDto {
  value: number;
  name: string;
  displayName: string;
}

export interface AllEnumsResponse {
  quotationStatuses: EnumItemDto[];
  orderStatuses: EnumItemDto[];
}

// Customers
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  companyName?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  companyName?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  companyName?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerInput extends CreateCustomerInput {
  id: string;
}

// Product Categories
export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export interface CreateProductCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateProductCategoryInput {
  id: string;
  name: string;
  description?: string | null;
}

// Products
export interface Product {
  id: string;
  productCategoryId: string;
  productCategoryName?: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
  isActive: boolean;
  isVatIncluded?: boolean;
  createdAt?: string;
}

export interface ProductListItem {
  id: string;
  productCategoryId: string;
  productCategoryName: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
  isActive: boolean;
  isVatIncluded?: boolean;
  createdAt: string;
}

export interface CreateProductInput {
  productCategoryId: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
  isVatIncluded?: boolean;
}

export interface UpdateProductInput extends CreateProductInput {
  id: string;
  isActive: boolean;
}

// Quotations
export interface QuotationListItem {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  quotationDate: string;
  validUntil?: string | null;
  totalAmount: number;
  status: QuotationStatus;
  statusText: string;
  quotationPdfUrl?: string | null;
  isVatIncluded?: boolean;
  vatStatusText?: string;
  isAssemblyIncluded?: boolean;
  assemblyStatusText?: string;
  isDeliveryIncluded?: boolean;
  deliveryStatusText?: string;
  deliveryDays?: number | null;
  expectedDeliveryDate?: string | null;
  deliveryTimeText?: string | null;
  itemCount: number;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string | null;
  isVatIncluded?: boolean;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
}

export interface QuotationStatusHistory {
  id: string;
  oldStatus?: QuotationStatus | null;
  newStatus: QuotationStatus;
  changedAt?: string;
  createdAt?: string;
  reason?: string | null;
  description?: string | null;
}

export interface QuotationDetail {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customer?: Customer | null;
  quotationDate: string;
  validUntil?: string | null;
  totalAmount: number;
  status: QuotationStatus;
  statusText: string;
  notes?: string | null;
  isVatIncluded?: boolean;
  vatStatusText?: string;
  isAssemblyIncluded?: boolean;
  assemblyStatusText?: string;
  isDeliveryIncluded?: boolean;
  deliveryStatusText?: string;
  deliveryDays?: number | null;
  expectedDeliveryDate?: string | null;
  deliveryTimeText?: string | null;
  quotationPdfUrl?: string | null;
  isConvertedToOrder: boolean;
  createdAt: string;
  items: QuotationItem[];
  statusHistory: QuotationStatusHistory[];
}

export interface CreateQuotationItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  description?: string | null;
  isVatIncluded?: boolean;
}

export interface CreateQuotationInput {
  customerId: string;
  validUntil?: string | null;
  notes?: string | null;
  isVatIncluded?: boolean;
  isAssemblyIncluded?: boolean;
  isDeliveryIncluded?: boolean;
  deliveryDays?: number | null;
  expectedDeliveryDate?: string | null;
  items: CreateQuotationItemInput[];
}

// Order Payments
export interface OrderPayment {
  id: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string | null;
  createdAt?: string;
}

export interface AddPaymentInput {
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string | null;
}

export interface UpdatePaymentInput {
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string | null;
}

// Orders
export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  quotationId?: string | null;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  deliveryDays?: number | null;
  isAssemblyIncluded?: boolean;
  assemblyStatusText?: string;
  isDeliveryIncluded?: boolean;
  deliveryStatusText?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  statusText: string;
  orderPdfUrl?: string | null;
  itemCount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string | null;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
  isVatIncluded?: boolean;
}

export interface OrderStatusHistory {
  id: string;
  oldStatus?: OrderStatus | null;
  oldStatusText?: string | null;
  newStatus: OrderStatus;
  newStatusText?: string | null;
  changedAt?: string;
  createdAt?: string;
  description?: string | null;
}

export interface OrderQuotationInfo {
  id?: string;
  quotationId?: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil?: string | null;
  totalAmount?: number;
  status?: QuotationStatus;
  statusText?: string;
  notes?: string | null;
  quotationPdfUrl?: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  quotationId?: string | null;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  deliveryDays?: number | null;
  isAssemblyIncluded?: boolean;
  assemblyStatusText?: string;
  isDeliveryIncluded?: boolean;
  deliveryStatusText?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  statusText: string;
  notes?: string | null;
  orderPdfUrl?: string | null;
  isVatIncluded?: boolean;
  vatStatusText?: string;
  completedAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  payments: OrderPayment[];
  quotationInfo?: OrderQuotationInfo | null;
}

// Uploads
export interface UploadedImage {
  folder: string;
  fileName: string;
  relativePath: string;
  url: string;
  sizeInBytes: number;
  createdAt: string;
}
