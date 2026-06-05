import { AppLayout } from "@/components/AppLayout";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 text-sm mb-8">
          Reach out to any of our clinic branches across Saudi Arabia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              city: "Riyadh",
              address: "King Fahd Road, Al Olaya District, Riyadh 12211",
              phone: "+966 11 234 5678",
              email: "riyadh@medapp.sa",
              hours: "Sun – Thu: 8:00 AM – 9:00 PM",
            },
            {
              city: "Jeddah",
              address: "Tahlia Street, Al Rawdah District, Jeddah 23431",
              phone: "+966 12 345 6789",
              email: "jeddah@medapp.sa",
              hours: "Sun – Thu: 8:00 AM – 9:00 PM",
            },
            {
              city: "Dammam",
              address: "Prince Mohammed Bin Fahd Road, Al Faisaliyah, Dammam 31411",
              phone: "+966 13 456 7890",
              email: "dammam@medapp.sa",
              hours: "Sun – Thu: 8:00 AM – 9:00 PM",
            },
          ].map((loc) => (
            <div key={loc.city} className="card p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#0f7bb5]">{loc.city}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-[#0f7bb5] mt-0.5 flex-shrink-0" />
                  <span>{loc.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-[#0f7bb5]" />
                  <span>{loc.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-[#0f7bb5]" />
                  <span>{loc.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-[#0f7bb5]" />
                  <span>{loc.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
