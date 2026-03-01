"use client";
import {
  ref,
  query,
  onValue,
  orderByChild,
  limitToLast,
  get,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { database, auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  Thermometer,
  Droplets,
  MonitorSmartphone,
  Droplet,
  Activity,
  HeartPulse,
} from "lucide-react";

const Monitoring = () => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [tempTrend, setTempTrend] = useState(null);
  const [humidTrend, setHumidTrend] = useState(null);
  const [bloodSugarLevel, setBloodSugarLevel] = useState(null);
  const [userId, setUserId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const prevTemp = useRef(null);
  const prevHumid = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.uid);
        fetchUserDevices(user.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserDevices = async (uid) => {
    const devicesRef = ref(database, `users/${uid}/devices`);
    const snapshot = await get(devicesRef);
    if (snapshot.exists()) {
      const devicesData = snapshot.val();
      const list = Object.keys(devicesData).map((key) => ({
        deviceId: key,
        name: devicesData[key].name || "Unnamed Device",
      }));
      setDevices(list);
      if (list.length > 0) setSelectedDeviceId(list[0].deviceId);
    }
  };

  useEffect(() => {
    if (!userId || !selectedDeviceId) return;

    const readingsRef = query(
      ref(database, `users/${userId}/devices/${selectedDeviceId}/readings`),
      orderByChild("timestamp"),
      limitToLast(1)
    );

    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const latestKey = Object.keys(data)[0];
      const latest = data[latestKey];

      if (latest) {
        const newTemp = latest.temperature;
        setTempTrend(
          prevTemp.current !== null
            ? newTemp > prevTemp.current
              ? "up"
              : newTemp < prevTemp.current
              ? "down"
              : "same"
            : null
        );
        prevTemp.current = newTemp;
        setTemperature(newTemp);

        const newHumid = latest.humidity;
        setHumidTrend(
          prevHumid.current !== null
            ? newHumid > prevHumid.current
              ? "up"
              : newHumid < prevHumid.current
              ? "down"
              : "same"
            : null
        );
        prevHumid.current = newHumid;
        setHumidity(newHumid);
      }
    });

    return () => unsubscribe();
  }, [userId, selectedDeviceId]);

  useEffect(() => {
    if (!userId || !selectedDeviceId) return;

    const glucoseRef = ref(
      database,
      `users/${userId}/devices/${selectedDeviceId}/final_values`
    );

    const unsubscribe = onValue(glucoseRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const sortedTimestamps = Object.keys(data).sort().reverse();
      const latest = data[sortedTimestamps[0]];

      if (latest?.Humidity?.["Glucose Level"] !== undefined) {
        setBloodSugarLevel(latest.Humidity["Glucose Level"]);
      }
    });

    return () => unsubscribe();
  }, [userId, selectedDeviceId]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 via-emerald-200 to-green-400">
      <div className="flex-grow px-4 py-8 sm:px-6 lg:px-10 flex flex-col items-center overflow-auto">
        <div className="flex flex-col items-center bg-white text-green-700 py-8 px-6 sm:px-8 lg:px-10 rounded-3xl shadow-xl w-full max-w-5xl">
          <div className="flex items-center mb-6">
            <MonitorSmartphone className="w-16 h-16 text-green-500 mr-4" />
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              Device Monitoring
            </h1>
          </div>

          <div className="w-full flex justify-center mb-8">
            {devices.length > 0 ? (
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="px-6 py-3 rounded-lg bg-white text-green-700 font-semibold shadow-md hover:bg-green-100 transition-all duration-200"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-600">No devices found.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-6 justify-center items-center w-full">
            {/* Blood Sugar Level – Dynamic */}
            <div className="relative flex flex-col items-center bg-gradient-to-br from-teal-100 to-green-200 rounded-2xl p-6 shadow-md border border-green-300/30 overflow-hidden w-64 h-55">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-10 blur-xl rounded-2xl z-0 scale-125" />
              <div className="relative z-10 flex flex-col items-center">
                <Droplet className="w-12 h-12 mb-3 text-red-500" />
                <h2 className="text-md sm:text-lg font-bold text-green-800 mb-2 text-center">
                  Blood Sugar Level
                </h2>
                <div className="text-xl font-semibold text-green-800">
                  {bloodSugarLevel !== null
                    ? `${bloodSugarLevel} mg/dL`
                    : "Loading..."}
                </div>
              </div>
            </div>

            {/* Pulse Rate (Coming Soon) */}
            <div className="group relative flex flex-col items-center bg-gradient-to-br from-teal-100 to-green-200 rounded-2xl p-6 shadow-md border border-green-300/30 overflow-hidden w-64 h-55 group hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.03]">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-10 blur-xl rounded-2xl z-0 scale-125 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col items-center transition-all duration-500 group-hover:opacity-0">
                <Activity className="w-12 h-12 mb-3 text-red-700" />
                <h2 className="text-md sm:text-lg font-bold text-green-800 mb-2 text-center">
                  Pulse Rate
                </h2>
                <p className="text-md font-semibold text-gray-700 italic text-center">
                  Coming Soon
                </p>
              </div>
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Activity className="w-16 h-16 text-red-700 mb-4 animate-bounce" />
                <p className="text-2xl font-extrabold text-green-800">
                  Coming Soon
                </p>
              </div>
            </div>

            {/* SpO2 (Coming Soon) */}
            <div className="group relative flex flex-col items-center bg-gradient-to-br from-teal-100 to-green-200 rounded-2xl p-6 shadow-md border border-green-300/30 overflow-hidden w-64 h-55 group hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.03]">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-10 blur-xl rounded-2xl z-0 scale-125 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col items-center transition-all duration-500 group-hover:opacity-0">
                <HeartPulse className="w-12 h-12 mb-3 text-blue-600" />
                <h2 className="text-md sm:text-lg font-bold text-green-800 mb-2 text-center">
                  Blood Oxygen Saturation (SpO₂)
                </h2>
                <p className="text-md font-semibold text-gray-700 italic text-center">
                  Coming Soon
                </p>
              </div>
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <HeartPulse className="w-16 h-16 text-blue-600 mb-4 animate-bounce" />
                <p className="text-2xl font-extrabold text-green-800">
                  Coming Soon
                </p>
              </div>
            </div>
          </div>

          {/* Temperature and Humidity Cards */}
          <div className="flex flex-wrap gap-6 justify-center w-full mt-8">
            <div className="group relative flex flex-col items-center bg-gradient-to-r from-green-100 to-green-200 text-green-900 rounded-xl p-6 shadow-md hover:shadow-2xl transform hover:scale-[1.03] w-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-300 via-orange-200 to-yellow-100 opacity-20 blur-2xl rounded-xl z-0 scale-125 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center mb-4">
                  <Thermometer className="w-10 h-10 mr-3 text-red-500" />
                  <h2 className="text-xl font-semibold">Temperature</h2>
                </div>
                <div className="flex items-center text-4xl font-bold">
                  {temperature !== null ? (
                    <>
                      {temperature}°C
                      {tempTrend === "up" && (
                        <ArrowUp className="w-6 h-6 text-red-500 ml-3" />
                      )}
                      {tempTrend === "down" && (
                        <ArrowDown className="w-6 h-6 text-red-500 ml-3" />
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 animate-pulse">
                      Loading...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="group relative flex flex-col items-center bg-gradient-to-r from-emerald-100 to-teal-200 text-green-900 rounded-xl p-6 shadow-md hover:shadow-2xl transform hover:scale-[1.03] w-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-teal-300 opacity-20 blur-2xl rounded-xl z-0 scale-125 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center mb-4">
                  <Droplets className="w-10 h-10 mr-3 text-blue-500" />
                  <h2 className="text-xl font-semibold">Humidity</h2>
                </div>
                <div className="flex items-center text-4xl font-bold">
                  {humidity !== null ? (
                    <>
                      {humidity}%
                      {humidTrend === "up" && (
                        <ArrowUp className="w-6 h-6 text-blue-500 ml-3" />
                      )}
                      {humidTrend === "down" && (
                        <ArrowDown className="w-6 h-6 text-blue-500 ml-3" />
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 animate-pulse">
                      Loading...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
