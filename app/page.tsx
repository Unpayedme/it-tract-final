"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { liveAnalytics } from "@/lib/analyticsTransfer";
import { DollarSign, BarChart2, CalendarCheck, Home, X, User, Loader2, Mail } from "lucide-react";

interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: string;
}

const RoomMetricCard: React.FC<{ title: string; value: string; color: string; icon: React.ReactNode }> = ({
  title,
  value,
  color,
  icon,
}) => (
  <div className={`p-4 rounded-xl ${color} text-white shadow-lg mb-4 flex items-center justify-between`}>
    <div>
      <p className="text-sm opacity-80 font-medium">{title}</p>
      <p className="text-2xl font-extrabold mt-1">{value}</p>
    </div>
    <div className="p-2 bg-white/20 rounded-full">
      {icon}
    </div>
  </div>
);

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const [guestNameInput, setGuestNameInput] = useState("");
  const [guestEmailInput, setGuestEmailInput] = useState("");

  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/rooms").then(r => r.json()),
      fetch("/api/analytics").then(r => r.json()),
    ]).then(([r, a]) => {
      setRooms(r.rooms || []);
      setAnalytics(a.analytics || []);
      setLoading(false);
    });
  }, []);

  const addBookingToState = (roomId: number, guestName: string) => {
    const today = new Date().toISOString().split("T")[0];

    setAnalytics(prev =>
      prev.map((room: any) => {
        if (room.roomId !== roomId) return room;

        const guests = [...room.guestRecords, { guestName, date: today }];
        let bookings = [...room.bookingsOverTime];
        const idx = bookings.findIndex((b: any) => b.date === today);
        if (idx === -1) bookings.push({ date: today, count: 1 });
        else bookings[idx] = { ...bookings[idx], count: bookings[idx].count + 1 };

        return { ...room, guestRecords: guests, bookingsOverTime: bookings };
      })
    );
    liveAnalytics.splice(0, liveAnalytics.length, ...analytics);
  };

  const openBookingModal = (roomId: number) => {
    setSelectedRoomId(roomId);
    setGuestNameInput("");
    setGuestEmailInput("");
    setIsModalOpen(true);
  };

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!guestNameInput || !guestEmailInput || selectedRoomId === null) return;

    setIsBookingLoading(true);

    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: selectedRoomId,
        guestName: guestNameInput,
        guestEmail: guestEmailInput,
      }),
    });

    if (res.ok) {
      addBookingToState(selectedRoomId, guestNameInput);
      setIsModalOpen(false);
      alert("Booking successful!");
    } else {
      alert("Booking failed.");
    }

    setIsBookingLoading(false);
  }

  const handleViewAnalytics = () => {
    liveAnalytics.splice(0, liveAnalytics.length, ...analytics);
    router.push("/analytics");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* HEADER */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-xl py-4 sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-wider">
              <span className="text-cyan-400">Lux</span>Stay
            </h1>
          </div>
          <nav className="flex items-center gap-6 text-gray-300 font-medium">
            <a href="#" className="hover:text-cyan-400 transition duration-200 p-2 rounded-lg">Home</a>
            <a href="#rooms" className="hover:text-cyan-400 transition duration-200 p-2 rounded-lg">Rooms</a>
            <button 
                onClick={handleViewAnalytics} 
                className="flex items-center gap-2 bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-cyan-700 transition duration-200 transform hover:scale-[1.03]"
            >
                <BarChart2 className="w-4 h-4" /> View Analytics
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION — THE ONE YOU WANTED BACK */}
      <section className="bg-gray-950 pt-20 pb-10 text-center">
        <div className="container mx-auto px-6">
            <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                Welcome to the <span className="text-cyan-400">Hotel Management</span> Dashboard
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A simplified management interface designed to populate booking data for simple analytics.
            </p>
        </div>
      </section>

      {/* ROOMS SECTION (unchanged) */}
      <section id="rooms" className="py-16 px-6 lg:px-10">
        <div className="container mx-auto">
          <h3 className="text-4xl font-extrabold text-white text-center mb-16 border-b-2 border-cyan-700/50 pb-4 tracking-wide">
            Available Suites & Rooms
          </h3>

          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : rooms.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">No rooms are currently available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

              {rooms.map(room => (
                <div key={room.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-7 shadow-2xl flex flex-col">
                  
                  <h4 className="text-3xl font-bold text-cyan-400 mb-3">{room.name}</h4>
                  <p className="text-gray-300 text-sm mb-6 flex-1">{room.description}</p>

                  <RoomMetricCard 
                    title="Current Price (Per Night)" 
                    value={`₱${room.price.toLocaleString()}`} 
                    color="bg-emerald-700/90"
                    icon={<DollarSign className="w-6 h-6" />}
                  />

                  <button 
                    onClick={() => openBookingModal(room.id)} 
                    className="mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <CalendarCheck className="w-5 h-5" /> Book Now
                  </button>
                
                </div>
              ))}

            </div>
          )}
        </div>
      </section>

      {/* BOOKING MODAL — ADDED EMAIL FIELD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl p-6 relative">

            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-4">Complete Your Reservation</h3>

            <form onSubmit={handleConfirmBooking} className="space-y-5">

              {/* NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Guest Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text"
                    required
                    value={guestNameInput}
                    onChange={e => setGuestNameInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg placeholder-gray-600"
                  />
                </div>
              </div>

              {/* EMAIL — THIS IS THE ONLY NEW THING */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Guest Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="email"
                    required
                    placeholder="e.g. johndoe@gmail.com"
                    value={guestEmailInput}
                    onChange={e => setGuestEmailInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg placeholder-gray-600"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBookingLoading}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isBookingLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
