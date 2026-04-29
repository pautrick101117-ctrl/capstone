import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, PageHeader, TableShell, TextArea, TextInput } from "../../components/ui";

const AdminEvents = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "", location: "", description: "", type: "" });
  const [slotForm, setSlotForm] = useState({ slotDate: "", timeSlot: "", capacity: 1 });

  const load = async () => {
    const [eventData, slotData] = await Promise.all([
      api("/admin/events", { token }),
      api("/admin/id_pickup_slots", { token }),
    ]);
    setEvents(eventData.events || []);
    setSlots(slotData.id_pickup_slots || []);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const saveEvent = async (event) => {
    event.preventDefault();
    try {
      await api("/admin/events", { method: "POST", token, body: eventForm });
      toast.success("Event posted.");
      setEventForm({ title: "", date: "", time: "", location: "", description: "", type: "" });
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveSlot = async (event) => {
    event.preventDefault();
    try {
      await api("/admin/id_pickup_slots", { method: "POST", token, body: slotForm });
      toast.success("Pickup slot saved.");
      setSlotForm({ slotDate: "", timeSlot: "", capacity: 1 });
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Events and Scheduling"
        title="Manage public events and ID pickup slots"
        description="Keep the public barangay calendar updated and provide available scheduling slots for Barangay ID pickup."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Add Public Event</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveEvent}>
            <TextInput label="Title" value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} />
            <TextInput label="Type" value={eventForm.type} onChange={(event) => setEventForm((current) => ({ ...current, type: event.target.value }))} />
            <TextInput label="Date" type="date" value={eventForm.date} onChange={(event) => setEventForm((current) => ({ ...current, date: event.target.value }))} />
            <TextInput label="Time" type="time" value={eventForm.time} onChange={(event) => setEventForm((current) => ({ ...current, time: event.target.value }))} />
            <TextInput label="Location" className="sm:col-span-2" value={eventForm.location} onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))} />
            <TextArea label="Description" className="sm:col-span-2" value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="sm:col-span-2">
              <Button type="submit">Save Event</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Add ID Pickup Slot</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveSlot}>
            <TextInput label="Date" type="date" value={slotForm.slotDate} onChange={(event) => setSlotForm((current) => ({ ...current, slotDate: event.target.value }))} />
            <TextInput label="Time Slot" value={slotForm.timeSlot} onChange={(event) => setSlotForm((current) => ({ ...current, timeSlot: event.target.value }))} />
            <TextInput label="Capacity" type="number" className="sm:col-span-2" value={slotForm.capacity} onChange={(event) => setSlotForm((current) => ({ ...current, capacity: event.target.value }))} />
            <div className="sm:col-span-2">
              <Button type="submit">Save Slot</Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Upcoming Events</h2>
          <div className="mt-5">
            <TableShell>
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-left text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Schedule</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((item) => (
                    <tr key={item.id} className="border-t border-stone-100">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[var(--brand-900)]">{item.title}</p>
                        <p className="mt-1 text-xs text-stone-500">{item.type}</p>
                      </td>
                      <td className="px-4 py-4 text-stone-600">{item.date} {item.time ? `• ${item.time}` : ""}</td>
                      <td className="px-4 py-4 text-stone-600">{item.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Pickup Slots</h2>
          <div className="mt-5">
            <TableShell>
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-left text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Time Slot</th>
                    <th className="px-4 py-3 font-semibold">Capacity</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id} className="border-t border-stone-100">
                      <td className="px-4 py-4 text-stone-600">{slot.slot_date}</td>
                      <td className="px-4 py-4 text-stone-600">{slot.time_slot}</td>
                      <td className="px-4 py-4 text-stone-600">{slot.capacity}</td>
                      <td className="px-4 py-4"><Badge tone={slot.is_active ? "success" : "danger"}>{slot.is_active ? "Active" : "Inactive"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminEvents;
