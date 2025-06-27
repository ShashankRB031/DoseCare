import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import notificationSound from "../assets/notification.mp3";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ScheduledDoses() {
  const [user] = useAuthState(auth);
  const [doses, setDoses] = useState([]);
  const [medicines, setMedicines] = useState({});
  const [dueDose, setDueDose] = useState(null);
  const audioRef = useRef(null);
  const [soundInterval, setSoundInterval] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "doses"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, async (snapshot) => {
      const doseList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoses(doseList);

      const medIds = [...new Set(doseList.map((d) => d.medicineId))];
      const meds = {};
      for (let id of medIds) {
        const medRef = doc(db, "medicines", id);
        const medSnap = await getDoc(medRef);
        if (medSnap.exists()) meds[id] = medSnap.data();
      }
      setMedicines(meds);
    });
    return unsub;
  }, [user]);

  const getMedName = (id) => medicines[id]?.name || "Medicine";
  const getMedDose = (id) => medicines[id]?.dose || "";

  const handleMarkTaken = async (id) => {
    await updateDoc(doc(db, "doses", id), { taken: true });
  };

  const now = new Date();
  const dueDoses = doses.filter((dose) => {
    if (dose.taken) return false;
    const doseTime = new Date(`${dose.date}T${dose.time}`);
    return now >= doseTime && now - doseTime < 60000;
  });
  const upcomingDoses = doses.filter((dose) => {
    if (dose.taken) return false;
    const doseTime = new Date(`${dose.date}T${dose.time}`);
    return doseTime > now && Math.abs(now - doseTime) >= 60000;
  });
  const takenDoses = doses.filter((dose) => dose.taken);

  const totalDoses = doses.length;
  const takenCount = takenDoses.length;
  const upcomingCount = upcomingDoses.length;
  const dueCount = dueDoses.length;
  const missedCount = doses.filter((dose) => {
    if (dose.taken) return false;
    const doseTime = new Date(`${dose.date}T${dose.time}`);
    return doseTime < now && Math.abs(now - doseTime) > 60000;
  }).length;

  const chartData = [
    { name: "Taken", value: takenCount },
    { name: "Upcoming", value: upcomingCount },
    { name: "Due", value: dueCount },
    { name: "Missed", value: missedCount },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#f59e42", "#ef4444"];

  useEffect(() => {
    if (dueDose && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.log("Audio play error:", e);
      });
      if (!soundInterval) {
        const interval = setInterval(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((e) => {
              console.log("Audio play error:", e);
            });
          }
        }, 3000);
        setSoundInterval(interval);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (soundInterval) {
        clearInterval(soundInterval);
        setSoundInterval(null);
      }
    }
    return () => {
      if (soundInterval) {
        clearInterval(soundInterval);
        setSoundInterval(null);
      }
    };
  }, [dueDose]);

  if (!user) return <p className="p-4">Please log in to view scheduled doses.</p>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-green-100 flex flex-col items-center justify-start pt-8 pb-8 px-2">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-teal-400 to-green-400 bg-clip-text text-transparent text-center mb-10 tracking-tight drop-shadow select-none">
          Scheduled Doses
        </h2>
        {/* Chart + Stat Boxes Row */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full mb-10">
          {/* Chart */}
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-xl border border-blue-100 p-6 w-full max-w-[340px] flex flex-col justify-center">
            <h3 className="text-lg font-bold text-center mb-3 bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">Dose Status Chart</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-5 w-full lg:w-[480px]">
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur border border-blue-200 rounded-xl p-5 shadow-xl h-[135px]">
              <ClockIcon className="h-8 w-8 text-blue-500 opacity-90" />
              <div>
                <div className="text-3xl font-bold text-blue-700">{totalDoses}</div>
                <div className="text-base font-semibold text-blue-500/80">Total Doses</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur border border-green-200 rounded-xl p-5 shadow-xl h-[135px]">
              <CheckCircleIcon className="h-8 w-8 text-green-500 opacity-90" />
              <div>
                <div className="text-3xl font-bold text-green-700">{takenCount}</div>
                <div className="text-base font-semibold text-green-500/80">Doses Taken</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur border border-yellow-200 rounded-xl p-5 shadow-xl h-[135px]">
              <ClockIcon className="h-8 w-8 text-yellow-500 opacity-90" />
              <div>
                <div className="text-3xl font-bold text-yellow-600">{upcomingCount}</div>
                <div className="text-base font-semibold text-yellow-500/80">Upcoming Doses</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur border border-pink-200 rounded-xl p-5 shadow-xl h-[135px]">
              <XCircleIcon className="h-8 w-8 text-pink-500 opacity-90" />
              <div>
                <div className="text-3xl font-bold text-pink-600">{missedCount}</div>
                <div className="text-base font-semibold text-pink-500/80">Missed Doses</div>
              </div>
            </div>
          </div>
        </div>
        {/* Dose Cards */}
        <div className="flex flex-col md:flex-row gap-y-6 md:gap-y-0 md:gap-x-6 w-full justify-center">
          {/* Taken */}
          <section className="flex-1 flex flex-col items-center bg-green-50/70 backdrop-blur border-t-4 border-green-400 rounded-2xl shadow-lg p-5 h-[340px] min-w-[220px] max-w-[300px] mx-auto">
            <h3 className="text-lg font-bold text-green-600 mb-2">Taken Doses</h3>
            <ul className="flex-1 w-full overflow-y-auto">
              {takenDoses.length === 0 && (
                <p className="text-gray-500">No taken doses.</p>
              )}
              {takenDoses.map((dose) => (
                <li
                  key={dose.id}
                  className="mb-4 p-3 bg-white/80 backdrop-blur rounded-xl shadow flex flex-col gap-1 border border-green-200"
                >
                  <span className="font-semibold text-base text-green-700">
                    {getMedName(dose.medicineId)}{" "}
                    {getMedDose(dose.medicineId) && (
                      <span className="text-gray-500">
                        ({getMedDose(dose.medicineId)})
                      </span>
                    )}
                  </span>
                  <div className="flex justify-between text-xs">
                    <span>Date: <b>{dose.date}</b></span>
                    <span>Time: <b>{dose.time}</b></span>
                  </div>
                  <span className="text-xs">Frequency: {dose.frequency}</span>
                  <span className="text-green-700 font-bold mt-1 text-xs">Taken</span>
                </li>
              ))}
            </ul>
          </section>
          {/* Upcoming */}
          <section className="flex-1 flex flex-col items-center bg-blue-50/70 backdrop-blur border-t-4 border-blue-400 rounded-2xl shadow-lg p-5 h-[340px] min-w-[220px] max-w-[300px] mx-auto">
            <h3 className="text-lg font-bold text-blue-600 mb-2">Upcoming Doses</h3>
            <ul className="flex-1 w-full overflow-y-auto">
              {upcomingDoses.length === 0 && (
                <p className="text-gray-500">No upcoming doses.</p>
              )}
              {upcomingDoses.map((dose) => (
                <li
                  key={dose.id}
                  className="mb-4 p-3 bg-white/80 backdrop-blur rounded-xl shadow flex flex-col gap-1 border border-blue-200"
                >
                  <span className="font-semibold text-base text-blue-700">
                    {getMedName(dose.medicineId)}{" "}
                    {getMedDose(dose.medicineId) && (
                      <span className="text-gray-500">
                        ({getMedDose(dose.medicineId)})
                      </span>
                    )}
                  </span>
                  <div className="flex justify-between text-xs">
                    <span>Date: <b>{dose.date}</b></span>
                    <span>Time: <b>{dose.time}</b></span>
                  </div>
                  <span className="text-xs">Frequency: {dose.frequency}</span>
                  <button
                    className="mt-2 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-semibold px-3 py-1 rounded-lg shadow transition text-xs"
                    onClick={async () => {
                      // Stop sound immediately first
                      if (soundInterval) {
                        clearInterval(soundInterval);
                        setSoundInterval(null);
                      }
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                      }
                      // Then update the dose
                      await handleMarkTaken(dose.id);
                    }}
                  >
                    Mark as Taken
                  </button>
                </li>
              ))}
            </ul>
          </section>
          {/* Due */}
          <section className="flex-1 flex flex-col items-center bg-red-50/70 backdrop-blur border-t-4 border-red-400 rounded-2xl shadow-lg p-5 h-[340px] min-w-[220px] max-w-[300px] mx-auto">
            <h3 className="text-lg font-bold text-red-600 mb-2">Due Doses</h3>
            <ul className="flex-1 w-full overflow-y-auto">
              {dueDoses.length === 0 && (
                <p className="text-gray-500">No due doses.</p>
              )}
              {dueDoses.map((dose) => (
                <li
                  key={dose.id}
                  className="mb-4 p-3 bg-white/80 backdrop-blur rounded-xl shadow flex flex-col gap-1 border border-red-200"
                >
                  <span className="font-semibold text-base text-red-600">
                    {getMedName(dose.medicineId)}{" "}
                    {getMedDose(dose.medicineId) && (
                      <span className="text-gray-500">
                        ({getMedDose(dose.medicineId)})
                      </span>
                    )}
                  </span>
                  <div className="flex justify-between text-xs">
                    <span>Date: <b>{dose.date}</b></span>
                    <span>Time: <b>{dose.time}</b></span>
                  </div>
                  <span className="text-xs">Frequency: {dose.frequency}</span>
                  <button
                    className="mt-2 bg-gradient-to-r from-green-400 to-red-400 hover:from-green-500 hover:to-red-500 text-white font-semibold px-3 py-1 rounded-lg shadow transition text-xs"
                    onClick={async () => {
                      // Stop sound immediately first
                      if (soundInterval) {
                        clearInterval(soundInterval);
                        setSoundInterval(null);
                      }
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                      }
                      // Then update the dose
                      await handleMarkTaken(dose.id);
                    }}
                  >
                    Mark as Taken
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <audio ref={audioRef} src={notificationSound} />
      </div>
    </div>
  );
}
