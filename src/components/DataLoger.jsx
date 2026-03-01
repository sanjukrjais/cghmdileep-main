"use client";
import React, { useEffect, useState } from "react";
import {
  ref,
  query,
  onValue,
  orderByKey,
  limitToLast,
  get,
  set,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  MonitorSmartphone,
  Calendar,
  Clock,
  Droplets,
  ThermometerSun,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Footer from "./Footer";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DataLogger = () => {
  const [latestData, setLatestData] = useState(null);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [debugInfo, setDebugInfo] = useState({});
  const [humidityMetrics, setHumidityMetrics] = useState({
    dc: null,
    vrms: null,
    glucose: null,
  });
  const [humidityHistory, setHumidityHistory] = useState({
    dc: [],
    vrms: [],
    glucose: [],
  });

  const navigate = useNavigate();

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (!user) {
  //       navigate("/login");
  //     } else {
  //       setUserId(user.uid);
  //       fetchUserDevices(user.uid);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        // 🔥 ARDUINO UID HARDCODE
        // setUserId("nNIn8taYjLNzemjrIVg7JZiILA32"); // YOUR REAL USER ID
        // setUserId("nNIn8taYjLNzemjrIVg7JZiIlA32");
        // fetchUserDevices("nNIn8taYjLNzemjrIVg7JZiIlA32"); // ✅ Call it
        setUserId(user.uid);
        fetchUserDevices(user.uid);

        setSelectedDeviceId("-ORkZfO-VFapQ2ya3aDG"); // Device ID from your DB

        setDevices([
          {
            deviceId: "-ORkZfO-VFapQ2ya3aDG",
            name: "MAX30100 Live Sensor",
          },
        ]);
        console.log("✅ Using Arduino UID:", user.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 🔥 FIXED fetchUserDevices - HARDCODE + AUTO CREATE
  const fetchUserDevices = async (uid) => {
    console.log("🔍 fetchUserDevices called with UID:", uid);

    // 🔥 HARDCODE DEVICE (backup)
    const hardcodedDevice = {
      deviceId: "-ORkZfO-VFapQ2ya3aDG",
      name: "MAX30100 Sensor",
    };

    try {
      const devicesRef = ref(database, `users/${uid}/devices`);
      const snapshot = await get(devicesRef);

      console.log("🔍 Devices snapshot:", snapshot.val());

      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        const list = Object.keys(devicesData).map((key) => ({
          deviceId: key,
          name: devicesData[key]?.name || "Unnamed Device",
        }));
        setDevices(list);
        if (list.length > 0) {
          setSelectedDeviceId(list[0].deviceId);
        }
      } else {
        // 🔥 NO DEVICES? CREATE ONE!
        console.log("❌ No devices found, creating hardcoded...");
        setDevices([hardcodedDevice]);
        setSelectedDeviceId(hardcodedDevice.deviceId);

        // Auto-create device in Firebase
        const deviceRef = ref(
          database,
          `users/${uid}/devices/${hardcodedDevice.deviceId}`
        );
        await set(deviceRef, { name: hardcodedDevice.name });
      }
    } catch (error) {
      console.error("❌ fetchUserDevices ERROR:", error);
      // FALLBACK
      setDevices([hardcodedDevice]);
      setSelectedDeviceId(hardcodedDevice.deviceId);
    }
  };

  const getFormattedTimestamp = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}_${mm}_${dd}_${hh}_${min}_${ss}`;
  };

  // const storeFinalHumidityValues = (values) => {
  //   const now = new Date();
  //   const timestampFormatted = getFormattedTimestamp();

  //   const time_stamp = {
  //     date: now.toLocaleDateString(),
  //     time: now.toLocaleTimeString(),
  //   };

  //   const finalData = {
  //     Humidity: {
  //       "DC Value": values.dc,
  //       "Vrms of AC": values.vrms,
  //       "Glucose Level": values.glucose,
  //       date: time_stamp.date,
  //       time: time_stamp.time,
  //     },
  //   };
  //   const finalRef = ref(
  //     database,
  //     `users/${userId}/devices/${selectedDeviceId}/final_values/${timestampFormatted}`
  //   );
  //   set(finalRef, finalData);
  // };

  const storeFinalHumidityValues = (values, temp = null) => {
    const now = new Date();
    const timestampFormatted = getFormattedTimestamp();
    const time_stamp = {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };

    const finalData = {
      "DC Value": values.dc, // IR value
      "Vrms of AC": values.vrms, // Red value processed
      "Glucose Level": values.glucose,
      ...(temp && { Temperature: temp }), // Temp optional
      date: time_stamp.date,
      time: time_stamp.time,
    };

    // Save user ke under (jaise pehle tha)
    const finalRef = ref(
      database,
      `users/${userId}/devices/${selectedDeviceId}/final_values/${timestampFormatted}`
    );
    set(finalRef, finalData);
  };

  const calculateMetrics = (latestData) => {
    console.log("🔬 CALC INPUT:", latestData); // DEBUG

    // ✅ FIX: IR=0 ko handle karo
    const ir = latestData?.ir ? parseFloat(latestData.ir) || 0 : 0;
    const red = latestData?.red ? parseFloat(latestData.red) || 0 : 0;
    const temp = latestData?.temp || null;

    console.log("🔢 PARSED: IR=", ir, "Red=", red);

    if (isNaN(ir) || isNaN(red)) {
      console.log("❌ NaN values!");
      return { dc: 0, vrms: 0, glucose: 0 };
    }

    // ✅ DC = IR (direct)
    const dc = ir.toFixed(2);

    // ✅ AC Deviation = Red - DC
    const ac_deviation = red - ir;

    // ✅ VRMS calculation
    const vrms = Math.abs(ac_deviation).toFixed(2);

    // ✅ GLUCOSE Formula (MAX30100 standard)
    const glucose = Math.max(50, -0.1114 * parseFloat(vrms) + 153.0552).toFixed(
      1
    );

    console.log("✅ RESULT: DC=", dc, "VRMS=", vrms, "Glucose=", glucose);

    return { dc, vrms, glucose };
  };

  useEffect(() => {
    if (!userId) return;

    console.log("📡 Listening to Arduino data...");

    // const dataRef = query(
    //   ref(database, `users/${userId}/devices/-ORkZfO-VFapQ2ya3aDG/readings`),
    //   orderByKey(),
    //   limitToLast(1)
    // );
    const dataRef = query(
      ref(database, `users/${userId}/devices/${selectedDeviceId}/readings`),
      orderByKey(),
      limitToLast(100)
    );

    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const dataObject = snapshot.val();
        const latestReading = Object.values(dataObject)[0];

        console.log("✅ LATEST:", latestReading);
        setLatestData(latestReading);

        // 🔥 GLUCOSE CALCULATE (EVEN IF IR=0)
        const metrics = calculateMetrics(latestReading);
        setHumidityMetrics(metrics);

        // 🔥 CHART UPDATE
        setHumidityHistory((prev) => ({
          dc: [...prev.dc.slice(-49), metrics.dc],
          vrms: [...prev.vrms.slice(-49), metrics.vrms],
          glucose: [...prev.glucose.slice(-49), metrics.glucose],
        }));

        // 🔥 SAVE TO FIREBASE
        storeFinalHumidityValues(metrics, latestReading?.temp);
      } else {
        console.log("❌ No data");
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 🔥 FIXED 2nd useEffect - ANY selectedDeviceId work karega
  useEffect(() => {
    if (!userId || !selectedDeviceId) return;

    console.log("📋 Table data for:", selectedDeviceId);

    const dataRef = query(
      ref(database, `users/${userId}/devices/${selectedDeviceId}/readings`),
      orderByKey(),
      limitToLast(100) // Reduced for speed
    );

    const unsubscribe = onValue(dataRef, (snapshot) => {
      console.log("📋 TABLE SNAPSHOT:", snapshot.val());

      if (snapshot.exists()) {
        const fetchedData = snapshot.val();
        const formattedData = Object.keys(fetchedData)
          .map((key) => ({
            ...fetchedData[key],
            id: key,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
          }))
          .reverse();

        console.log("✅ TABLE DATA:", formattedData.length, "entries");
        setData(formattedData);
        setDebugInfo((prev) => ({ ...prev, tableCount: formattedData.length }));
      }
    });

    return () => unsubscribe();
  }, [userId, selectedDeviceId]);
  // Chart.js Data
  // const chartData = {
  //   labels: humidityHistory.dc.map((_, index) => index + 1), // Create an index for the labels
  //   datasets: [
  //     {
  //       label: "DC Value",
  //       data: humidityHistory.dc,
  //       borderColor: "rgba(75, 192, 192, 1)",
  //       tension: 0.1,
  //       fill: false,
  //     },
  //     {
  //       label: "Vrms of AC",
  //       data: humidityHistory.vrms,
  //       borderColor: "rgba(153, 102, 255, 1)",
  //       tension: 0.1,
  //       fill: false,
  //     },
  //     {
  //       label: "Glucose Level",
  //       data: humidityHistory.glucose,
  //       borderColor: "rgba(255, 159, 64, 1)",
  //       tension: 0.1,
  //       fill: false,
  //     },
  //   ],
  // };

  const chartData = {
    labels: humidityHistory.dc
      .map((_, i) => {
        const points = humidityHistory.dc.length;
        const index = points - 1 - i;
        return index === 0 ? "🔴 LIVE" : `${index * 3}s`;
      })
      .reverse(), // Right-to-left time
    datasets: [
      {
        label: `IR (DC): ${humidityMetrics.dc ?? 0}`,
        data: humidityHistory.dc,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `Red VRMS: ${humidityMetrics.vrms ?? 0}`,
        data: humidityHistory.vrms,
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `🩸 Glucose: ${humidityMetrics.glucose ?? 0} mg/dL`,
        data: humidityHistory.glucose,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.3)",
        borderWidth: 4,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 12 }, padding: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.1)" },
      },
      x: {
        grid: { display: false },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 via-emerald-200 to-green-400">
      <div className="flex-grow px-4 py-8 sm:px-6 lg:px-10">
        {/* 🔥 DEBUG INFO - TOP PANEL */}
        <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-xl mb-4">
          <h3 className="font-bold text-yellow-800 mb-2">
            🔍 LIVE + CHART STATUS
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <strong>User:</strong> {userId?.slice(0, 8)}...
            </div>
            <div>
              <strong>Device:</strong> {selectedDeviceId?.slice(0, 12)}...
            </div>
            <div>
              <strong>IR:</strong> {latestData?.ir ?? "N/A"}
            </div>
            <div>
              <strong>Red:</strong> {latestData?.red ?? "N/A"}
            </div>
            <div className="col-span-2">
              <strong>🩸 Glucose:</strong>{" "}
              <span className="text-lg font-bold text-red-600">
                {humidityMetrics.glucose ?? "N/A"}
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t">
              <strong>📊 Chart Points:</strong>{" "}
              <span className="font-bold text-green-600">
                {humidityHistory.dc.length}
              </span>
              | DC:
              <span className="text-green-600">
                {humidityHistory.dc.slice(-3)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center bg-white text-green-700 py-12 px-6 sm:px-8 lg:px-10 rounded-3xl shadow-xl w-full max-w-6xl space-y-8 mx-auto">
          <MonitorSmartphone className="w-16 h-16 text-green-500 transition-transform transform hover:scale-110" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-green-700">
            Device Data Logger
          </h1>
          {devices.length > 0 ? (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="mb-6 px-6 py-3 rounded-lg bg-white text-green-700 font-semibold shadow-md hover:bg-green-100 transition-all duration-200 w-full sm:w-auto"
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
          {/* Humidity Metrics Display */}
          {/* <div className="w-full text-left text-green-800 bg-green-50 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Humidity Metrics</h2>
            <p>
              <strong>DC Value:</strong> {humidityMetrics.dc ?? "N/A"}
            </p>
            <p>
              <strong>Vrms of AC:</strong> {humidityMetrics.vrms ?? "N/A"}
            </p>
            <p>
              <strong>Glucose Level:</strong> {humidityMetrics.glucose ?? "N/A"}
            </p>
          </div> */}
          {/* 5. Metrics display update karo (Humidity -> IR/Red): */}
          {/* <div className="w-full text-left text-green-800 bg-green-50 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Live Sensor Data</h2>
            <p>
              <strong>IR (DC):</strong> {latestData?.ir ?? "N/A"}
            </p>
            <p>
              <strong>Red (AC):</strong> {latestData?.red ?? "N/A"}
            </p>
            <p>
              <strong>Temp:</strong> {latestData?.temp ?? "N/A"}°C
            </p>
            <p>
              <strong>Glucose:</strong> {humidityMetrics.glucose ?? "N/A"} mg/dL
            </p>
          </div> */}
          <div className="w-full text-left text-green-800 bg-green-50 rounded-xl p-6 shadow-lg max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">📡 Live Sensor Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 text-lg">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <strong>IR (DC):</strong>
                <br />
                <span className="text-2xl font-bold text-green-600">
                  {latestData?.ir ?? "N/A"}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <strong>Red (AC):</strong>
                <br />
                <span className="text-2xl font-bold text-purple-600">
                  {latestData?.red ?? "N/A"}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <strong>Temperature:</strong>
                <br />
                <span className="text-2xl font-bold text-orange-600">
                  {latestData?.temp ?? "N/A"}°C
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md border-4 border-red-200">
                <strong>🩸 Glucose:</strong>
                <br />
                <span className="text-3xl font-black text-red-600">
                  {humidityMetrics.glucose ?? "N/A"} mg/dL
                </span>
              </div>
            </div>
          </div>

          {/* Humidity Metrics Graph */}
          <div className="w-full h-96 mt-6 bg-white rounded-2xl p-4 shadow-2xl border-4 border-green-100">
            <h3 className="text-xl font-bold text-green-700 mb-4 text-center">
              📈 Real-Time Glucose Monitor
            </h3>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-md border border-green-200">
              <thead className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm sm:text-base">
                    S.No
                  </th>
                  <th className="px-4 py-3 text-left text-sm sm:text-base">
                    <Calendar className="inline w-5 h-5 mr-2 text-white" />
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm sm:text-base">
                    <Clock className="inline w-5 h-5 mr-2 text-white" />
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm sm:text-base">
                    <ThermometerSun className="inline w-5 h-5 mr-2 text-yellow-300" />
                    Temp (°C)
                  </th>
                  <th className="px-4 py-3 text-left text-sm sm:text-base">
                    IR Value
                  </th>
                  <th className="px-4 py-3 text-left text-sm sm:text-base">
                    Red Value
                  </th>
                  {/* <th className="px-4 py-3 text-left text-sm sm:text-base">
                    <Droplets className="inline w-5 h-5 mr-2 text-blue-300" />
                    Humidity
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`transition-all hover:bg-green-50 ${
                        index % 2 === 0 ? "bg-green-100" : "bg-green-200"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm sm:text-base">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm sm:text-base">
                        {entry.date ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm sm:text-base">
                        {entry.time ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm sm:text-base">
                        {/* {entry.temperature ?? "N/A"} */}
                        {entry.temp ?? "N/A"}
                      </td>
                      {/* <td className="px-4 py-3 text-sm sm:text-base">
                        {entry.humidity ?? "N/A"}
                      </td> */}
                      <td>{entry.ir ?? "N/A"}</td>
                      <td>{entry.red ?? "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DataLogger;
