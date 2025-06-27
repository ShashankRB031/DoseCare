import React, { useEffect, useState, useRef } from "react";
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
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function MedicineAndSchedule() {
  const [user] = useAuthState(auth);

  // Medicines
  const [medicines, setMedicines] = useState([]);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDose, setEditDose] = useState("");

  // Doses
  const [selectedMed, setSelectedMed] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("Once");
  const [howMany, setHowMany] = useState("");
  const [doseMg, setDoseMg] = useState("");
  const [doses, setDoses] = useState([]);

  // Edit states
  const [editDoseId, setEditDoseId] = useState(null);
  const [editDoseFields, setEditDoseFields] = useState({});

  const audioRef = useRef(null);
  const [dueDose, setDueDose] = useState(null);
  const [soundInterval, setSoundInterval] = useState(null);

  // Add a new state to track if editing a dose
  const [editingDoseId, setEditingDoseId] = useState(null);

  // Add state for repeatUntil
  const [repeatUntil, setRepeatUntil] = useState("");

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

  useEffect(() => {
    if (!doses.length) return;
    const interval = setInterval(() => {
      const now = new Date();
      const due = doses.find(dose => {
        if (dose.taken) return false;
        const doseTime = new Date(`${dose.date}T${dose.time}`);
        // Only trigger if now >= doseTime and not before
        return now >= doseTime && now - doseTime < 60000; // within 1 min after scheduled time
      });
      setDueDose(due || null); // Always clear if no due dose
    }, 10000); // check every 10 seconds
    return () => clearInterval(interval);
  }, [doses]);

  useEffect(() => {
    if (dueDose && audioRef.current) {
      // Try to play, and if blocked, show a message
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.log("Audio play error:", e);
        // Optionally, show a message to the user: "Click anywhere to enable sound"
      });
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

  // Medicine handlers
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

  const handleDeleteMedicine = async (id) => {
    await deleteDoc(doc(db, "medicines", id));
  };

  const handleEditMedicine = (med) => {
    setEditId(med.id);
    setEditName(med.name);
    setEditDose(med.dose);
  };

  const handleSaveMedicine = async (id) => {
    await updateDoc(doc(db, "medicines", id), {
      name: editName,
      dose: editDose,
    });
    setEditId(null);
    setEditName("");
    setEditDose("");
  };

  // Dose handlers
  const handleAddOrUpdateDose = async (e) => {
    e.preventDefault();
    if (!selectedMed || !date || !time || !frequency || !howMany || !doseMg) return;
    if (editingDoseId) {
      // Update existing dose
      await updateDoc(doc(db, "doses", editingDoseId), {
        medicineId: selectedMed,
        userId: user.uid,
        date,
        time,
        frequency,
        howMany,
        doseMg,
      });
      setEditingDoseId(null);
    } else {
      // Add new dose
      await addDoc(collection(db, "doses"), {
        medicineId: selectedMed,
        userId: user.uid,
        date,
        time,
        frequency,
        howMany,
        doseMg,
        taken: false,
        created: Date.now(),
      });
    }
    setSelectedMed("");
    setDate("");
    setTime("");
    setFrequency("Once");
    setHowMany("");
    setDoseMg("");
    setRepeatUntil("");
  };

  const handleDeleteDose = async (id) => {
    await deleteDoc(doc(db, "doses", id));
  };

  const handleMarkTaken = async (id, taken) => {
    await updateDoc(doc(db, "doses", id), { taken: !taken });
  };

  const getMedName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? `${med.name} (${med.dose})` : "Unknown";
  };

  // Add a cancel edit function
  const handleCancelEditDose = () => {
    setEditingDoseId(null);
    setSelectedMed("");
    setDate("");
    setTime("");
    setFrequency("Once");
    setHowMany("");
    setDoseMg("");
    setRepeatUntil("");
  };

  if (!user) return <p className="p-4">Please log in to manage medicines and doses.</p>;

  return (
    <div className="relative min-h-screen w-full p-0 m-0 bg-gradient-to-br from-blue-100 via-white to-green-100 pt-16">
      <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-teal-400 via-40% to-purple-500 bg-clip-text text-transparent text-center mb-6 tracking-tight drop-shadow-lg select-none">
        Medicine & Schedule
      </h1>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
        {/* Medicines List & Add */}
        <div className="bg-white/70 backdrop-blur-lg rounded-lg shadow-lg p-4 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-blue-700 mb-2 tracking-tight">Your Medicines</h2>
          <form onSubmit={handleAddMedicine} className="flex gap-2 mb-2">
            <input
              className="border border-blue-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/80 text-sm"
              placeholder="Medicine name (e.g. Dolo 650)"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
            />
            <input
              className="border border-blue-300 rounded-md p-2 w-20 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/80 text-sm"
              placeholder="Dosage (e.g. 500mg)"
              value={medDosage}
              onChange={(e) => setMedDosage(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white px-3 py-2 rounded-md font-semibold shadow transition-all duration-200 hover:scale-102 text-sm"
              type="submit"
            >
              Add
            </button>
          </form>
          <ul className="space-y-2">
            {medicines.length === 0 && <li className="text-gray-500 text-sm">No medicines added yet.</li>}
            {medicines.map((med) => (
              <li key={med.id} className="flex items-center bg-gradient-to-r from-blue-100 to-green-100 rounded-md p-2 shadow border border-blue-100 min-h-0">
                {editId === med.id ? (
                  <>
                    <input
                      className="border border-blue-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/80 text-sm"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <input
                      className="border border-blue-300 rounded-md p-2 w-20 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/80 text-sm"
                      value={editDose}
                      onChange={e => setEditDose(e.target.value)}
                    />
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold"
                      onClick={() => handleSaveMedicine(med.id)}
                    >Save</button>
                    <button
                      className="bg-gray-400 text-white px-2 py-1 rounded text-xs font-semibold"
                      onClick={() => setEditId(null)}
                    >Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="font-semibold text-blue-700 truncate max-w-[110px] md:max-w-[150px] text-sm" title={med.name}>{med.name}</span>
                      <span className="text-gray-600 text-sm">{med.dose}</span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold"
                        onClick={() => handleEditMedicine(med)}
                      >Edit</button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold"
                        onClick={() => handleDeleteMedicine(med.id)}
                      >Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Schedule Dose & List */}
        <div className="bg-white/70 backdrop-blur-lg rounded-lg shadow-lg p-4 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-green-700 mb-2 tracking-tight">Schedule a Dose</h2>
          <form onSubmit={handleAddOrUpdateDose} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Medicine</label>
                <select
                  className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  value={selectedMed}
                  onChange={e => setSelectedMed(e.target.value)}
                  required
                >
                  <option value="">e.g. Dolo 650mg</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} ({med.dose})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">How Many Tablets</label>
                <input
                  className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  value={howMany || ""}
                  onChange={e => setHowMany(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Date</label>
              <input
                className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Time</label>
              <input
                className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                >
                  <option value="Once">Once</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Dose (mg)</label>
                <input
                  className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  type="text"
                  placeholder="e.g. 500mg"
                  value={doseMg || ""}
                  onChange={e => setDoseMg(e.target.value)}
                  required
                />
              </div>
            </div>
            {(["Daily", "Weekly"].includes(frequency)) && (
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Repeat Until</label>
                <input
                  className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  type="date"
                  value={repeatUntil}
                  onChange={e => setRepeatUntil(e.target.value)}
                  required
                />
              </div>
            )}
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-200 mt-2 text-sm"
              type="submit"
            >
              {editingDoseId ? "Update Dose" : "Schedule Dose"}
            </button>
            {editingDoseId && (
              <button
                type="button"
                className="w-full bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 mt-2 text-sm"
                onClick={handleCancelEditDose}
              >
                Cancel
              </button>
            )}
          </form>
          <h2 className="text-base font-bold text-blue-700 mt-5 mb-2">Scheduled Doses</h2>
          <div className="space-y-2">
            {doses.length === 0 ? (
              <p className="text-gray-500 text-sm">No doses scheduled yet.</p>
            ) : (
              doses.map((dose) => (
                <div key={dose.id} className="bg-gradient-to-r from-blue-100 to-green-100 rounded-md p-2 shadow border border-blue-100 min-h-0 mb-2">
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <span className="font-semibold text-blue-700 truncate max-w-[110px] md:max-w-[150px] text-sm" title={getMedName(dose.medicineId)}>{getMedName(dose.medicineId)}</span>
                    <span className="text-gray-700 text-sm">{dose.date} {dose.time}</span>
                    <span className="text-blue-700 text-sm">{dose.frequency}</span>
                    <span className="text-gray-700 text-sm">{dose.howMany} tab(s)</span>
                    <span className="text-gray-700 text-sm">{dose.doseMg}</span>
                    {dose.taken && <span className="text-green-600 font-semibold text-sm">Taken</span>}
                  </div>
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold"
                      onClick={() => {
                        setEditingDoseId(dose.id);
                        setSelectedMed(dose.medicineId);
                        setHowMany(dose.howMany);
                        setDoseMg(dose.doseMg);
                        setDate(dose.date);
                        setTime(dose.time);
                        setFrequency(dose.frequency);
                      }}
                    >Edit</button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold"
                      onClick={() => handleDeleteDose(dose.id)}
                    >Delete</button>
                    <button
                      className={dose.taken
                        ? "bg-gray-400 text-white px-2 py-1 rounded text-xs font-semibold"
                        : "bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold"
                      }
                      style={{ pointerEvents: 'auto' }}
                      onClick={() => handleMarkTaken(dose.id, dose.taken)}
                    >
                      {dose.taken ? "Undo" : "Taken"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={require('../assets/notification.mp3')} />
      {dueDose && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-200 border border-yellow-400 text-yellow-900 px-5 py-3 rounded shadow-lg z-50 flex items-center gap-3 text-sm">
          <span>
            <b>Time to take:</b> {getMedName(dueDose.medicineId)} at {dueDose.time}
          </span>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded text-xs"
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
            className="bg-gray-300 px-3 py-1 rounded text-xs"
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
  );
}