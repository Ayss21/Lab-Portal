// src/pages/labdetailspage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Monitor,
  MapPin,
  Users,
  Loader2,
  Edit,
  Trash2,
  CalendarPlus,
} from "lucide-react";
import ApiService from "../services/api.js";
import { useAuth } from "../context/authcontext.jsx"; // Import useAuth
import Toast from "../Components/common/toast.jsx";
import LabFormModal from "../Components/Labs/labformmodal.jsx";
import TimetableFormModal from "../Components/Timetable/TimetableFormModal.jsx";

const LabDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [loadingLab, setLoadingLab] = useState(true);
  const [labError, setLabError] = useState(null); // Corrected: useState(null)

  const [timetable, setTimetable] = useState(null);
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [timetableError, setTimetableError] = useState(null);
  const [showLabEditModal, setShowLabEditModal] = useState(false);
  const [showTimetableEditModal, setShowTimetableEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const { isAdmin } = useAuth(); // Destructure isAdmin from useAuth

  const fetchLabDetails = useCallback(async () => {
    setLoadingLab(true);
    setLabError(null);
    try {
      const data = await ApiService.getLabById(id);
      setLab(data);
    } catch (err) {
      console.error("Failed to fetch lab details:", err);
      setLabError(err.message || "Failed to load lab details.");
    } finally {
      setLoadingLab(false);
    }
  }, [id]);

  const fetchTimetable = useCallback(async () => {
    setLoadingTimetable(true);
    setTimetableError(null);
    try {
      const data = await ApiService.getTimetableByLabId(id);
      // Ensure timetable is an object with a schedule array, even if empty
      setTimetable(data && data.schedule ? data : { labId: id, schedule: [] });
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
      setTimetableError(err.message || "Failed to load timetable.");
      // Set an empty timetable structure if fetching fails (important for rendering)
      setTimetable({ labId: id, schedule: [] });
    } finally {
      setLoadingTimetable(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchLabDetails();
      fetchTimetable();
    }
  }, [id, fetchLabDetails, fetchTimetable]);

  const timeSlots = [
    { period: 1, time: "9:00 - 9:50" },
    { period: 2, time: "9:50 - 10:40" },
    { period: 3, time: "10:55 - 11:45" },
    { period: 4, time: "11:45 - 12:35" },
    { period: 5, time: "1:20 - 2:10" },
    { period: 6, time: "2:10 - 3:00" },
    { period: 7, time: "3:15 - 4:05" },
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getScheduleEntry = useCallback((day, period) => {
    const slotTime = timeSlots.find((s) => s.period === period)?.time;

    // Ensure timetable and timetable.schedule are not null/undefined before accessing
    if (!timetable || !timetable.schedule || !slotTime) {
      return { subject: "Free", faculty: "", class: "" };
    }

    const daySchedule = timetable.schedule.find((s) => s.day === day);
    if (!daySchedule || !daySchedule.timeSlots) {
      return { subject: "Free", faculty: "", class: "" };
    }

    const timeSlot = daySchedule.timeSlots.find((ts) => ts.hour === slotTime);

    return timeSlot
      ? {
          subject: timeSlot.subject || "Free",
          faculty: timeSlot.faculty || "",
          class: timeSlot.class || "",
        }
      : { subject: "Free", faculty: "", class: "" };
  }, [timetable, timeSlots]); // timeSlots should be in dependencies if it can change, but it's static here.

  const handleEditLabDetails = () => {
    setShowLabEditModal(true);
  };

  const handleDeleteLab = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${lab["lab name"]}? This action cannot be undone.`
      )
    ) {
      try {
        // Attempt to delete associated timetable first, but don't block if it fails
        // This is a safety measure; the backend should ideally handle cascade deletion
        if (timetable && timetable._id) {
          await ApiService.deleteTimetable(timetable._id)
            .catch(err => console.warn("Failed to delete associated timetable (may not exist or already deleted):", err.message));
        }

        await ApiService.deleteLab(lab._id);
        setToastMessage({
          type: "success",
          message: `${lab["lab name"]} deleted successfully!`,
        });
        navigate("/labs"); // Navigate back to the labs list after successful deletion
      } catch (err) {
        console.error("Failed to delete lab:", err);
        setToastMessage({
          type: "error",
          message: err.message || "Failed to delete lab.",
        });
      }
    }
  };

  const handleSaveLab = async (updatedLabData) => {
    try {
      await ApiService.updateLab(lab._id, {
        // Ensure you're sending the correct data structure to your API
        // For 'lab name', use the key that your backend expects, which seems to be "lab name"
        "lab name": updatedLabData.labName, // Changed from labName to "lab name" based on common usage
        location: updatedLabData.location,
        capacity: updatedLabData.capacity,
        availableSystem: updatedLabData.availableSystem,
        workingSystem: updatedLabData.workingSystem,
        labType: updatedLabData.labType,
        status: updatedLabData.status,
        incharge: updatedLabData.incharge,
        technician: updatedLabData.technician,
        specifications: updatedLabData.specifications,
        software: updatedLabData.software,
        equipments: updatedLabData.equipments,
        department: updatedLabData.department,
      });
      setToastMessage({
        type: "success",
        message: "Lab details updated successfully!",
      });
      setShowLabEditModal(false);
      fetchLabDetails(); // Re-fetch details to show updated data
    } catch (err) {
      console.error("Failed to update lab details:", err);
      setToastMessage({
        type: "error",
        message: err.message || "Failed to update lab details.",
      });
    }
  };

  const handleEditTimetable = () => {
    setShowTimetableEditModal(true);
  };

  const handleSaveTimetable = async (newScheduleData) => {
    try {
      setLoadingTimetable(true);
      let response;
      if (timetable && timetable._id) {
        // If timetable exists, update it
        response = await ApiService.updateTimetable(timetable._id, { schedule: newScheduleData });
        setToastMessage({
          type: "success",
          message: "Timetable updated successfully!",
        });
      } else {
        // If no timetable exists for this lab, create a new one
        response = await ApiService.createTimetable({
          labId: lab._id,
          labName: lab["lab name"], // Pass lab name for the new timetable
          schedule: newScheduleData,
        });
        setToastMessage({
          type: "success",
          message: "Timetable created successfully!",
        });
      }
      // Update the timetable state with the response, ensuring it's the full timetable object
      setTimetable(response.timetable || response); // Adjust based on your API response structure
      setShowTimetableEditModal(false);
      fetchTimetable(); // Re-fetch timetable to ensure updated data is shown
    } catch (err) {
      console.error("Failed to save timetable:", err);
      setToastMessage({
        type: "error",
        message: err.message || "Failed to save timetable.",
      });
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleDeleteTimetable = async () => {
    if (!timetable || !timetable._id) {
      setToastMessage({ type: "info", message: "No timetable to delete." });
      return;
    }

    if (window.confirm("Are you sure you want to delete this timetable? This action cannot be undone.")) {
      try {
        setLoadingTimetable(true);
        await ApiService.deleteTimetable(timetable._id);
        setTimetable({ labId: id, schedule: [] }); // Reset timetable state to empty schedule
        setShowTimetableEditModal(false);
        setToastMessage({ type: "success", message: "Timetable deleted successfully!" });
      } catch (err) {
        console.error("Failed to delete timetable:", err);
        setToastMessage({ type: "error", message: err.message || "Failed to delete timetable." });
      } finally {
        setLoadingTimetable(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Occupied":
        return "bg-red-100 text-red-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Conditional Rendering for Loading/Error/No Lab Found ---
  if (loadingLab || loadingTimetable) {
    return (
      <div className="min-h-screen bg-gray-50 pt-30 font-inter flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-gray-600 ml-3">Loading lab and timetable details...</p>
      </div>
    );
  }

  if (labError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-30 font-inter flex flex-col items-center justify-center text-red-600">
        <p>Error: {labError}</p>
        <button
          onClick={fetchLabDetails} // Allow retrying lab details fetch
          className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  // If lab is null after loading and no error, it means the lab was not found
  if (!lab) {
    return (
      <div className="min-h-screen bg-gray-50 pt-30 font-inter flex flex-col items-center justify-center text-gray-500">
        <p>Lab not found or an unexpected error occurred.</p>
        <button
          onClick={() => navigate("/labs")}
          className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
        >
          Go back to Labs
        </button>
      </div>
    );
  }

  // --- Main Component Render (Lab and Timetable Data are available) ---
  return (
    <div className="min-h-screen bg-gray-50 pt-30 font-inter overflow-y-auto max-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 text-sm transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Labs
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {lab["lab name"]}
            </h1>
            <p className="text-gray-600 text-sm">{lab.department} Dept</p>
          </div>
          {/* Conditionally render admin buttons for lab details */}
          {isAdmin() && (
            <div className="flex gap-3">
              <button
                onClick={handleEditLabDetails}
                className="p-3 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors shadow-md"
                title="Edit Lab Details"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteLab}
                className="p-3 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors shadow-md"
                title="Delete Lab"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Lab Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-700" />
                <span className="text-base text-[14px] text-gray-700">
                  {lab.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                <span className="text-base font-medium text-gray-800">
                  Capacity:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.capacity}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-gray-700" />
                <span className="text-base font-medium text-gray-800">
                  Available System:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.availableSystem}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-gray-700" />
                <span className="text-base font-medium text-gray-800">
                  Working System:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.workingSystem}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-800">
                  Lab Type:{" "}
                </span>
                <span className="text-base text-gray-700">{lab.labType}</span>
              </div>
              <div className="mt-2">
                <span
                  className={` py-1 px-3 rounded-full text-sm font-medium ${getStatusColor(
                    lab.status || "Unknown"
                  )}`}
                >
                  {lab.status || "Status N/A"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-700" />
                <span className="text-base font-medium text-gray-800">
                  Incharge:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.incharge}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-700" />
                <span className="text-base font-medium text-gray-800">
                  Technician:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.technician}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-base font-medium text-gray-800">
                  Hardware:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.specifications}
                </span>
              </div>
              <div>
                <span className="text-base font-medium text-gray-800">
                  Software:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.software}
                </span>
              </div>
              <div>
                <span className="text-base font-medium text-gray-800">
                  Equipments:
                </span>
                <span className="text-base text-gray-700 text-[15px]">
                  {lab.equipments}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Weekly Timetable
            </h2>
            {/* Conditionally render "Edit Timetable" button */}
            {isAdmin() && (
              <button
                onClick={handleEditTimetable}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-md"
              >
                <CalendarPlus className="w-4 h-4" /> Edit Timetable
              </button>
            )}
          </div>
          {!timetable || timetable.schedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No timetable available for this lab yet.</p>
              {/* Conditionally render "Add Timetable" link/button */}
              {isAdmin() && (
                <button
                  onClick={handleEditTimetable}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add Timetable
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Day
                    </th>
                    {timeSlots.map((slot) => (
                      <th
                        key={slot.period}
                        className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]"
                      >
                        {slot.time}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {days.map((day) => (
                    <tr key={day} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {day}
                      </td>
                      {timeSlots.map((slot) => {
                        const entry = getScheduleEntry(day, slot.period);
                        return (
                          <td
                            key={slot.period}
                            className="py-3 px-4 text-center text-sm text-gray-700 whitespace-nowrap group relative"
                          >
                            <p className="font-medium text-gray-800">
                              {entry.class || "Free"}
                            </p>
                            {(entry.subject !== "Free" || entry.faculty) && (
                              <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-gray-700 text-white text-xs font-normal rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-gray-600">
                                {entry.subject !== "Free" && (
                                  <p><strong className="font-semibold">Subject:</strong> {entry.subject}</p>
                                )}
                                {entry.faculty && (
                                  <p><strong className="font-semibold">Faculty:</strong> {entry.faculty}</p>
                                )}
                                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-700"></div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lab Edit Modal */}
      {isAdmin() && showLabEditModal && lab && (
        <LabFormModal
          lab={lab}
          onClose={() => setShowLabEditModal(false)}
          onSave={handleSaveLab}
        />
      )}
      {/* Timetable Edit Modal */}
      {isAdmin() && showTimetableEditModal && lab && (
        <TimetableFormModal
          labId={lab._id}
          labName={lab["lab name"]}
          currentTimetable={timetable ? timetable.schedule : []} // Ensure currentTimetable is always an array
          onClose={() => setShowTimetableEditModal(false)}
          onSave={handleSaveTimetable}
          onDelete={handleDeleteTimetable}
        />
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default LabDetailsPage;