import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const INITIAL_FORM = {
  complaint_type: "",
  details: "",
};

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  resolved: "border-green-200 bg-green-50 text-green-800",
};

const Complaints = () => {
  const { token, user, refreshNotifications } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api("/complaints/mine", { token });
      setComplaints(data.complaints || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [token]);

  const submitComplaint = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.complaint_type.trim() || !form.details.trim()) {
      setError("Complaint type and details are required.");
      return;
    }

    setSubmitting(true);
    try {
      await api("/complaints", {
        method: "POST",
        token,
        body: form,
      });
      setForm(INITIAL_FORM);
      setMessage("Complaint submitted successfully.");
      await Promise.all([loadComplaints(), refreshNotifications()]);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-3xl bg-white p-6 shadow">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Resident Complaint Desk</p>
        <h1 className="mt-2 text-2xl font-bold text-stone-800">File a complaint</h1>
        <p className="mt-2 text-sm text-stone-600">
          Complaints are submitted under {user?.firstName} {user?.lastName} and go directly to the admin dashboard.
        </p>

        <form onSubmit={submitComplaint} className="mt-6 space-y-4">
          {message ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</div> : null}
          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Complaint Type</label>
            <input
              value={form.complaint_type}
              onChange={(event) => setForm((current) => ({ ...current, complaint_type: event.target.value }))}
              placeholder="Noise disturbance, drainage, road issue..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Details</label>
            <textarea
              value={form.details}
              onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
              placeholder="Describe the issue clearly so the barangay can act on it."
              className="min-h-36 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </section>

      <aside className="rounded-3xl bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-green-800">My complaint history</h2>
        <div className="mt-4 space-y-4">
          {loading ? <p className="text-sm text-stone-500">Loading complaints...</p> : null}
          {!loading && complaints.length === 0 ? <p className="text-sm text-stone-500">You have not submitted any complaints yet.</p> : null}
          {complaints.map((complaint) => (
            <div key={complaint.id} className="rounded-3xl border border-stone-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">{complaint.complaint_type}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                    Filed {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusStyles[complaint.status] || "border-stone-200 bg-stone-50 text-stone-700"}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-stone-600">{complaint.details || "No details provided."}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Complaints;
