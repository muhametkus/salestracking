import {
  ApiResponse,
  Customer,
  CustomerListItem,
  CreateCustomerInput,
  UpdateCustomerInput,
  ProductCategory,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  Product,
  ProductListItem,
  CreateProductInput,
  UpdateProductInput,
  QuotationListItem,
  QuotationDetail,
  CreateQuotationInput,
  OrderListItem,
  OrderDetail,
  OrderStatus,
  AddPaymentInput,
  UpdatePaymentInput,
  AllEnumsResponse,
  EnumItemDto,
  UploadedImage,
} from "@/types";

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // Client-side: use proxy or env variable
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";
  }
  // Server-side
  return process.env.API_URL || "http://localhost:5010";
};

export const API_BASE_URL = getBaseUrl();

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}/api/${endpoint.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (err) {
    // Non-JSON response
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${text || response.statusText}`);
    }
    return text as unknown as T;
  }

  if (!response.ok) {
    const errorMsg =
      json?.message ||
      json?.error?.message ||
      json?.title ||
      `Hata: ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return json;
}

// -------------------------------------------------------------
// Customers Service
// -------------------------------------------------------------
export const customerService = {
  async getAll(): Promise<CustomerListItem[]> {
    const res = await request<ApiResponse<CustomerListItem[]>>("Customers");
    return res.data || [];
  },

  async getById(id: string): Promise<Customer> {
    const res = await request<ApiResponse<Customer>>(`Customers/${id}`);
    if (!res.data) throw new Error("Müşteri bulunamadı");
    return res.data;
  },

  async create(data: CreateCustomerInput): Promise<{ id: string }> {
    const res = await request<ApiResponse<{ id: string }>>("Customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || { id: "" };
  },

  async update(id: string, data: UpdateCustomerInput): Promise<void> {
    await request<ApiResponse<void>>(`Customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await request<ApiResponse<void>>(`Customers/${id}`, {
      method: "DELETE",
    });
  },

  async hardDelete(id: string): Promise<void> {
    await request<ApiResponse<void>>(`Customers/${id}/hard`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------------
// Product Categories Service
// -------------------------------------------------------------
export const categoryService = {
  async getAll(): Promise<ProductCategory[]> {
    const res = await request<ApiResponse<ProductCategory[]>>("ProductCategories");
    return res.data || [];
  },

  async getById(id: string): Promise<ProductCategory> {
    const res = await request<ApiResponse<ProductCategory>>(`ProductCategories/${id}`);
    if (!res.data) throw new Error("Kategori bulunamadı");
    return res.data;
  },

  async create(data: CreateProductCategoryInput): Promise<{ id: string }> {
    const res = await request<ApiResponse<{ id: string }>>("ProductCategories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || { id: "" };
  },

  async update(id: string, data: UpdateProductCategoryInput): Promise<void> {
    await request<ApiResponse<void>>(`ProductCategories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await request<ApiResponse<void>>(`ProductCategories/${id}`, {
      method: "DELETE",
    });
  },

  async hardDelete(id: string): Promise<void> {
    await request<ApiResponse<void>>(`ProductCategories/${id}/hard`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------------
// Products Service
// -------------------------------------------------------------
export const productService = {
  async getAll(): Promise<ProductListItem[]> {
    const res = await request<ApiResponse<ProductListItem[]>>("Products");
    return res.data || [];
  },

  async getById(id: string): Promise<Product> {
    const res = await request<ApiResponse<Product>>(`Products/${id}`);
    if (!res.data) throw new Error("Ürün bulunamadı");
    return res.data;
  },

  async create(data: CreateProductInput): Promise<{ id: string }> {
    const res = await request<ApiResponse<{ id: string }>>("Products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || { id: "" };
  },

  async update(id: string, data: UpdateProductInput): Promise<void> {
    await request<ApiResponse<void>>(`Products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await request<ApiResponse<void>>(`Products/${id}`, {
      method: "DELETE",
    });
  },

  async hardDelete(id: string): Promise<void> {
    await request<ApiResponse<void>>(`Products/${id}/hard`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------------
// Quotations Service
// -------------------------------------------------------------
export const quotationService = {
  async getAll(): Promise<QuotationListItem[]> {
    const res = await request<ApiResponse<QuotationListItem[]>>("Quotations");
    return res.data || [];
  },

  async getById(id: string): Promise<QuotationDetail> {
    const res = await request<ApiResponse<QuotationDetail>>(`Quotations/${id}`);
    if (!res.data) throw new Error("Teklif bulunamadı");
    return res.data;
  },

  async create(data: CreateQuotationInput): Promise<{ id: string }> {
    const res = await request<ApiResponse<{ id: string }>>("Quotations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || { id: "" };
  },

  async sendForApproval(id: string): Promise<void> {
    await request<ApiResponse<void>>(`Quotations/${id}/send-for-approval`, {
      method: "POST",
    });
  },

  async accept(id: string): Promise<void> {
    await request<ApiResponse<void>>(`Quotations/${id}/accept`, {
      method: "POST",
    });
  },

  async reject(id: string, reason?: string): Promise<void> {
    await request<ApiResponse<void>>(`Quotations/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || null }),
    });
  },

  async cancel(id: string, reason?: string): Promise<void> {
    await request<ApiResponse<void>>(`Quotations/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || null }),
    });
  },

  async approve(id: string): Promise<{ orderId: string }> {
    const res = await request<ApiResponse<{ orderId: string }>>(`Quotations/${id}/approve`, {
      method: "POST",
    });
    return res.data || { orderId: "" };
  },

  async updatePdfUrl(id: string, quotationPdfUrl: string): Promise<void> {
    await request<ApiResponse<void>>(`Quotations/${id}/pdf-url`, {
      method: "PUT",
      body: JSON.stringify({ quotationPdfUrl }),
    });
  },

  async generatePdf(quotationDetail: any): Promise<string | null> {
    const res = await fetch("/api/pdf/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: quotationDetail }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "PDF üretilemedi.");
    }
    const pdfUrl = json.pdfUrl || json.data?.url || json.data?.downloadUrl;
    if (pdfUrl && quotationDetail.id) {
      // Automatically save to backend
      await quotationService.updatePdfUrl(quotationDetail.id, pdfUrl);
    }
    return pdfUrl;
  },
};

// -------------------------------------------------------------
// Orders Service
// -------------------------------------------------------------
export const orderService = {
  async getAll(): Promise<OrderListItem[]> {
    const res = await request<ApiResponse<OrderListItem[]>>("Orders");
    return res.data || [];
  },

  async getById(id: string): Promise<OrderDetail> {
    const res = await request<ApiResponse<OrderDetail>>(`Orders/${id}`);
    if (!res.data) throw new Error("Sipariş bulunamadı");
    return res.data;
  },

  async updateStatus(id: string, status: OrderStatus, description?: string): Promise<void> {
    await request<ApiResponse<void>>(`Orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, description }),
    });
  },

  async addPayment(id: string, data: AddPaymentInput): Promise<{ paymentId: string }> {
    const res = await request<ApiResponse<{ paymentId: string }>>(`Orders/${id}/payments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || { paymentId: "" };
  },

  async updatePayment(id: string, paymentId: string, data: UpdatePaymentInput): Promise<void> {
    await request<ApiResponse<void>>(`Orders/${id}/payments/${paymentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deletePayment(id: string, paymentId: string): Promise<void> {
    await request<ApiResponse<void>>(`Orders/${id}/payments/${paymentId}`, {
      method: "DELETE",
    });
  },

  async updatePdfUrl(id: string, orderPdfUrl: string): Promise<void> {
    await request<ApiResponse<void>>(`Orders/${id}/pdf-url`, {
      method: "PUT",
      body: JSON.stringify({ orderPdfUrl }),
    });
  },

  async generatePdf(orderDetail: any): Promise<string | null> {
    // Map order fields so standard document generator understands it
    const payload = {
      ...orderDetail,
      quotationNumber: orderDetail.orderNumber,
      quotationDate: orderDetail.orderDate,
      documentType: "SIPARIS",
    };

    const res = await fetch("/api/pdf/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "PDF üretilemedi.");
    }
    const pdfUrl = json.pdfUrl || json.data?.url || json.data?.downloadUrl;
    if (pdfUrl && orderDetail.id) {
      await orderService.updatePdfUrl(orderDetail.id, pdfUrl);
    }
    return pdfUrl;
  },
};

// -------------------------------------------------------------
// Uploads Service
// -------------------------------------------------------------
export const uploadService = {
  async uploadImage(file: File, folderName?: string): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append("file", file);
    if (folderName) {
      formData.append("folderName", folderName);
    }

    const res = await request<ApiResponse<UploadedImage>>("Uploads/image", {
      method: "POST",
      body: formData,
    });

    if (!res.data) throw new Error("Görsel yüklenemedi");
    return res.data;
  },

  async getImages(folderName?: string): Promise<UploadedImage[]> {
    const query = folderName ? `?folderName=${encodeURIComponent(folderName)}` : "";
    const res = await request<ApiResponse<UploadedImage[]>>(`Uploads/images${query}`);
    return res.data || [];
  },

  async getFolders(): Promise<string[]> {
    const res = await request<ApiResponse<string[]>>("Uploads/folders");
    return res.data || [];
  },
};

// -------------------------------------------------------------
// Enums Service
// -------------------------------------------------------------
export const enumService = {
  async getAll(): Promise<AllEnumsResponse> {
    const res = await request<ApiResponse<AllEnumsResponse>>("Enums");
    return res.data || { quotationStatuses: [], orderStatuses: [] };
  },

  async getQuotationStatuses(): Promise<EnumItemDto[]> {
    const res = await request<ApiResponse<EnumItemDto[]>>("Enums/quotation-statuses");
    return res.data || [];
  },

  async getOrderStatuses(): Promise<EnumItemDto[]> {
    const res = await request<ApiResponse<EnumItemDto[]>>("Enums/order-statuses");
    return res.data || [];
  },
};
