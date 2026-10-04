"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { customerService } from "@/lib/api";
import { Customer } from "@/types";
import { useNotification } from "@/components/UI/NotificationContext";
import { Loader2 } from "lucide-react";

interface CustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFirstName(customer.firstName);
        setLastName(customer.lastName);
        setPhone(customer.phone);
        setEmail(customer.email || "");
        setCompanyName(customer.companyName || "");
        setAddress(customer.address || "");
        setNotes(customer.notes || "");
      } else {
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        setCompanyName("");
        setAddress("");
        setNotes("");
      }
    }
  }, [isOpen, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      error("Lütfen ad, soyad ve telefon alanlarını doldurun.");
      return;
    }

    try {
      setSubmitting(true);
      if (customer) {
        await customerService.update(customer.id, {
          id: customer.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          companyName: companyName.trim() || null,
          address: address.trim() || null,
          notes: notes.trim() || null,
        });
        success("Müşteri bilgileri güncellendi.");
      } else {
        await customerService.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          companyName: companyName.trim() || null,
          address: address.trim() || null,
          notes: notes.trim() || null,
        });
        success("Yeni müşteri başarıyla eklendi.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || "İşlem sırasında hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? "Müşteriyi Düzenle" : "Yeni Müşteri Ekle"}
      subtitle={customer ? `${customer.firstName} ${customer.lastName}` : "Yeni müşteri kartı oluşturun"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ad *
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Örn: Ahmet"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Soyad *
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Örn: Yılmaz"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Telefon *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-Posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmet@sirket.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Firma Adı
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Örn: ABC Mimarlık & Tasarım Ltd."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Address field with warning note */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Adres
            </label>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
              ⚠️ (Montajlı teslimler için girilmesi gereklidir)
            </span>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="İl, ilçe, mahalle ve açık adres..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Müşteri Notları
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Özel tercihler, görüşme notları..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

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
            {customer ? "Güncelle" : "Müşteriyi Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
