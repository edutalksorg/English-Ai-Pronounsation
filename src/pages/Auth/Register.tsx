// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * IMPORTANT:
 * - Change the import below to match your actual API helper.
 * - If your axios helper is exported as `register` instead of `registerUser`,
 *   replace the import accordingly:
 *
 *   import { register } from "../../lib/api/auth";
 *
 * or if the helper is default exported:
 *
 *   import registerUser from "../../lib/api/auth";
 */
import { registerUser } from "../../lib/api/types/auth"; // <-- adjust path/name if needed

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "User", // default shown value (we use capitalized values)
    referralCode: "",
    referralSource: "",
    instructorBio: "",
    instructorExpertise: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Backend expects capitalized role strings: "User" or "Instructor" (and maybe "Admin")
  function normalizeRole(r: string) {
    const s = (r || "").toString().trim().toLowerCase();
    if (s === "user" || s === "student") return "User";
    if (s === "instructor" || s === "teacher") return "Instructor";
    if (s === "admin" || s === "administrator") return "Admin";
    return "User";
  }

  // Normalize phone number to +91<10 digits> when user enters plain 10 digits
  function normalizePhone(p: string) {
    let s = (p || "").trim();
    if (!s) return s;
    // if starts with + and then digits, keep as is
    if (s.startsWith("+")) return s;
    // strip non-digits
    const digits = s.replace(/\D/g, "");
    if (digits.length === 10) return "+91" + digits;
    // fallback — prefix + if digits present
    return digits.length > 0 ? "+" + digits : s;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!form.fullName.trim()) return setError("Full name is required");
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Enter a valid email");
    if (!form.phoneNumber.trim()) return setError("Phone number is required");
    if (!form.password || form.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setLoading(true);

    try {
      const payload: any = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: normalizePhone(form.phoneNumber),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: normalizeRole(form.role),
      };

      if (form.referralCode?.trim()) payload.referralCode = form.referralCode.trim();
      if (form.referralSource?.trim()) payload.referralSource = form.referralSource.trim();

      // Only include instructor fields for Instructor role
      if (payload.role === "Instructor") {
        payload.instructorBio = form.instructorBio?.trim() ?? "";
        payload.instructorExpertise =
          form.instructorExpertise && String(form.instructorExpertise).trim().length > 0
            ? String(form.instructorExpertise)
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : [];
      }

      // Call your API helper
      // registerUser should call POST /api/v1/auth/register and return axios response
      const res = await registerUser(payload);

      // Try extracting error/success message from common shapes
      const body = res?.data ?? res; // if axios returns resp.data vs helper returns data directly
      const succeeded = body?.succeeded ?? (res?.status >= 200 && res?.status < 300);
      const messages = body?.messages ?? (body?.message ? [body.message] : []);
      const errors = body?.errors ?? (body?.error ? [body.error] : []);
      if (!succeeded) {
        const msg = (errors && errors[0]) || (messages && messages[0]) || "Registration failed";
        setError(msg);
        setLoading(false);
        return;
      }

      // Success
      alert((messages && messages[0]) || "Registration successful. Please confirm your email.");
      navigate("/login");
    } catch (err: any) {
      // Extract backend error message
      let msg = "Registration failed";
      if (err?.response?.data) {
        const d = err.response.data;
        msg =
          d?.errors?.[0] ||
          d?.messages?.[0] ||
          d?.detail ||
          d?.message ||
          JSON.stringify(d);
      } else if (err?.message) {
        msg = err.message;
      }
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 border rounded">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          className="w-full"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          required
        />

        <Input
          className="w-full"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />

        <Input
          className="w-full"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={(e) => update("phoneNumber", e.target.value)}
          required
        />

        <Input
          className="w-full"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />

        <Input
          className="w-full"
          placeholder="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          required
        />

        <select
          className="w-full p-2 border rounded"
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
        >
          <option value="User">User</option>
          <option value="Instructor">Instructor</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Instructor fields only visible for Instructor */}
        {form.role === "Instructor" && (
          <>
            <Textarea
              className="w-full"
              placeholder="Instructor Bio"
              value={form.instructorBio}
              onChange={(e) => update("instructorBio", e.target.value)}
            />

            <Input
              className="w-full"
              placeholder="Expertise (comma separated)"
              value={form.instructorExpertise}
              onChange={(e) => update("instructorExpertise", e.target.value)}
            />
          </>
        )}

        <Input
          className="w-full"
          placeholder="Referral Code (optional)"
          value={form.referralCode}
          onChange={(e) => update("referralCode", e.target.value)}
        />

        <Input
          className="w-full"
          placeholder="Referral Source (optional)"
          value={form.referralSource}
          onChange={(e) => update("referralSource", e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Please wait..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
