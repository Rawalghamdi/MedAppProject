import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useListDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from "@/api/hooks";
import type { Doctor } from "@/types/api";
import { Stethoscope, MapPin, Phone, Mail, Trash2, Plus, Pencil, Users, X } from "lucide-react";

// form shape for creating a new doctor
interface CreateForm {
  name: string; email: string; password: string; phone: string;
  specialty: string; clinic: string; city: string; bio: string;
}

// form shape for editing (no email/password — those can't be changed here)
interface EditForm {
  name: string; phone: string; specialty: string; clinic: string; city: string; bio: string;
}

const emptyCreateForm: CreateForm = {
  name: "", email: "", password: "", phone: "",
  specialty: "", clinic: "", city: "", bio: "",
};

export default function AdminDoctors() {
  const { data: doctors, isLoading } = useListDoctors();
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);
  const [createError, setCreateError] = useState("");

  const [editOpen, setEditOpen]   = useState(false);
  const [editId, setEditId]       = useState<number | null>(null);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm]   = useState<EditForm>({
    name: "", phone: "", specialty: "", clinic: "", city: "", bio: "",
  });

  function openEditModal(doc: Doctor) {
    setEditId(doc.id);
    setEditForm({ name: doc.name, phone: doc.phone, specialty: doc.specialty, clinic: doc.clinic, city: doc.city, bio: doc.bio ?? "" });
    setEditError("");
    setEditOpen(true);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");

    const { name, email, password, phone, specialty, clinic, city } = createForm;
    if (!name || !email || !password || !phone || !specialty || !clinic || !city) {
      setCreateError("All fields except bio are required.");
      return;
    }

    createMutation.mutate(
      { ...createForm, bio: createForm.bio || undefined },
      {
        onSuccess: () => { setCreateOpen(false); setCreateForm(emptyCreateForm); },
        onError: (err) => setCreateError(err.message),
      }
    );
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditError("");

    updateMutation.mutate(
      { id: editId, data: { ...editForm, bio: editForm.bio || null } },
      {
        onSuccess: () => { setEditOpen(false); setEditId(null); },
        onError: (err) => setEditError(err.message),
      }
    );
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Remove Dr. ${name}? This will delete their account permanently.`)) return;
    deleteMutation.mutate(id);
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#0f7bb5]" />
              Manage Doctors
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{doctors?.length ?? 0} doctors registered</p>
          </div>
          <button className="btn-primary" onClick={() => { setCreateForm(emptyCreateForm); setCreateError(""); setCreateOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        </div>

        {isLoading ? <LoadingState /> : !doctors || doctors.length === 0 ? (
          <EmptyState title="No doctors yet" description="Add the first doctor to get started." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="card p-5 flex items-start gap-4">
                {/* avatar circle with first letter of name */}
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 font-bold text-lg">{doc.name?.charAt(0) ?? "D"}</span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-[#0f7bb5] flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />{doc.specialty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(doc)} className="btn-ghost p-1.5 text-gray-400 hover:text-[#0f7bb5]" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(doc.id, doc.name)} disabled={deleteMutation.isPending}
                        className="btn-ghost p-1.5 text-gray-400 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{doc.clinic}, {doc.city}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{doc.phone}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /><span className="truncate">{doc.email}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* add doctor modal */}
      {createOpen && (
        <Modal title="Add New Doctor" onClose={() => setCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && <p className="text-sm text-red-500">{createError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name"  id="c-name"      value={createForm.name}      onChange={(v) => setCreateForm(f => ({ ...f, name: v }))}      placeholder="Dr. Sara Al-Zahrani" />
              <Field label="Specialty"  id="c-specialty" value={createForm.specialty} onChange={(v) => setCreateForm(f => ({ ...f, specialty: v }))} placeholder="Family Medicine" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"  id="c-email"    type="email"    value={createForm.email}    onChange={(v) => setCreateForm(f => ({ ...f, email: v }))}    placeholder="doctor@medapp.sa" />
              <Field label="Phone"  id="c-phone"                   value={createForm.phone}    onChange={(v) => setCreateForm(f => ({ ...f, phone: v }))}    placeholder="+966 5X XXX XXXX" />
            </div>
            <Field label="Password" id="c-password" type="password" value={createForm.password} onChange={(v) => setCreateForm(f => ({ ...f, password: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Clinic" id="c-clinic" value={createForm.clinic} onChange={(v) => setCreateForm(f => ({ ...f, clinic: v }))} placeholder="Al Olaya Medical Center" />
              <Field label="City"   id="c-city"   value={createForm.city}   onChange={(v) => setCreateForm(f => ({ ...f, city: v }))}   placeholder="Riyadh" />
            </div>
            <div>
              <label className="form-label">Bio (optional)</label>
              <textarea className="form-input min-h-[70px]" rows={3} value={createForm.bio}
                onChange={(e) => setCreateForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Brief professional background..." />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Doctor"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* edit doctor modal */}
      {editOpen && (
        <Modal title="Edit Doctor" onClose={() => setEditOpen(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            {editError && <p className="text-sm text-red-500">{editError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" id="e-name"      value={editForm.name}      onChange={(v) => setEditForm(f => ({ ...f, name: v }))} />
              <Field label="Specialty" id="e-specialty" value={editForm.specialty} onChange={(v) => setEditForm(f => ({ ...f, specialty: v }))} />
            </div>
            <Field label="Phone" id="e-phone" value={editForm.phone} onChange={(v) => setEditForm(f => ({ ...f, phone: v }))} placeholder="+966 5X XXX XXXX" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Clinic" id="e-clinic" value={editForm.clinic} onChange={(v) => setEditForm(f => ({ ...f, clinic: v }))} />
              <Field label="City"   id="e-city"   value={editForm.city}   onChange={(v) => setEditForm(f => ({ ...f, city: v }))} />
            </div>
            <div>
              <label className="form-label">Bio (optional)</label>
              <textarea className="form-input min-h-[70px]" rows={3} value={editForm.bio}
                onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

// reusable modal wrapper
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// reusable text input to avoid repeating the same markup
function Field({ label, id, value, onChange, type = "text", placeholder }: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>{label}</label>
      <input id={id} type={type} className="form-input" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
