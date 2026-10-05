"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import {
  customerService,
  productService,
  categoryService,
  quotationService,
} from "@/lib/api";
import {
  CustomerListItem,
  ProductListItem,
  ProductCategory,
} from "@/types";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  Plus,
  Trash2,
  Loader2,
  UserPlus,
  Info,
  Check,
  PackagePlus,
  Hammer,
  Truck,
  Wrench,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow {
  productId: string;
  customProductName?: string;
  isCustomProduct: boolean;
  quantity: number;
  unitPrice: number;
  description: string;
  isVatIncluded: boolean;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
}

export const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useNotification();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getDefaultValidUntil = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  };

  const getDefaultDeliveryDate = (days: number = 15) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [validUntil, setValidUntil] = useState<string>(getDefaultValidUntil());
  const [notes, setNotes] = useState("");
  const [isVatIncluded, setIsVatIncluded] = useState(false);
  const [isAssemblyIncluded, setIsAssemblyIncluded] = useState(false);
  const [isDeliveryIncluded, setIsDeliveryIncluded] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState<number | "">(15);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(getDefaultDeliveryDate(15));

  const handleDeliveryDaysChange = (daysVal: number | "") => {
    setDeliveryDays(daysVal);
    if (typeof daysVal === "number" && daysVal > 0) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysVal);
      setExpectedDeliveryDate(targetDate.toISOString().split("T")[0]);
    } else {
      setExpectedDeliveryDate("");
    }
  };

  const handleExpectedDeliveryDateChange = (dateStr: string) => {
    setExpectedDeliveryDate(dateStr);
    if (dateStr) {
      const selected = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      const diffTime = selected.getTime() - today.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      setDeliveryDays(diffDays);
    } else {
      setDeliveryDays("");
    }
  };

  const [items, setItems] = useState<ItemRow[]>([
    {
      productId: "",
      customProductName: "",
      isCustomProduct: false,
      quantity: 1,
      unitPrice: 0,
      description: "",
      isVatIncluded: false,
      requiresProduction: false,
      requiresDelivery: false,
      requiresInstallation: false,
    },
  ]);

  // Stock Warning Popup State
  const [stockWarning, setStockWarning] = useState<{
    isOpen: boolean;
    productName: string;
    stock: number;
    rowIndex: number;
    selectedProduct: ProductListItem | null;
  }>({
    isOpen: false,
    productName: "",
    stock: 0,
    rowIndex: -1,
    selectedProduct: null,
  });

  // Quick Customer Creation inline state
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [newCustFirstName, setNewCustFirstName] = useState("");
  const [newCustLastName, setNewCustLastName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustCompany, setNewCustCompany] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [custData, prodData, catData] = await Promise.all([
        customerService.getAll(),
        productService.getAll(),
        categoryService.getAll().catch(() => []),
      ]);
      setCustomers(custData);
      setProducts(prodData);
      setCategories(catData);
      if (custData.length > 0 && !customerId) {
        setCustomerId(custData[0].id);
      }
    } catch (err: any) {
      error(err.message || "Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCustomerSubmit = async () => {
    if (!newCustFirstName.trim() || !newCustLastName.trim() || !newCustPhone.trim()) {
      error("Lütfen müşteri Adı, Soyadı ve Telefon numarasını girin.");
      return;
    }

    try {
      setSavingCustomer(true);
      const res = await customerService.create({
        firstName: newCustFirstName.trim(),
        lastName: newCustLastName.trim(),
        phone: newCustPhone.trim(),
        email: newCustEmail.trim() || null,
        companyName: newCustCompany.trim() || null,
        address: newCustAddress.trim() || null,
      });

      success("Müşteri başarıyla kaydedildi ve teklife eklendi!");
      // Reload customers and select this one
      const updatedCusts = await customerService.getAll();
      setCustomers(updatedCusts);
      setCustomerId(res.id);
      setShowQuickCustomer(false);

      // Reset customer form
      setNewCustFirstName("");
      setNewCustLastName("");
      setNewCustPhone("");
      setNewCustEmail("");
      setNewCustCompany("");
      setNewCustAddress("");
    } catch (err: any) {
      error(err.message || "Müşteri kaydedilemedi.");
    } finally {
      setSavingCustomer(false);
    }
  };

  const applyProductToRow = (index: number, selectedProd: ProductListItem) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index].isCustomProduct = false;
      copy[index].productId = selectedProd.id;
      copy[index].customProductName = "";
      copy[index].unitPrice = selectedProd.price;
      copy[index].requiresProduction = selectedProd.requiresProduction;
      copy[index].requiresDelivery = selectedProd.requiresDelivery;
      copy[index].requiresInstallation = selectedProd.requiresInstallation;
      copy[index].isVatIncluded = isVatIncluded;
      return copy;
    });
  };

  const handleProductChange = (index: number, val: string) => {
    if (val === "__custom__") {
      setItems((prev) => {
        const copy = [...prev];
        copy[index].isCustomProduct = true;
        copy[index].productId = "";
        copy[index].customProductName = "";
        return copy;
      });
      return;
    }

    if (!val) {
      setItems((prev) => {
        const copy = [...prev];
        copy[index].isCustomProduct = false;
        copy[index].productId = "";
        copy[index].customProductName = "";
        return copy;
      });
      return;
    }

    const selectedProd = products.find((p) => p.id === val);
    if (!selectedProd) return;

    // Stok Kontrolü: Eğer üretim gerektirmiyorsa ve stok 0 veya negatifse uyarı pop-up'ı aç
    if (!selectedProd.requiresProduction && selectedProd.stock <= 0) {
      setStockWarning({
        isOpen: true,
        productName: selectedProd.name,
        stock: selectedProd.stock,
        rowIndex: index,
        selectedProduct: selectedProd,
      });
      return;
    }

    applyProductToRow(index, selectedProd);
  };

  const handleItemFieldChange = (
    index: number,
    field: keyof ItemRow,
    value: any
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        customProductName: "",
        isCustomProduct: false,
        quantity: 1,
        unitPrice: 0,
        description: "",
        isVatIncluded: isVatIncluded,
        requiresProduction: false,
        requiresDelivery: false,
        requiresInstallation: false,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      error("Lütfen bir müşteri seçin veya 'Yeni Müşteri Ekle' bölümünden müşteri tanımlayın.");
      return;
    }

    // Check custom products and auto-create them if needed
    setSubmitting(true);
    try {
      const finalItems = [];

      for (const it of items) {
        if (it.quantity <= 0) continue;

        let pid = it.productId;

        // If user typed custom product name as text
        if (it.isCustomProduct || !pid) {
          const customName = (it.customProductName || "").trim();
          if (!customName) {
            error("Lütfen katalog dışı ürün için ürün adını giriniz.");
            setSubmitting(false);
            return;
          }

          // Automatically create product in backend
          let categoryId = categories[0]?.id;
          if (!categoryId) {
            const newCat = await categoryService.create({
              name: "Genel Ürünler",
              description: "Özel teklif ürünleri",
            });
            categoryId = newCat.id;
          }

          const createdProd = await productService.create({
            productCategoryId: categoryId,
            name: customName,
            description: it.description?.trim() || null,
            price: Number(it.unitPrice) || 0,
            stock: 1000, // Katalog dışı / metin olarak girilen ürünler için stok kontrolü muafiyeti
            isVatIncluded: it.isVatIncluded !== undefined ? it.isVatIncluded : isVatIncluded,
            requiresProduction: it.requiresProduction,
            requiresDelivery: it.requiresDelivery,
            requiresInstallation: it.requiresInstallation,
          });
          pid = createdProd.id;
        }

        finalItems.push({
          productId: pid,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          description: it.description?.trim() || null,
          isVatIncluded: it.isVatIncluded !== undefined ? it.isVatIncluded : isVatIncluded,
        });
      }

      if (finalItems.length === 0) {
        error("Lütfen en az bir geçerli ürün kalemi ekleyin.");
        setSubmitting(false);
        return;
      }

      let calculatedValidUntil = validUntil;
      if (!calculatedValidUntil) {
        calculatedValidUntil = getDefaultValidUntil();
      }

      await quotationService.create({
        customerId,
        validUntil: calculatedValidUntil ? new Date(calculatedValidUntil).toISOString() : null,
        notes: notes.trim() || null,
        isVatIncluded,
        isAssemblyIncluded,
        isDeliveryIncluded,
        deliveryDays: deliveryDays ? Number(deliveryDays) : 15,
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate).toISOString()
          : new Date(getDefaultDeliveryDate(15)).toISOString(),
        items: finalItems,
      });

      success("Teklif başarıyla oluşturuldu.");
      onSuccess();
      onClose();

      // Reset form
      setNotes("");
      setValidUntil(getDefaultValidUntil());
      setIsVatIncluded(false);
      setIsAssemblyIncluded(false);
      setIsDeliveryIncluded(false);
      setDeliveryDays(15);
      setExpectedDeliveryDate(getDefaultDeliveryDate(15));
      setItems([
        {
          productId: "",
          customProductName: "",
          isCustomProduct: false,
          quantity: 1,
          unitPrice: 0,
          description: "",
          isVatIncluded: false,
          requiresProduction: false,
          requiresDelivery: false,
          requiresInstallation: false,
        },
      ]);
    } catch (err: any) {
      error(err.message || "Teklif oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Teklif Oluştur"
      subtitle="Müşteri ve ürün kalemlerini belirleyin"
      maxWidth="4xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Veriler yükleniyor...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection and Quick Customer Add */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Müşteri Seçimi *
              </label>
              <button
                type="button"
                onClick={() => setShowQuickCustomer(!showQuickCustomer)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showQuickCustomer ? "Mevcut Müşteri Seç" : "Müşteri Listede Yok (Yeni Ekle)"}
              </button>
            </div>

            {!showQuickCustomer ? (
              <div>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Müşteri Seçin --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {c.companyName ? `(${c.companyName})` : ""} - {c.phone}
                    </option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Henüz müşteri yok. Lütfen "Müşteri Listede Yok (Yeni Ekle)" butonuna tıklayın.
                  </p>
                )}
              </div>
            ) : (
              /* Inline Quick Customer Form */
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3 animate-in fade-in">
                <div className="font-semibold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  Hızlı Müşteri Bilgileri Tanımlama
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Adı *
                    </label>
                    <input
                      type="text"
                      placeholder="Ahmet"
                      value={newCustFirstName}
                      onChange={(e) => setNewCustFirstName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Soyadı *
                    </label>
                    <input
                      type="text"
                      placeholder="Yılmaz"
                      value={newCustLastName}
                      onChange={(e) => setNewCustLastName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Firma Adı
                    </label>
                    <input
                      type="text"
                      placeholder="Opsiyonel firma adı..."
                      value={newCustCompany}
                      onChange={(e) => setNewCustCompany(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      E-Posta
                    </label>
                    <input
                      type="email"
                      placeholder="ornek@posta.com"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Address Field with critical notification */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Adres Bilgisi
                    </label>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                      ⚠️ (Montajlı teslimler için girilmesi gereklidir)
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Cadde, mahalle, ilçe, il ve kapı no..."
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickCustomer(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickCustomerSubmit}
                    disabled={savingCustomer}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    {savingCustomer ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Müşteriyi Kaydet ve Teklife Seç
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Son Geçerlilik Tarihi
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teklif Notları & Şartlar
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ödeme şartı, teslimat detayları vb."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Teklif Koşulları & Maksimum Teslimat Süresi */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Teklif Koşulları & Teslimat Taahhüdü</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Montaj Koşulu */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-purple-600" /> Montaj Koşulu
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAssemblyIncluded
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {isAssemblyIncluded ? "Montaj Dahil" : "Montaj Hariç"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="assemblyIncludedRadio"
                      checked={isAssemblyIncluded === true}
                      onChange={() => setIsAssemblyIncluded(true)}
                      className="w-3.5 h-3.5 text-purple-600"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Montaj Dahildir</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="assemblyIncludedRadio"
                      checked={isAssemblyIncluded === false}
                      onChange={() => setIsAssemblyIncluded(false)}
                      className="w-3.5 h-3.5 text-slate-500"
                    />
                    <span className="text-slate-500">Montaj Hariçtir</span>
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 italic">
                  * Montaj hizmeti tercih edilmediği takdirde, ürünün teslimatı kurulmadan demonte olarak gerçekleştirilecektir.
                </p>
              </div>

              {/* Teslimat Koşulu */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> Teslimat Koşulu
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDeliveryIncluded
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {isDeliveryIncluded ? "Teslimat Dahil" : "Teslimat Hariç"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryIncludedRadio"
                      checked={isDeliveryIncluded === true}
                      onChange={() => setIsDeliveryIncluded(true)}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Teslimat Dahildir</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryIncludedRadio"
                      checked={isDeliveryIncluded === false}
                      onChange={() => setIsDeliveryIncluded(false)}
                      className="w-3.5 h-3.5 text-slate-500"
                    />
                    <span className="text-slate-500">Teslimat Hariçtir</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Teslim Tarihi (Gün & Tarih Seçici Çift Yönlü) */}
            <div className="p-3.5 rounded-lg border border-blue-100 dark:border-blue-950 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Teslim Tarihi
                </span>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                  {deliveryDays ? `${deliveryDays} gün sonra (${expectedDeliveryDate ? new Date(expectedDeliveryDate).toLocaleDateString("tr-TR") : ""})` : "Belirtilmedi"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teslimat Süresi (Gün Olarak)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder="Örn: 15"
                      value={deliveryDays}
                      onChange={(e) => handleDeliveryDaysChange(e.target.value ? parseInt(e.target.value) : "")}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">
                      İş Günü
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Veya Tam Teslim Tarihi Seçin (Takvim)
                  </label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => handleExpectedDeliveryDateChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                * Gün girdiğinizde teslim tarihi otomatik hesaplanır veya takvimden tarih seçtiğinizde gün süresi güncellenir. Onaylanan siparişe de bu teslim tarihi aktarılır.
              </p>
            </div>
          </div>

          {/* KDV Durumu Seçimi */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Teklif KDV Durumu *
                </span>
                <span className="text-[11px] text-slate-500">
                  Fiyata KDV dahil mi yoksa hariç mi olduğunu belirleyin
                </span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="isVatIncludedQuotation"
                    checked={isVatIncluded === false}
                    onChange={() => {
                      setIsVatIncluded(false);
                      setItems((prev) => prev.map((item) => ({ ...item, isVatIncluded: false })));
                    }}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    KDV Hariç
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="isVatIncludedQuotation"
                    checked={isVatIncluded === true}
                    onChange={() => {
                      setIsVatIncluded(true);
                      setItems((prev) => prev.map((item) => ({ ...item, isVatIncluded: true })));
                    }}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Fiyata KDV Dahildir
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Quotation Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Teklif Kalemleri
              </h4>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/40 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Kalem Ekle
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Ürün (Katalog veya Serbest Metin)</th>
                      <th className="p-3 w-28">Adet</th>
                      <th className="p-3 w-36">Birim Fiyat</th>
                      <th className="p-3 w-36">Toplam</th>
                      <th className="p-3 w-12 text-center">Sil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((row, idx) => {
                      const rowTotal = (row.quantity || 0) * (row.unitPrice || 0);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5">
                            {row.isCustomProduct ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  placeholder="Ürün adını serbest metin olarak yazın..."
                                  value={row.customProductName}
                                  onChange={(e) =>
                                    handleItemFieldChange(idx, "customProductName", e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-blue-400 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleProductChange(idx, "")}
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  ← Kataloğa Geri Dön
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <select
                                  value={row.productId}
                                  onChange={(e) => handleProductChange(idx, e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                  <option value="">Ürün Seçin...</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} - {p.price.toLocaleString("tr-TR")} ₺ {p.stock <= 0 && !p.requiresProduction ? "(Stok Yok)" : `(Stok: ${p.stock})`}
                                    </option>
                                  ))}
                                  <option value="__custom__" className="font-semibold text-blue-600">
                                    + Katalogda Yok (Metin Olarak Yaz)
                                  </option>
                                </select>
                              </div>
                            )}
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) =>
                                handleItemFieldChange(idx, "quantity", parseInt(e.target.value) || 1)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.unitPrice}
                              onChange={(e) =>
                                handleItemFieldChange(idx, "unitPrice", parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {rowTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              disabled={items.length === 1}
                              className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isVatIncluded
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                }`}>
                  {isVatIncluded ? "✓ Fiyata KDV dahildir" : "⚠️ KDV Hariç"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Toplam Teklif Tutarı:</span>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {calculateTotal().toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Teklifi Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Stok Olmadığında Pop-up Modal */}
      <Modal
        isOpen={stockWarning.isOpen}
        onClose={() => {
          if (stockWarning.rowIndex >= 0) {
            setItems((prev) => {
              const copy = [...prev];
              copy[stockWarning.rowIndex].productId = "";
              return copy;
            });
          }
          setStockWarning((prev) => ({ ...prev, isOpen: false }));
        }}
        title="Stok Uyarısı"
        subtitle="Ürün Stok Bilgisi"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">
                Üründe Stok Bulunmamaktadır!
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                <strong>{stockWarning.productName}</strong> ürününde stok yoktur (Mevcut Stok: {stockWarning.stock}).
              </p>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 pt-1">
                Yine de bu ürünü teklife eklemek istiyor musunuz?
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (stockWarning.rowIndex >= 0) {
                  setItems((prev) => {
                    const copy = [...prev];
                    copy[stockWarning.rowIndex].productId = "";
                    return copy;
                  });
                }
                setStockWarning((prev) => ({ ...prev, isOpen: false }));
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hayır, Ekleme
            </button>
            <button
              type="button"
              onClick={() => {
                if (stockWarning.selectedProduct && stockWarning.rowIndex >= 0) {
                  applyProductToRow(stockWarning.rowIndex, stockWarning.selectedProduct);
                }
                setStockWarning((prev) => ({ ...prev, isOpen: false }));
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              Evet, Yine de Ekle
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};
