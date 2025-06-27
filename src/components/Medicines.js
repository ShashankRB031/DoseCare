import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Medicines() {
  const [user] = useAuthState(auth);
  const [medicines, setMedicines] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDose, setEditDose] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "medicines"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setMedicines(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "medicines", id));
  };

  const handleEdit = (med) => {
    setEditId(med.id);
    setEditName(med.name);
    setEditDose(med.dose);
  };

  const handleSave = async (id) => {
    await updateDoc(doc(db, "medicines", id), {
      name: editName,
      dose: editDose,
    });
    setEditId(null);
    setEditName("");
    setEditDose("");
  };

  if (!user) return <p className="p-4">Please log in to view your medicines.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Your Medicines</h2>
      {medicines.length === 0 ? (
        <p className="text-gray-500">No medicines added yet.</p>
      ) : (
        <ul className="space-y-3">
          {medicines.map((med) => (
            <li key={med.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3 shadow">
              {editId === med.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    className="border border-gray-300 rounded-lg p-1"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                  <input
                    className="border border-gray-300 rounded-lg p-1 w-24"
                    value={editDose}
                    onChange={e => setEditDose(e.target.value)}
                  />
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-2 rounded-lg transition"
                    onClick={() => handleSave(med.id)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 px-2 rounded-lg transition"
                    onClick={() => setEditId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="font-semibold">{med.name}</span>
                    <span className="ml-2 text-blue-700">({med.dose})</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 rounded-lg transition"
                      onClick={() => handleEdit(med)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-2 rounded-lg transition"
                      onClick={() => handleDelete(med.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}