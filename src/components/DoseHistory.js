import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DoseHistory() {
  const [user] = useAuthState(auth);
  const [doses, setDoses] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterMed, setFilterMed] = useState("");

  // Helper to get user display name or fallback to email
  const userName = user?.displayName || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "";

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

  // Filtering
  const filteredDoses = doses.filter((dose) => {
    let match = true;
    if (filterDate) match = match && dose.date === filterDate;
    if (filterMed) match = match && dose.medicineId === filterMed;
    return match;
  });

  const getMedName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? `${med.name} (${med.dose})` : "Unknown";
  };

  // Helper to determine status
  const getStatus = (dose) => {
    if (dose.taken) return { label: "Taken", color: "text-green-600" };
    const now = new Date();
    const doseDateTime = new Date(`${dose.date}T${dose.time}`);
    if (dose.frequency === 'Weekly' && dose.repeatUntil) {
      const repeatUntilDate = new Date(dose.repeatUntil);
      if (doseDateTime < now && repeatUntilDate > now) {
        // Scheduled time is past, but repeatUntil is in the future
        return { label: "Upcoming", color: "text-blue-600" };
      }
      if (doseDateTime < now && repeatUntilDate < now) {
        // Both scheduled time and repeatUntil are past
        return { label: "Missed", color: "text-red-500" };
      }
    }
    if (doseDateTime > now) {
      // Scheduled time is in the future
      return { label: "Upcoming", color: "text-blue-600" };
    }
    // Scheduled time is in the past and not taken
    return { label: "Missed", color: "text-red-500" };
  };

  // PDF download handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Name: ${userName}`, 14, 14);
    doc.text(`Email: ${userEmail}`, 14, 22);
    doc.setFontSize(16);
    doc.text("Dose History", 14, 32);
    const headers = [["Medicine", "Date", "Time", "Frequency", "Status"]];
    const rows = filteredDoses.map(dose => [
      getMedName(dose.medicineId),
      dose.date,
      dose.time,
      dose.frequency,
      getStatus(dose).label
    ]);
    autoTable(doc, {
      startY: 38,
      head: headers,
      body: rows,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [33, 150, 243] },
    });
    doc.save(`${userName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user'}-dose-history.pdf`);
  };

  if (!user) return <p className="p-4">Please log in to view your dose history.</p>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-green-100 flex flex-col items-center pt-8 pb-8 px-2">
      <div className="w-full max-w-4xl mx-auto bg-white/80 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <div>
            <div className="text-lg font-semibold text-blue-700 break-all">{userName}</div>
            <div className="text-sm text-gray-600 break-all">{userEmail}</div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-4 sm:mb-6 text-center">Dose History</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 justify-center items-stretch sm:items-end w-full">
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm w-full"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700 mb-1">Filter by Medicine</label>
            <select
              className="border border-blue-300 rounded-md py-2 px-3 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm w-full"
              value={filterMed}
              onChange={e => setFilterMed(e.target.value)}
            >
              <option value="">All Medicines</option>
              {medicines.map((med) => (
                <option key={med.id} value={med.id}>{med.name} ({med.dose})</option>
              ))}
            </select>
          </div>
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 text-sm mt-2 sm:mt-0"
            onClick={handleDownloadPDF}
            disabled={filteredDoses.length === 0}
          >
            Download PDF
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-[600px] w-full bg-white rounded-lg shadow text-sm">
            <thead>
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700">Medicine</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700">Date</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700">Time</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700">Frequency</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">No doses found.</td>
                </tr>
              ) : (
                filteredDoses.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1)).map((dose) => (
                  <tr key={dose.id} className="border-b last:border-0">
                    <td className="px-2 sm:px-4 py-2 text-sm break-all">{getMedName(dose.medicineId)}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm">{dose.date}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm">{dose.time}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm">{dose.frequency}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm">
                      {(() => {
                        const status = getStatus(dose);
                        return <span className={`${status.color} font-semibold`}>{status.label}</span>;
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
