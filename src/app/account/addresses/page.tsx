"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { SA_PROVINCES, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

const emptyForm: Omit<Address, "id" | "is_default"> = {
  label: "",
  full_name: "",
  phone: "",
  street_address: "",
  suburb: "",
  city: "",
  province: "",
  postal_code: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!customer) {
          setLoading(false);
          return;
        }

        setCustomerId(customer.id);

        const { data, error } = await supabase
          .from("customer_addresses")
          .select("id, label, full_name, phone, street_address, suburb, city, province, postal_code, is_default")
          .eq("customer_id", customer.id)
          .order("is_default", { ascending: false });

        if (!error && data) {
          setAddresses(data as Address[]);
        }
      } catch (err) {
        console.error("[Addresses] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      street_address: address.street_address,
      suburb: address.suburb || "",
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", id);

      if (!error) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("[Addresses] Delete failed:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!customerId) return;

    try {
      const supabase = createClient();
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", customerId);

      await supabase
        .from("customer_addresses")
        .update({ is_default: true })
        .eq("id", id);

      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
    } catch (err) {
      console.error("[Addresses] Set default failed:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    setSaving(true);

    try {
      const supabase = createClient();

      if (editingId) {
        const { error } = await supabase
          .from("customer_addresses")
          .update({
            label: formData.label,
            full_name: formData.full_name,
            phone: formData.phone,
            street_address: formData.street_address,
            suburb: formData.suburb || null,
            city: formData.city,
            province: formData.province,
            postal_code: formData.postal_code,
          })
          .eq("id", editingId);

        if (!error) {
          setAddresses((prev) =>
            prev.map((a) =>
              a.id === editingId ? { ...a, ...formData, suburb: formData.suburb || "" } : a
            )
          );
        }
      } else {
        const isFirst = addresses.length === 0;
        const { data, error } = await supabase
          .from("customer_addresses")
          .insert({
            customer_id: customerId,
            label: formData.label,
            full_name: formData.full_name,
            phone: formData.phone,
            street_address: formData.street_address,
            suburb: formData.suburb || null,
            city: formData.city,
            province: formData.province,
            postal_code: formData.postal_code,
            country: "South Africa",
            is_default: isFirst,
          })
          .select("id, label, full_name, phone, street_address, suburb, city, province, postal_code, is_default")
          .single();

        if (!error && data) {
          setAddresses((prev) => [...prev, data as Address]);
        }
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
    } catch (err) {
      console.error("[Addresses] Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add Address
        </button>
      </div>

      {/* Address Cards */}
      {addresses.map((address) => (
        <div
          key={address.id}
          className={cn(
            "bg-white rounded-xl border p-5 transition-colors",
            address.is_default ? "border-primary/30 bg-primary/5" : "border-gray-200"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span className="font-semibold text-gray-900">{address.label}</span>
              {address.is_default && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  <Check size={12} />
                  Default
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!address.is_default && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
                  title="Set as default"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => handleEdit(address)}
                className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(address.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-0.5 ml-6">
            <p>{address.full_name}</p>
            <p>{address.street_address}</p>
            {address.suburb && <p>{address.suburb}</p>}
            <p>
              {address.city}, {address.province}, {address.postal_code}
            </p>
            <p className="text-gray-500">{address.phone}</p>
          </div>
        </div>
      ))}

      {addresses.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Addresses Saved</h3>
          <p className="text-sm text-gray-500">
            Add a delivery address to make checkout faster.
          </p>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Address" : "New Address"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (e.g. Home, Office)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street_address}
                  onChange={(e) => handleChange("street_address", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                <input
                  type="text"
                  value={formData.suburb}
                  onChange={(e) => handleChange("suburb", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                  <option value="">Select Province</option>
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleChange("postal_code", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingId ? "Update Address" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
