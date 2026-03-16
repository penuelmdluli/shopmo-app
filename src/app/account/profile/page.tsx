"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  marketing_opt_in: boolean;
  whatsapp_opt_in: boolean;
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    marketing_opt_in: false,
    whatsapp_opt_in: false,
  });
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Try to find existing customer record
        const { data: customer } = await supabase
          .from("customers")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (customer) {
          setCustomerId(customer.id);
          setFormData({
            full_name: customer.full_name || "",
            email: customer.email || user.email || "",
            phone: customer.phone || "",
            date_of_birth: customer.date_of_birth || "",
            marketing_opt_in: customer.marketing_opt_in || false,
            whatsapp_opt_in: customer.whatsapp_opt_in || false,
          });
        } else {
          // No customer record yet — populate from auth user metadata
          const meta = user.user_metadata || {};
          setFormData({
            full_name: meta.full_name || "",
            email: user.email || "",
            phone: meta.phone || "",
            date_of_birth: "",
            marketing_opt_in: meta.marketing_opt_in || false,
            whatsapp_opt_in: false,
          });
        }
      } catch (err) {
        console.error("[Profile] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to save your profile.");
        setSaving(false);
        return;
      }

      const profileData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        marketing_opt_in: formData.marketing_opt_in,
        whatsapp_opt_in: formData.whatsapp_opt_in,
      };

      if (customerId) {
        // Update existing customer record
        const { error: updateError } = await supabase
          .from("customers")
          .update(profileData)
          .eq("id", customerId);

        if (updateError) {
          console.error("[Profile] Update failed:", updateError);
          setError("Failed to save changes. Please try again.");
          setSaving(false);
          return;
        }
      } else {
        // Create new customer record
        const { data: newCustomer, error: insertError } = await supabase
          .from("customers")
          .insert({
            auth_user_id: user.id,
            ...profileData,
            preferred_language: "en",
            loyalty_points: 0,
            total_orders: 0,
            total_spent: 0,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("[Profile] Insert failed:", insertError);
          setError("Failed to create profile. Please try again.");
          setSaving(false);
          return;
        }

        if (newCustomer) {
          setCustomerId(newCustomer.id);
        }
      }

      setSaved(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">Changes saved!</span>
            )}
          </div>
        </form>
      </div>

      {/* Marketing Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketing Preferences</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose how you&apos;d like to hear from us about deals and promotions.
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900">Email &amp; SMS Notifications</p>
              <p className="text-xs text-gray-500">Receive deals and updates via email and SMS</p>
            </div>
            <input
              type="checkbox"
              checked={formData.marketing_opt_in}
              onChange={(e) => handleChange("marketing_opt_in", e.target.checked)}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900">WhatsApp Updates</p>
              <p className="text-xs text-gray-500">Order updates and deals on WhatsApp</p>
            </div>
            <input
              type="checkbox"
              checked={formData.whatsapp_opt_in}
              onChange={(e) => handleChange("whatsapp_opt_in", e.target.checked)}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
