// src/pages/labpage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation


import ApiService from "../services/api.js";
import { useAuth } from "../context/authcontext.jsx"; // Import useAuth
import Toast from "../Components/common/toast.jsx"; // Import Toast component
import LabFormModal from "../Components/Labs/labformmodal.jsx"; // Import LabFormModal
import {
  Search,
  X,
  Eye,
  Users,
  MapPin,
  Loader2,
  PlusCircle,
  Edit,
  Trash2,
  FlaskConical
} from "lucide-react";

const Labs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]); // This will hold the actively filtered labs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentLabToEdit, setCurrentLabToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const { isAdmin } = useAuth(); // Get isAdmin status from auth context.

  const navigate = useNavigate(); // Initialize useNavigate

  const fetchLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Labs Page: Initiating fetchLabs...");
    try {
      const data = await ApiService.getLabs(); // Changed to getAllLabs as per previous suggestions
      console.log("Labs Page: Labs fetched successfully:", data);
      setLabs(data);
      // After fetching, if there's a search term, re-filter
      if (searchTerm.trim()) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = data.filter(
          (lab) =>
            (lab.department && lab.department.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (lab["lab name"] && lab["lab name"].toLowerCase().includes(lowerCaseSearchTerm)) // Use lab['lab name']
        );
        setFilteredLabs(filtered);
      } else {
        setFilteredLabs([]); // If no search term, no filtered results by default (show all via labsToDisplay)
      }
    } catch (err) {
      console.error("Labs Page: Failed to fetch labs:", err);
      setError(err.message || "Failed to load labs. Please try again.");
      setToastMessage({
        type: "error",
        message: err.message || "Failed to load labs.",
      });
    } finally {
      setLoading(false);
      console.log("Labs Page: fetchLabs completed. Loading:", false);
    }
  }, [searchTerm]); // Re-run fetchLabs when searchTerm changes to auto-filter on fetch

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredLabs([]); // If search term is empty, clear filtered results to show all
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = labs.filter(
      (lab) =>
        (lab.department && lab.department.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (lab['lab name'] && lab['lab name'].toLowerCase().includes(lowerCaseSearchTerm))
    );
    setFilteredLabs(filtered);
  }, [labs, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredLabs([]); // Clear filtered labs to show all original labs
  };

  const handleShowDetails = (lab) => {
    // Navigate to the LabDetailsPage using React Router
    navigate(`/labs/${lab._id}`);
  };

  const handleAddLabClick = () => {
    setCurrentLabToEdit(null); // Clear any previous lab data for 'Add' mode
    setShowAddEditModal(true);
  };

  const handleEditLabClick = (lab) => {
    setCurrentLabToEdit(lab); // Set lab data for 'Edit' mode
    setShowAddEditModal(true);
  };

  const handleDeleteLab = async (labId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this lab? This action cannot be undone."
      )
    ) {
      setLoading(true); // Show loading indicator
      try {
        await ApiService.deleteLab(labId);
        setToastMessage({
          type: "success",
          message: "Lab deleted successfully! 🗑️",
        });
        await fetchLabs(); // Re-fetch labs after deletion to update the list
      } catch (err) {
        console.error("Labs Page: Failed to delete lab:", err);
        setToastMessage({
          type: "error",
          message: err.message || "Failed to delete lab.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveLab = async (labData) => {
    setLoading(true);
    try {
      if (currentLabToEdit) {
        // Update existing lab - API call for update
        await ApiService.updateLab(currentLabToEdit._id, labData);
        setToastMessage({
          type: "success",
          message: "Lab updated successfully! ✨",
        });
      } else {
        // Add new lab
        await ApiService.createLab(labData);
        setToastMessage({
          type: "success",
          message: "Lab added successfully! ✅",
        });
      }
      setShowAddEditModal(false); // Close modal on successful save/update
      await fetchLabs(); // Re-fetch labs to show latest data
    } catch (err) {
      console.error("Labs Page: Failed to save lab:", err);
      setToastMessage({
        type: "error",
        message: err.message || "Failed to save lab.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine which list of labs to display (filtered or all)
  const labsToDisplay = searchTerm.trim() ? filteredLabs : labs;

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

  // Removed the conditional rendering of LabDetailsPage here.
  // LabDetailsPage should be a separate route handled by React Router.

  return (
    <div className="min-h-screen bg-gray-50 pt-38 font-inter overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-800 mb-4">
            {isAdmin() ? "Admin Laboratory Directory" : "Laboratory Directory"} {/* Call isAdmin() */}
          </h1>
          <p className="text-xl text-gray-600">
            {isAdmin() // Call isAdmin()
              ? "Manage and oversee all available laboratories"
              : "Explore and access all available laboratories"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by department or lab name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Search
            </button>
            {isAdmin() && ( 
              <button
                onClick={handleAddLabClick}
                className="w-full sm:w-auto bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" /> Add New Lab
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading labs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-600 text-lg">
            <p>{error}</p>
            <button
              onClick={fetchLabs}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Retry Loading Labs
            </button>
          </div>
        )}

        {!loading && !error && filteredLabs.length > 0 && searchTerm.trim() && (
          <div className="mb-6">
            <p className="text-gray-600">
              Found {filteredLabs.length} lab
              {filteredLabs.length !== 1 ? "s" : ""} matching your search
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Academic Labs
            </h2>

            {labsToDisplay.length === 0 &&
              !searchTerm.trim() && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No labs available at the moment.
                  </p>
                  {isAdmin() && ( 
                    <button
                      onClick={handleAddLabClick}
                      className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add Your First Lab
                    </button>
                  )}
                </div>
              )}

            {labsToDisplay.length === 0 &&
              searchTerm.trim() && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No labs found matching your search criteria.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search to view all labs
                  </button>
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labsToDisplay.map((lab) => (
                <div
                  key={lab._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-[17px] font-semibold text-black-900 mb-2">
                        {lab['lab name']}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {lab.department}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            lab.status || "Unknown"
                          )}`}
                        >
                          {lab.status || "Status N/A"}
                        </span>
                      </div>
                    </div>
                    {isAdmin() && ( 
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditLabClick(lab)}
                          className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                          title="Edit Lab"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLab(lab._id)}
                          className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Delete Lab"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{lab.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {lab.capacity} students</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleShowDetails(lab)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium mt-auto"
                  >
                    <Eye className="w-4 h-4" />
                    Show Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Lab Modal - Only render if isAdmin() is true */}
      {isAdmin() && showAddEditModal && (
        <LabFormModal
          lab={currentLabToEdit}
          onClose={() => setShowAddEditModal(false)}
          onSave={handleSaveLab}
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

export default Labs;