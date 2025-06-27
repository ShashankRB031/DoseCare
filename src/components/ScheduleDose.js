import React, { useState, useEffect } from "react";
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
  const [howMany, setHowMany] = useState("");
  const [doseMg, setDoseMg] = useState("");

  // Data
  const [medicines, setMedicines] = useState([]);
  const [doses, setDoses] = useState([]);
  const [editDoseId, setEditDoseId] = useState(null);
  const [editDose, setEditDose] = useState({});

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
    if (!selectedMed || !date || !time || !frequency || !howMany || !doseMg) return;
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
    setSelectedMed("");
    setDate("");
    setTime("");
    setFrequency("Once");
    setHowMany("");
    setDoseMg("");
  };

  // Edit dose
  const handleEditDose = async (id) => {
    await updateDoc(doc(db, "doses", id), editDose);
    setEditDoseId(null);
    setEditDose({});
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

  if (!user) return <p className="p-4">Please log in to manage medicines and doses.</p>;

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Add Medicine</h2>
      <form onSubmit={handleAddMedicine} className="flex gap-2 mb-8">
        <input
          className="border border-gray-300 rounded-lg p-2 flex-1"
          placeholder="Medicine name (e.g. Dolo 650)"
          value={medName}
          onChange={(e) => setMedName(e.target.value)}
        />
        <input
          className="border border-gray-300 rounded-lg p-2 w-32"
          placeholder="Dosage (e.g. 500mg)"
          value={medDosage}
          onChange={(e) => setMedDosage(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition"
          type="submit"
        >
          Add
        </button>
      </form>

      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4 mt-6">Schedule a Dose</h2>
        <form onSubmit={handleAddDose} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Select Medicine */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Select Medicine</label>
            <select
              className="border border-gray-300 rounded-lg p-2"
              value={selectedMed}
              onChange={e => setSelectedMed(e.target.value)}
              required
            >
              <option value="">e.g. Dolo 650mg</option>
              {medicines.map(med => (
                <option key={med.id} value={med.id}>{med.name} ({med.dose})</option>
              ))}
            </select>
          </div>
          {/* How Many Tablets */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">How Many Tablets</label>
            <input
              className="border border-gray-300 rounded-lg p-2"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={howMany || ""}
              onChange={e => setHowMany(e.target.value)}
              required
            />
          </div>
          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              className="border border-gray-300 rounded-lg p-2"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          {/* Time */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              className="border border-gray-300 rounded-lg p-2"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
            />
          </div>
          {/* Frequency */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              className="border border-gray-300 rounded-lg p-2"
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
            >
              <option value="Once">Once</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          {/* Dose (mg) */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Dose (mg)</label>
            <input
              className="border border-gray-300 rounded-lg p-2"
              type="text"
              placeholder="e.g. 500mg"
              value={doseMg || ""}
              onChange={e => setDoseMg(e.target.value)}
              required
            />
          </div>
          {/* Submit Button (full width) */}
          <div className="md:col-span-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-lg transition" type="submit">
              Schedule Dose
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-bold text-blue-700 mb-6">Scheduled Doses</h2>
      <div className="space-y-3">
        {doses.length === 0 ? (
          <p className="text-gray-500">No doses scheduled yet.</p>
        ) : (
          doses.map((dose) => (
            <div
              key={dose.id}
              className={`p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                dose.taken ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              {editDoseId === dose.id ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <select
                    className="border border-gray-300 rounded-lg p-2"
                    value={editDose.medicineId}
                    onChange={(e) =>
                      setEditDose({ ...editDose, medicineId: e.target.value })
                    }
                  >
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.dose})
                      </option>
                    ))}
                  </select>
                  <input
                    className="border border-gray-300 rounded-lg p-2"
                    type="date"
                    value={editDose.date}
                    onChange={(e) =>
                      setEditDose({ ...editDose, date: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <input
                      className="border border-gray-300 rounded-lg p-2 flex-1"
                      type="time"
                      value={editDose.time}
                      onChange={(e) =>
                        setEditDose({ ...editDose, time: e.target.value })
                      }
                    />
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 rounded-lg transition"
                      onClick={() => handleEditDose(dose.id)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-300 hover:bg-gray-400 px-3 rounded-lg transition"
                      onClick={() => setEditDoseId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {getMedName(dose.medicineId)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {dose.howMany} tablet{dose.howMany > 1 ? "s" : ""} ({dose.doseMg}) • {dose.date} at {dose.time} • {dose.frequency}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition text-sm"
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
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition text-sm"
                      onClick={() => handleDeleteDose(dose.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`${
                        dose.taken
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white px-3 py-1 rounded-lg transition text-sm`}
                      onClick={() => handleMarkTaken(dose.id, dose.taken)}
                    >
                      {dose.taken ? "Undo" : "Mark Taken"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}