/**
 * WhatsApp Mesaj Yardımcısı
 * Müşterilere tek tıkla teklif onayı, sipariş durumu ve kalan ödeme hatırlatma linki oluşturur.
 */

export function cleanPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  // Rakam dışındaki tüm karakterleri temizle
  let cleaned = phone.replace(/\D/g, "");

  // Eğer 0 ile başlıyorsa (örn: 05321234567) baştaki 0'ı kaldırıp 90 ekle
  if (cleaned.startsWith("0")) {
    cleaned = "90" + cleaned.substring(1);
  } else if (cleaned.length === 10 && cleaned.startsWith("5")) {
    // 5321234567 -> 905321234567
    cleaned = "90" + cleaned;
  }

  return cleaned;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface QuotationWhatsAppParams {
  phone?: string | null;
  customerName: string;
  quotationNumber: string;
  quotationId: string;
  totalAmount: number;
}

export function createQuotationApprovalWhatsAppUrl(params: QuotationWhatsAppParams): string {
  const phone = cleanPhoneNumber(params.phone);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const approvalLink = `${origin}/onay/${params.quotationId}`;

  const message = `Sayın ${params.customerName},

${params.quotationNumber} numaralı ve ${formatCurrency(params.totalAmount)} tutarındaki teklifiniz hazırlanmıştır.

Teklif detaylarını incelemek ve onaylamak için aşağıdaki bağlantıyı kullanabilirsiniz:
🔗 ${approvalLink}

Sorularınız veya revize talepleriniz olursa bize bu hat üzerinden ulaşabilirsiniz.

İyi çalışmalar dileriz.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface OrderPaymentReminderParams {
  phone?: string | null;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export function createOrderPaymentReminderWhatsAppUrl(params: OrderPaymentReminderParams): string {
  const phone = cleanPhoneNumber(params.phone);

  const message = `Sayın ${params.customerName},

${params.orderNumber} numaralı siparişinize ait ödeme ve bakiye durumu aşağıda bilgilerinize sunulmuştur:

💰 Toplam Tutar: ${formatCurrency(params.totalAmount)}
✅ Yapılan Ödeme: ${formatCurrency(params.paidAmount)}
⏳ Kalan Bakiye: ${formatCurrency(params.remainingAmount)}

Kalan ödemenizi banka hesaplarımıza veya mağazamızdan gerçekleştirebilirsiniz. Ödeme dekontunuzu bu hat üzerinden iletebilirsiniz.

Bizi tercih ettiğiniz için teşekkür eder, iyi günler dileriz.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface OrderStatusWhatsAppParams {
  phone?: string | null;
  customerName: string;
  orderNumber: string;
  statusText: string;
  orderId: string;
}

export function createOrderStatusWhatsAppUrl(params: OrderStatusWhatsAppParams): string {
  const phone = cleanPhoneNumber(params.phone);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const trackingLink = `${origin}/siparis-takip/${params.orderId}`;

  const message = `Sayın ${params.customerName},

${params.orderNumber} numaralı siparişinizin güncel durumu: "${params.statusText}" olarak güncellenmiştir.

Siparişinizin tüm detaylarını ve aşamalarını aşağıdaki bağlantıdan anlık olarak takip edebilirsiniz:
🔗 ${trackingLink}

Herhangi bir sorunuz olursa lütfen bizimle iletişime geçiniz.

İyi günler dileriz.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}
