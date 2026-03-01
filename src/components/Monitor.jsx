import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const Monitor = () => {
  useEffect(() => {
    let port, reader, inputDone, inputStream;
    let csvData = [
      [
        "Timestamp",
        "Red",
        "IR",
        "Temperature",
        "Battery",
        "BPM",
        "SBP",
        "DBP",
        "Notch",
      ],
    ];
    let isConnected = false;
    let wakeLock = null;

    const ANALYSIS_WINDOW = 300;
    let irBuffer = [];
    let currentVitals = { bpm: "--", sbp: "--", dbp: "--", notch: "--" };

    let chart;
    const ctx = document.getElementById("pulseChart")?.getContext("2d");

    if (!ctx) return;

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array(100).fill(""),
        datasets: [
          {
            label: "Pulse Wave",
            data: Array(100).fill(0),
            borderColor: "#38bdf8",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.2,
            fill: false,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false } },
      },
    });

    window.connectSerial = async (useFilters) => {
      if (!navigator.serial) {
        alert("Web Serial not supported. Please use Chrome on Android.");
        return;
      }

      try {
        const filters = useFilters ? [{ usbVendorId: 0x303a }] : [];
        port = await navigator.serial.requestPort({ filters });
        await port.open({ baudRate: 115200 });

        const textDecoder = new TextDecoderStream();
        inputDone = port.readable.pipeTo(textDecoder.writable);
        inputStream = textDecoder.readable;
        reader = inputStream.getReader();

        isConnected = true;
        updateUI(true);
        requestWakeLock();
        document.getElementById("status").innerText = "Recording...";
        document.getElementById("debug").style.display = "none";

        setInterval(analyzeSignal, 500);
        readLoop();
      } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "Connection Failed";
        const debug = document.getElementById("debug");
        debug.style.display = "block";
        debug.innerHTML =
          "<b>Hint:</b> 1. Enable OTG in Android Settings.<br>2. Check 'USB CDC On Boot' in Arduino IDE.<br>Error: " +
          error.message;
      }
    };

    async function readLoop() {
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        buffer += value;
        let lines = buffer.split("\n");
        buffer = lines.pop();
        for (let line of lines) processData(line.trim());
      }
    }

    function processData(line) {
      if (!line || !line.includes(",")) return;
      const parts = line.split(",");
      if (parts.length >= 4) {
        const red = parts[0];
        const ir = parseInt(parts[1]);
        const temp = parts[2];
        const batt = parts[3];
        const timestamp = new Date().toISOString();

        document.getElementById("tempDisp").innerText = temp;
        document.getElementById("irDisp").innerText = ir;
        document.getElementById("battDisp").innerText = batt;

        irBuffer.push(ir);
        if (irBuffer.length > ANALYSIS_WINDOW) irBuffer.shift();

        const currentData = chart.data.datasets[0].data;
        currentData.shift();
        currentData.push(ir);
        chart.update();

        csvData.push([
          timestamp,
          red,
          ir,
          temp,
          batt,
          currentVitals.bpm,
          currentVitals.sbp,
          currentVitals.dbp,
          currentVitals.notch,
        ]);
      }
    }

    function analyzeSignal() {
      if (irBuffer.length < 150) return;

      let smoothed = [];
      for (let i = 2; i < irBuffer.length - 2; i++) {
        let sum =
          irBuffer[i - 2] +
          irBuffer[i - 1] +
          irBuffer[i] +
          irBuffer[i + 1] +
          irBuffer[i + 2];
        smoothed.push(sum / 5);
      }

      let min = Math.min(...smoothed);
      let max = Math.max(...smoothed);
      let threshold = min + (max - min) * 0.6;

      let peaks = [];
      for (let i = 1; i < smoothed.length - 1; i++) {
        if (smoothed[i] > smoothed[i - 1] && smoothed[i] > smoothed[i + 1]) {
          if (smoothed[i] > threshold) {
            if (peaks.length === 0 || i - peaks[peaks.length - 1] > 30) {
              peaks.push(i);
            }
          }
        }
      }

      if (peaks.length < 2) {
        currentVitals = { bpm: "--", sbp: "--", dbp: "--", notch: "No Signal" };
        updateVitalsUI();
        return;
      }

      let totalDist = 0;
      for (let i = 1; i < peaks.length; i++)
        totalDist += peaks[i] - peaks[i - 1];
      let avgDist = totalDist / (peaks.length - 1);
      let bpm = Math.round(6000 / avgDist);
      if (bpm < 40 || bpm > 180) bpm = "--";

      let hasNotch = false;
      if (peaks.length >= 2) {
        let p1 = peaks[peaks.length - 2];
        let p2 = peaks[peaks.length - 1];
        for (let j = p1 + 5; j < p2 - 5; j++) {
          if (smoothed[j] < smoothed[j - 1] && smoothed[j] < smoothed[j + 1]) {
            hasNotch = true;
            break;
          }
        }
      }

      let sbp = "--",
        dbp = "--",
        notchText = hasNotch ? "YES" : "NO";
      if (bpm !== "--") {
        let base_sbp = 110 + (bpm - 70) * 0.5;
        if (hasNotch) {
          sbp = Math.round(base_sbp - 5);
          dbp = Math.round(70 + (bpm - 70) * 0.3);
        } else {
          sbp = Math.round(base_sbp);
          dbp = Math.round(70 + (bpm - 70) * 0.3);
        }
      }

      currentVitals = { bpm, sbp, dbp, notch: notchText };
      updateVitalsUI();
    }

    function updateVitalsUI() {
      document.getElementById("bpmDisp").innerText = currentVitals.bpm;
      document.getElementById("sbpDisp").innerText = currentVitals.sbp;
      document.getElementById("dbpDisp").innerText = currentVitals.dbp;
      const notchElem = document.getElementById("notchDisp");
      notchElem.innerText = currentVitals.notch;
      notchElem.className =
        currentVitals.notch === "YES"
          ? "card-value notch-yes"
          : "card-value notch-no";
    }

    window.disconnectSerial = async () => {
      if (reader) {
        await reader.cancel();
        await inputDone.catch(() => {});
        reader = null;
        inputDone = null;
      }
      if (port) {
        await port.close();
        port = null;
      }
      isConnected = false;
      updateUI(false);
      document.getElementById("status").innerText =
        "Disconnected. Ready to Download.";
    };

    async function requestWakeLock() {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (err) {}
    }

    window.downloadCSV = () => {
      let csvContent =
        "data:text/csv;charset=utf-8," +
        csvData.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "wired_mobile_data_v2.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    function updateUI(connected) {
      document.getElementById("btnConnect").style.display = connected
        ? "none"
        : "block";
      document.getElementById("btnConnectAll").style.display = connected
        ? "none"
        : "block";
      document.getElementById("btnDisconnect").style.display = connected
        ? "block"
        : "none";
      document.getElementById("btnDownload").style.display =
        !connected && csvData.length > 1 ? "block" : "none";
    }

    return () => {
      if (chart) chart.destroy();
    };
  }, []);
  return (
    <>
      <style>{`
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #ffffff; text-align: center; margin: 0; padding: 0; }
      header { background-color: #1e293b; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
      h1 { margin: 0; font-size: 1.2rem; color: #38bdf8; }
      .controls { padding: 15px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
      button { padding: 10px 20px; font-size: 0.9rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
      .btn-connect { background-color: #38bdf8; color: #000; }
      .btn-alt { background-color: #64748b; color: white; }
      .btn-stop { background-color: #f87171; color: #000; display: none; }
      .btn-download { background-color: #4ade80; color: #000; display: none; }
      .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 10px; max-width: 600px; margin: auto; }
      .card { background-color: #1e293b; padding: 15px; border-radius: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      .card-wide { grid-column: span 3; }
      .card-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; }
      .card-value { font-size: 1.3rem; font-weight: bold; margin: 5px 0; }
      .temp-val { color: #fbbf24; }
      .batt-val { color: #4ade80; }
      .ir-val { color: #a78bfa; font-family: monospace; font-size: 1rem; }
      .bpm-val { color: #f472b6; font-size: 1.6rem; }
      .bp-val { color: #60a5fa; font-size: 1.4rem; }
      .notch-yes { color: #4ade80; }
      .notch-no { color: #f87171; }
      .chart-container { position: relative; height: 300px; width: 95%; margin: auto; margin-top: 10px; }
      #status { font-size: 0.8rem; color: #64748b; margin-top: 5px; }
      #debug { font-size: 0.7rem; color: #f59e0b; margin-top: 5px; display:none; }
      `}</style>

      <header>
        <h1>ESP32 Wired Research V2</h1>
        <div id="status">Ready to Connect</div>
        <div id="debug"></div>
      </header>

      <div className="controls">
        <button
          id="btnConnect"
          className="btn-connect"
          onClick={() => window.connectSerial(true)}
        >
          Connect (Auto)
        </button>
        <button
          id="btnConnectAll"
          className="btn-alt"
          onClick={() => window.connectSerial(false)}
        >
          Connect (All)
        </button>
        <button
          id="btnDisconnect"
          className="btn-stop"
          onClick={() => window.disconnectSerial()}
        >
          Stop
        </button>
        <button
          id="btnDownload"
          className="btn-download"
          onClick={() => window.downloadCSV()}
        >
          Save CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="card card-wide">
          <div className="card-label">Blood Pressure (Est)</div>
          <div className="card-value bp-val">
            <span id="sbpDisp">--</span> / <span id="dbpDisp">--</span>
          </div>
        </div>

        <div className="card">
          <div className="card-label">Heart Rate</div>
          <div className="card-value bpm-val">
            <span id="bpmDisp">--</span>
          </div>
        </div>

        <div className="card">
          <div className="card-label">Notch Found</div>
          <div className="card-value">
            <span id="notchDisp">--</span>
          </div>
        </div>

        <div className="card">
          <div className="card-label">Temp</div>
          <div className="card-value temp-val">
            <span id="tempDisp">--</span>°C
          </div>
        </div>

        <div className="card">
          <div className="card-label">Battery</div>
          <div className="card-value batt-val">
            <span id="battDisp">--</span>V
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-label">Raw Signal</div>
          <div className="card-value ir-val">
            <span id="irDisp">--</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <canvas id="pulseChart"></canvas>
      </div>
    </>
  );
};

export default Monitor;
