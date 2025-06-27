import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import notificationSound from '../assets/notification.mp3'; // Place a sound file in src/assets

export default function MedicineDoseManager() {
  const [user] = useAuthState(auth);

  // Medicine form
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");

  // Dose form
  const [selectedMed, setSelectedMed] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("Once");

  // Data
  const [medicines, setMedicines] = useState([]);
  const [doses, setDoses] = useState([]);
  const [editDoseId, setEditDoseId] = useState(null);
  const [editDose, setEditDose] = useState({});
  const [dueDose, setDueDose] = useState(null);
  const audioRef = useRef(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundInterval, setSoundInterval] = useState(null);

  // Fetch medicines
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "medicines"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setMedicines(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  // Fetch doses
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "doses"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setDoses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  // Fetch notification preference
  useEffect(() => {
    if (!user) return;
    const fetchPref = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().notificationsEnabled !== undefined) {
        setNotificationsEnabled(snap.data().notificationsEnabled);
      }
    };
    fetchPref();
  }, [user]);

  // Add medicine
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!medName || !medDosage) return;
    await addDoc(collection(db, "medicines"), {
      name: medName,
      dose: medDosage,
      uid: user.uid,
      created: Date.now(),
    });
    setMedName("");
    setMedDosage("");
  };

  // Add dose
  const handleAddDose = async (e) => {
    e.preventDefault();
    if (!selectedMed || !date || !time || !frequency) return;
    await addDoc(collection(db, "doses"), {
      medicineId: selectedMed,
      userId: user.uid,
      date,
      time,
      frequency,
      taken: false,
      created: Date.now(),
    });
    setSelectedMed("");
    setDate("");
    setTime("");
    setFrequency("Once");
  };

  // Edit dose
  const handleEditDose = async (id) => {
    const original = doses.find(d => d.id === id);
    if (!original) {
      alert("Original dose not found!");
      return;
    }
    const updated = {
      medicineId: editDose.medicineId || original.medicineId,
      date: editDose.date || original.date,
      time: editDose.time || original.time,
      frequency: editDose.frequency || original.frequency,
      taken: original.taken ?? false,
      userId: original.userId,
      created: original.created,
    };
    console.log("Updating dose:", updated);
    try {
      await updateDoc(doc(db, "doses", id), updated);
      setEditDoseId(null);
      setEditDose({});
    } catch (err) {
      alert("Error updating dose: " + err.message);
      console.error(err);
    }
  };

  // Delete dose
  const handleDeleteDose = async (id) => {
    await deleteDoc(doc(db, "doses", id));
  };

  // Mark as taken
  const handleMarkTaken = async (id, taken) => {
    await updateDoc(doc(db, "doses", id), { taken: !taken });
  };

  // Get medicine name by id
  const getMedName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? `${med.name} (${med.dose})` : "Unknown";
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!doses.length || !notificationsEnabled) {
      setDueDose(null);
      return;
    }
    const interval = setInterval(() => {
      const now = new Date();
      const due = doses.find(dose => {
        if (dose.taken) return false;
        const doseTime = new Date(`${dose.date}T${dose.time}`);
        // Only trigger if now >= doseTime and not before
        return now >= doseTime && now - doseTime < 60000; // within 1 min after scheduled time
      });
      setDueDose(due || null);
    }, 10000);
    return () => clearInterval(interval);
  }, [doses, notificationsEnabled]);

  useEffect(() => {
    if (dueDose && audioRef.current) {
      // Play immediately
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      // Start interval to repeat sound every 3 seconds
      if (!soundInterval) {
        const interval = setInterval(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }, 3000);
        setSoundInterval(interval);
      }
    } else {
      // Stop sound and clear interval
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (soundInterval) {
        clearInterval(soundInterval);
        setSoundInterval(null);
      }
    }
    // Cleanup on unmount
    return () => {
      if (soundInterval) {
        clearInterval(soundInterval);
        setSoundInterval(null);
      }
    };
  }, [dueDose]);

  if (!user) return <p className="p-4">Please log in to manage medicines and doses.</p>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-green-100 flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-3xl mx-auto bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/40 p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-green-500 to-teal-400 bg-clip-text text-transparent text-center mb-6 tracking-tight drop-shadow-sm select-none">
          Medicine & Schedule
        </h1>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-teal-400 to-green-400 bg-clip-text text-transparent text-center mb-8 tracking-tight drop-shadow select-none">
          Medicine Dose Management
        </h1>
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 via-teal-500 to-green-500 bg-clip-text text-transparent mb-4 mt-2">Add Medicine</h2>
        <form onSubmit={handleAddMedicine} className="flex flex-col md:flex-row gap-2 mb-8">
          <input
            className="border border-blue-200 rounded-lg p-3 flex-1 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
            placeholder="Tablet name"
            value={medName}
            onChange={e => setMedName(e.target.value)}
          />
          <input
            className="border border-blue-200 rounded-lg p-3 w-32 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
            placeholder="Dosage"
            value={medDosage}
            onChange={e => setMedDosage(e.target.value)}
          />
          <button className="bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white px-5 py-2 rounded-lg font-semibold shadow transition-all duration-200 hover:scale-105 text-sm" type="submit">
            Add
          </button>
        </form>
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 via-teal-500 to-green-500 bg-clip-text text-transparent mb-4 mt-2">Schedule a Dose</h2>
        <form onSubmit={handleAddDose} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <select
            className="border border-blue-200 rounded-lg p-3 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm col-span-1"
            value={selectedMed}
            onChange={e => setSelectedMed(e.target.value)}
            required
          >
            <option value="">Select Medicine</option>
            {medicines.map(med => (
              <option key={med.id} value={med.id}>{med.name} ({med.dose})</option>
            ))}
          </select>
          <select
            className="border border-blue-200 rounded-lg p-3 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm col-span-1"
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
          >
            <option value="Once">Once</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
          <input
            className="border border-blue-200 rounded-lg p-3 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm col-span-1"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <input
            className="border border-blue-200 rounded-lg p-3 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm col-span-1"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
          />
          <button className="col-span-1 md:col-span-2 w-full bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-200 mt-2 text-sm" type="submit">
            Schedule Dose
          </button>
        </form>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-teal-400 to-green-400 bg-clip-text text-transparent text-center mb-10 tracking-tight drop-shadow select-none">
          Scheduled Doses
        </h2>
        <ul className="space-y-4">
          {doses.map(dose => (
            <li key={dose.id} className="p-4 bg-white/70 backdrop-blur rounded-xl shadow border border-blue-100 flex flex-col md:flex-row md:items-center gap-3">
              {editDoseId === dose.id ? (
                <>
                  <select
                    className="border border-blue-200 rounded-lg p-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    value={editDose.medicineId}
                    onChange={e => setEditDose({ ...editDose, medicineId: e.target.value })}
                  >
                    {medicines.map(med => (
                      <option key={med.id} value={med.id}>{med.name} ({med.dose})</option>
                    ))}
                  </select>
                  <input
                    className="border border-blue-200 rounded-lg p-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    type="date"
                    value={editDose.date}
                    onChange={e => setEditDose({ ...editDose, date: e.target.value })}
                  />
                  <input
                    className="border border-blue-200 rounded-lg p-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    type="time"
                    value={editDose.time}
                    onChange={e => setEditDose({ ...editDose, time: e.target.value })}
                  />
                  <select
                    className="border border-blue-200 rounded-lg p-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    value={editDose.frequency}
                    onChange={e => setEditDose({ ...editDose, frequency: e.target.value })}
                  >
                    <option value="Once">Once</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg font-semibold shadow transition"
                    onClick={e => { e.preventDefault(); handleEditDose(dose.id); }}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded-lg shadow transition"
                    onClick={() => setEditDoseId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-semibold text-blue-700 truncate max-w-[120px] md:max-w-[180px] text-sm" title={getMedName(dose.medicineId)}>{getMedName(dose.medicineId)}</span>
                    <span className="text-gray-700 text-sm">{dose.date} {dose.time}</span>
                    <span className="text-blue-700 text-sm">{dose.frequency}</span>
                    {dose.taken && <span className="text-green-600 font-semibold text-sm">Taken</span>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg font-semibold shadow transition"
                      onClick={() => {
                        setEditDoseId(dose.id);
                        setEditDose({
                          medicineId: dose.medicineId,
                          date: dose.date,
                          time: dose.time,
                          frequency: dose.frequency,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold shadow transition"
                      onClick={() => handleDeleteDose(dose.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`${dose.taken ? "bg-gray-400 hover:bg-gray-500" : "bg-green-500 hover:bg-green-600"} text-white px-3 py-1 rounded-lg font-semibold shadow transition`}
                      onClick={() => handleMarkTaken(dose.id, dose.taken)}
                    >
                      {dose.taken ? "Undo" : "Taken"}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
          {doses.length === 0 && <li className="text-gray-500 text-center">No doses scheduled.</li>}
        </ul>
        <audio ref={audioRef} src={notificationSound} />
        {dueDose && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100/90 backdrop-blur border border-yellow-300 text-yellow-900 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-4">
            <span>
              <b>Time to take:</b> {getMedName(dueDose.medicineId)} at {dueDose.time}
            </span>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg font-semibold shadow transition"
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
                // Clear the due dose immediately
                setDueDose(null);
                // Then update the dose in database
                await handleMarkTaken(dueDose.id, false);
              }}
            >
              Mark as Taken
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 px-4 py-1 rounded-lg shadow transition"
              onClick={() => {
                // Stop sound immediately first
                if (soundInterval) {
                  clearInterval(soundInterval);
                  setSoundInterval(null);
                }
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                // Then clear the due dose
                setDueDose(null);
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}