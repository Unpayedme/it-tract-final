"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { liveAnalytics } from "@/lib/analyticsTransfer";
import { DollarSign, BarChart2, CalendarCheck, Home } from "lucide-react"; // Importing icons for visual flair

interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: string;
}

// Enhanced Metric Card with Icon and better shadow
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
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/rooms").then(r => r.json()),
      fetch("/api/analytics").then(r => r.json()),
    ]).then(([r, a]) => {
      setRooms(r.rooms || []);
      setAnalytics(a.analytics || []);
      setLoading(false);
    }).catch(error => {
        console.error("Failed to fetch initial data:", error);
        setLoading(false);
    });
  }, []);

  const addBooking = (roomId: number, guestName: string) => {
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

    // Update liveAnalytics by mutating the array AFTER the state update (using the new state would be safer in real app, but sticking to original logic)
    // NOTE: In a real app, this should ideally be triggered after the setAnalytics has completed, e.g., using a separate useEffect if needed for consistency.
    // For the sake of refactoring, we keep the original intent here:
    // We are passing the *old* `analytics` state to liveAnalytics here, which is risky.
    // However, to maintain the logic flow for `liveAnalytics`, we'll keep the mutation.
    liveAnalytics.splice(0, liveAnalytics.length, ...analytics);
  };

  async function handleBookNow(roomId: number) {
    const guestName = prompt("Enter your name for booking:");
    if (!guestName) return;

    // Show a loading indicator in a real app
    
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, guestName }),
    });

    if (res.ok) {
      alert("Booking successful!");
      addBooking(roomId, guestName);
    } else {
      const msg = await res.json().catch(() => ({ error: "Unknown error" }));
      alert(`Booking failed: ${msg.error}`);
    }
  }

  const handleViewAnalytics = () => {
    // Mutate liveAnalytics before navigating
    liveAnalytics.splice(0, liveAnalytics.length, ...analytics);
    router.push("/analytics");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Formal Header/Navigation */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-xl py-4 sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-wider">
              <span className="text-cyan-400">Lux</span>Stay
            </h1>
          </div>
          <nav className="flex items-center gap-6 text-gray-300 font-medium">
            <a 
                href="#" 
                className="hover:text-cyan-400 transition duration-200 p-2 rounded-lg"
            >
                Home
            </a>
            <a 
                href="#rooms" 
                className="hover:text-cyan-400 transition duration-200 p-2 rounded-lg"
            >
                Rooms
            </a>
            <button 
                onClick={handleViewAnalytics} 
                className="flex items-center gap-2 bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-cyan-700 transition duration-200 transform hover:scale-[1.03]"
            >
                <BarChart2 className="w-4 h-4" /> View Analytics
            </button>
          </nav>
        </div>
      </header>
      
      {/* Hero Section - Added for Formal Feel */}
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

      {/* Rooms Section - Refined */}
      <section id="rooms" className="py-16 px-6 lg:px-10">
        <div className="container mx-auto">
          <h3 className="text-4xl font-extrabold text-white text-center mb-16 border-b-2 border-cyan-700/50 pb-4 tracking-wide">
            Available Suites & Rooms
          </h3>
          {loading ? (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>
                <p className="text-center text-gray-400 text-lg ml-4">Fetching luxury accommodations...</p>
            </div>
          ) : rooms.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">No rooms are currently available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {rooms.map((room) => (
                <div key={room.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-7 shadow-2xl transition-all duration-500 hover:shadow-cyan-500/30 hover:scale-[1.02] flex flex-col">
                  <div className="flex flex-col flex-1">
                    <h4 className="text-3xl font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">{room.name}</h4>
                    <p className="text-gray-300 text-sm mb-6 flex-1 leading-relaxed">{room.description}</p>
                    
                    {/* Metric Card Placement */}
                    <RoomMetricCard 
                        title="Current Price (Per Night)" 
                        value={`₱${room.price.toLocaleString()}`} 
                        color="bg-emerald-700/90"
                        icon={<DollarSign className="w-6 h-6 text-white" />}
                    />
                    
                    <p className="text-xs text-gray-500 mt-2">
                        Added: {new Date(room.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-700">
                      <button 
                          onClick={() => handleBookNow(room.id)} 
                          className="flex-1 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-700 transform transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2"
                      >
                          <CalendarCheck className="w-5 h-5"/> Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer - Added for Formal Structure */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Hotel LuxStay Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
}