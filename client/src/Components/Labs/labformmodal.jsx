import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const LabFormModal = ({ lab, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    labName: "",
    department: "",
    location: "",
    capacity: "",
    equipments: "",
    availableSystem: "",
    workingSystem: "",
    incharge: "",
    technician: "",
    software: "",
    specifications: "",
    labType: "",
    status: "Available", // Default status
  });

  useEffect(() => {
    if (lab) {
      // Ensure all fields are properly initialized from the lab object
      setFormData({
        labName: lab["lab name"] || "",
        department: lab.department || "",
        location: lab.location || "",
        capacity: lab.capacity || "",
        equipments: lab.equipments || "", // Ensure it's treated as a string
        availableSystem: lab.availableSystem || "",
        workingSystem: lab.workingSystem || "",
        incharge: lab.incharge || "",
        technician: lab.technician || "",
        software: lab.software || "",
        specifications: lab.specifications || "",
        labType: lab.labType || "",
        status: lab.status || "Available",
      });
    } else {
      // Reset form for new lab
      setFormData({
        labName: "",
        department: "",
        location: "",
        capacity: "",
        equipments: "",
        availableSystem: "",
        workingSystem: "",
        incharge: "",
        technician: "",
        software: "",
        specifications: "",
        labType: "",
        status: "Available",
      });
    }
  }, [lab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // onSave will handle showing the toast
  };

  // Close modal on Escape key press and on overlay click
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      {/* Clickable overlay to close the modal */}
      <div
        className="absolute inset-0"
        onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 relative mt-40 my-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {lab ? "Edit Lab Details" : "Add New Lab"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {" "}
            {/* Two-column layout */}
            <div>
              <label
                htmlFor="labName"
                className="block text-sm font-medium text-gray-700">
                Lab Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="labName"
                name="labName"
                value={formData.labName}
                onChange={handleChange}
                required={true}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700">
                Department<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required={true}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required={false}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required={false}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="availableSystem"
                className="block text-sm font-medium text-gray-700">
                Available Systems
              </label>
              <input
                type="number"
                id="availableSystem"
                name="availableSystem"
                value={formData.availableSystem}
                onChange={handleChange}
                required={false}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="workingSystem"
                className="block text-sm font-medium text-gray-700">
                Working Systems
              </label>
              <input
                type="number"
                id="workingSystem"
                name="workingSystem"
                value={formData.workingSystem}
                onChange={handleChange}
                required={false}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="incharge"
                className="block text-sm font-medium text-gray-700">
                Incharge
              </label>
              <input
                type="text"
                id="incharge"
                name="incharge"
                value={formData.incharge}
                onChange={handleChange}
                required={false}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="technician"
                className="block text-sm font-medium text-gray-700">
                Technician
              </label>
              <input
                type="text"
                id="technician"
                name="technician"
                value={formData.technician}
                onChange={handleChange}
                required={false}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              {" "}
              {/* Full width for textarea */}
              <label
                htmlFor="software"
                className="block text-sm font-medium text-gray-700">
                Software
              </label>
              <textarea
                id="software"
                name="software"
                value={formData.software}
                onChange={handleChange}
                required={false}
                rows="2"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
            <div className="md:col-span-2">
              {" "}
              {/* Full width for textarea */}
              <label
                htmlFor="specifications"
                className="block text-sm font-medium text-gray-700">
                Specifications (Hardware)
              </label>
              <textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                required={false}
                rows="2"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
            <div className="md:col-span-2">
              {" "}
              {/* Full width for textarea */}
              <label
                htmlFor="equipments"
                className="block text-sm font-medium text-gray-700">
                Equipments (comma-separated)
              </label>
              <textarea
                id="equipments"
                name="equipments"
                value={formData.equipments}
                onChange={handleChange}
                required={false}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
            <div>
              <label
                htmlFor="labType"
                className="block text-sm font-medium text-gray-700">
                Lab Type
              </label>
              <input
                type="text"
                id="labType"
                name="labType"
                value={formData.labType}
                onChange={handleChange}
                required={false}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., S, T, R"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required={false}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            {" "}
            {/* Separator for button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
              <Save className="w-5 h-5" /> {lab ? "Update Lab" : "Add Lab"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabFormModal;
