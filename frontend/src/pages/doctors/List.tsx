import { AppLayout } from "@/components/AppLayout";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useListDoctors } from "@/api/hooks";
import { Stethoscope, MapPin, Phone, Mail } from "lucide-react";

export default function DoctorsList() {
  const { data: doctors, isLoading } = useListDoctors();

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Our Doctors</h1>

        {isLoading ? <LoadingState /> : !doctors || doctors.length === 0 ? (
          <EmptyState title="No doctors registered yet" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="card p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 font-bold text-lg">{doc.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="font-semibold text-gray-900">{doc.name}</p>
                  <p className="text-xs text-[#0f7bb5] flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> {doc.specialty}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {doc.clinic}, {doc.city}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {doc.phone}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> <span className="truncate">{doc.email}</span>
                  </p>
                  {doc.bio && (
                    <p className="text-xs text-gray-400 italic leading-relaxed line-clamp-2">{doc.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
