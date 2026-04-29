import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, PageHeader, SelectInput, TableShell, TextArea, TextInput } from "../../components/ui";
import { formatDateTime } from "../../lib/format";

const requestStatuses = ["submitted", "acknowledged", "processing", "completed"];
const idStatuses = ["submitted", "confirmed", "rescheduled", "completed", "cancelled"];

const AdminRequests = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [idRequests, setIdRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "submitted", adminNote: "", preferredDate: "", timeSlot: "" });

  const load = async () => {
    const [requestData, idData] = await Promise.all([
      api("/admin/requests", { token }),
      api("/admin/id-requests", { token }),
    ]);
    setRequests(requestData.requests || []);
    setIdRequests(idData.requests || []);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const save = async (mode) => {
    try {
      const path = mode === "id" ? `/admin/id-requests/${selected.id}` : `/admin/requests/${selected.id}`;
      await api(path, { method: "PATCH", token, body: form });
      toast.success("Request updated.");
      setSelected(null);
      setForm({ status: "submitted", adminNote: "", preferredDate: "", timeSlot: "" });
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Request Management"
        title="Track requests and Barangay ID scheduling"
        description="Update resident request timelines, post admin notes, and confirm or reschedule Barangay ID pickups."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Resident Requests</h2>
          <div className="mt-5">
            <TableShell>
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-left text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Resident</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-t border-stone-100">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[var(--brand-900)]">{request.resident_name}</p>
                        <p className="mt-1 text-xs text-stone-500">{request.details}</p>
                      </td>
                      <td className="px-4 py-4 text-stone-600">{request.request_type}</td>
                      <td className="px-4 py-4"><Badge tone={request.status === "completed" ? "success" : "info"}>{request.status}</Badge></td>
                      <td className="px-4 py-4 text-stone-500">{formatDateTime(request.updated_at || request.created_at)}</td>
                      <td className="px-4 py-4">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelected({ ...request, mode: "request" });
                            setForm({
                              status: request.status,
                              adminNote: request.admin_note || "",
                              preferredDate: request.preferred_date || "",
                              timeSlot: request.preferred_time_slot || "",
                            });
                          }}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Update Request</h2>
          {!selected ? (
            <p className="mt-5 text-sm text-stone-500">Choose a request from the table to update its status timeline and resident note.</p>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[var(--brand-50)] p-4">
                <p className="font-semibold text-[var(--brand-900)]">{selected.resident_name || selected.users?.full_name}</p>
                <p className="mt-1 text-sm text-stone-500">{selected.request_type || selected.purpose}</p>
              </div>
              <SelectInput
                label="Status"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                {(selected.mode === "id" ? idStatuses : requestStatuses).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectInput>
              <TextArea
                label="Admin Note"
                value={form.adminNote}
                onChange={(event) => setForm((current) => ({ ...current, adminNote: event.target.value }))}
                placeholder="Example: Please bring a valid ID during claiming."
              />
              {selected.mode === "id" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Pickup Date"
                    type="date"
                    value={form.preferredDate}
                    onChange={(event) => setForm((current) => ({ ...current, preferredDate: event.target.value }))}
                  />
                  <TextInput
                    label="Time Slot"
                    value={form.timeSlot}
                    onChange={(event) => setForm((current) => ({ ...current, timeSlot: event.target.value }))}
                  />
                </div>
              ) : null}
              <Button onClick={() => save(selected.mode === "id" ? "id" : "request")}>Save Update</Button>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[var(--brand-900)]">Barangay ID Requests</h2>
        <div className="mt-5">
          <TableShell>
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 text-left text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Resident</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Schedule</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {idRequests.map((request) => (
                  <tr key={request.id} className="border-t border-stone-100">
                    <td className="px-4 py-4 font-semibold text-[var(--brand-900)]">{request.users?.full_name || request.users?.first_name}</td>
                    <td className="px-4 py-4 text-stone-600">{request.purpose}</td>
                    <td className="px-4 py-4 text-stone-600">
                      {request.preferred_date || "Pending"} {request.time_slot ? `• ${request.time_slot}` : ""}
                    </td>
                    <td className="px-4 py-4"><Badge tone={request.status === "completed" ? "success" : "info"}>{request.status}</Badge></td>
                    <td className="px-4 py-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelected({ ...request, mode: "id" });
                          setForm({
                            status: request.status,
                            adminNote: request.admin_note || "",
                            preferredDate: request.preferred_date || "",
                            timeSlot: request.time_slot || "",
                          });
                        }}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </Card>
    </div>
  );
};

export default AdminRequests;
