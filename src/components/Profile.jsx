import { signOut } from "firebase/auth";
import { ref, get, set, push, update } from "firebase/database";
import { auth, database } from "../components/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LogOut,
  PlusCircle,
  UserCircle,
  MonitorSmartphone,
  CalendarClock,
  Mail,
  BadgeInfo,
  Pencil,
} from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editedName, setEditedName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser);
      fetchUserData(currentUser.uid);
      fetchUserDevices(currentUser.uid);
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}/profile`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserDevices = async (userId) => {
    try {
      const devicesRef = ref(database, `users/${userId}/devices`);
      const snapshot = await get(devicesRef);
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        const deviceList = Object.keys(devicesData).map((key) => ({
          deviceId: key,
          ...devicesData[key],
        }));
        setDevices(deviceList);
      }
    } catch (error) {
      console.error("Error fetching user devices:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddDevice = async () => {
    const deviceName = prompt("Enter the device name:");
    if (deviceName) {
      try {
        const userId = user.uid;
        const deviceRef = push(ref(database, `users/${userId}/devices`));
        const deviceId = deviceRef.key;

        const deviceData = {
          deviceId,
          name: deviceName,
          registeredOn: new Date().toISOString(),
        };

        await set(deviceRef, deviceData);
        setDevices((prev) => [...prev, deviceData]);
        alert("Device registered successfully!");
      } catch (error) {
        console.error("Error registering device:", error);
      }
    }
  };

  const formatDateTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "medium",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setEditedName(device.name);
    setShowModal(true);
  };

  const handleEditSubmit = async () => {
    if (editingDevice && editedName.trim()) {
      try {
        const userId = user.uid;
        const deviceRef = ref(database, `users/${userId}/devices/${editingDevice.deviceId}`);

        await update(deviceRef, { name: editedName });

        // Update local state for immediate UI feedback
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.deviceId === editingDevice.deviceId
              ? { ...device, name: editedName }
              : device
          )
        );

        setShowModal(false);
        setEditingDevice(null);
        setEditedName("");
      } catch (error) {
        console.error("Error updating device:", error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-300  px-4 py-8 sm:px-6 lg:px-10">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl p-5 sm:p-8 md:p-10 space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-green-700 flex items-center justify-center gap-2">
          <UserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
          Profile Dashboard
        </h2>

        {user ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-base sm:text-lg font-semibold text-gray-700">
                Welcome, <span className="text-emerald-600">{user.displayName || user.email}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 shadow-md space-y-2">
                <p className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <BadgeInfo className="w-5 h-5 text-green-500" />
                  <strong>User ID:</strong> {userData?.userID || user?.uid || "Unavailable"}
                </p>
                <p className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <UserCircle className="w-5 h-5 text-green-500" />
                  <strong>Name:</strong> {userData?.name || "No name provided"}
                </p>
                <p className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-5 h-5 text-green-500" />
                  <strong>Email:</strong> {userData?.email}
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-100 to-teal-200 rounded-xl p-4 shadow-md space-y-2">
                <p className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <CalendarClock className="w-5 h-5 text-green-500" />
                  <strong>Signup Date:</strong> {userData?.signupDate || "Not recorded"}
                </p>
                <p className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <CalendarClock className="w-5 h-5 text-green-500" />
                  <strong>Signup Time:</strong> {userData?.signupTime || "Not recorded"}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleAddDevice}
                className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-green-600 transition shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                Register New Device
              </button>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-green-700 flex items-center gap-2 mb-2">
                <MonitorSmartphone className="w-6 h-6 text-green-500" />
                Your Devices
              </h3>
              {devices.length > 0 ? (
                <ul className="space-y-4">
                  {devices.map((device) => (
                    <li
                      key={device.deviceId}
                      className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm text-sm sm:text-base"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-700">
                            <strong>Device ID:</strong> {device.deviceId}
                          </p>
                          <p className="text-gray-700 flex items-center gap-2">
                            <strong>Name:</strong> {device.name}
                            <Pencil
                              onClick={() => openEditModal(device)}
                              className="w-4 h-4 text-green-500 cursor-pointer hover:text-green-700"
                              title="Edit Name"
                            />
                          </p>
                          <p className="text-gray-700">
                            <strong>Registered On:</strong>{" "}
                            {device.registeredOn ? formatDateTime(device.registeredOn) : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No devices registered yet.</p>
              )}
            </div>

            <div className="flex justify-center gap-8">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-red-600 transition shadow-md"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
              <button
  onClick={() => navigate("/delete-account")}
  className="flex items-center gap-2 px-5 py-3 bg-red-400 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-red-700 transition shadow-md"
>
  <LogOut className="w-5 h-5" />
  Delete Account
</button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">Loading your profile...</p>
        )}
      </div>

      {/* Modal for Editing Device Name */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Edit Device Name</h3>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDevice(null);
                  setEditedName("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

