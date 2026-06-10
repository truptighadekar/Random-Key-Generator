import React, { useState, useCallback, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./index.css";

function App() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [savedPasswords, setSavedPasswords] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("passwords")) || [];
    setSavedPasswords(data);
  }, []);

  // ✅ FIXED Password Strength Logic
  const getStrength = (pass) => {
    if (!pass || pass.length < 4) {
      return { level: 0, color: "#ff4444", text: "Weak" };
    }

    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) {
      return { level: 1, color: "#ff4444", text: "Weak" };
    } else if (score <= 4) {
      return { level: 2, color: "#ff9800", text: "Medium" };
    } else {
      return { level: 3, color: "#4caf50", text: "Strong" };
    }
  };

  const strength = getStrength(password);

  const generatePassword = useCallback(() => {
    let chars = "";
    if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+{}[]<>?/-=";

    if (chars === "") {
      setPassword("Select at least one option!");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(result);
  }, [length, upper, lower, numbers, symbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    showToast("✅ Password Copied!");
  };

  const savePassword = () => {
    if (!password) return;
    const updated = [password, ...savedPasswords];
    setSavedPasswords(updated);
    localStorage.setItem("passwords", JSON.stringify(updated));
    showToast("💾 Password Saved!");
  };

  const deletePassword = (index) => {
    const updated = savedPasswords.filter((_, i) => i !== index);
    setSavedPasswords(updated);
    localStorage.setItem("passwords", JSON.stringify(updated));
  };

  const downloadTxt = () => {
    const file = new Blob([password], { type: "text/plain" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = "my-password.txt";
    element.click();
    showToast("📄 TXT Downloaded");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Generated Password", 20, 20);
    doc.setFontSize(14);
    doc.text(password, 20, 35);
    doc.save("password.pdf");
    showToast("📕 PDF Downloaded");
  };

  return (
    <div className={darkMode ? "container dark" : "container"}>
      <div className="card">

        <h1>Random Key Generator 🔐</h1>

        <div className="mode-toggle-container">
          <button className="toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? " 🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        <div className="length-container">
          <label>Length: <strong>{length}</strong></label>
          <input
            type="range"
            min="4"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
        </div>

        <div className="options">
          <label><input type="checkbox" checked={upper} onChange={() => setUpper(!upper)} /> Uppercase</label>
          <label><input type="checkbox" checked={lower} onChange={() => setLower(!lower)} /> Lowercase</label>
          <label><input type="checkbox" checked={numbers} onChange={() => setNumbers(!numbers)} /> Numbers</label>
          <label><input type="checkbox" checked={symbols} onChange={() => setSymbols(!symbols)} /> Symbols</label>
        </div>

        <div className="output-container">
          <div className="output">
            {showPassword ? password : "••••••••••••••"}
          </div>

          {password && (
            <>
              <div className="strength-bar">
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${(strength.level / 3) * 100}%`, 
                    backgroundColor: strength.color 
                  }}
                ></div>
              </div>
              <p style={{ 
                textAlign: "center", 
                fontSize: "15px", 
                fontWeight: "700", 
                color: strength.color,
                marginTop: "8px"
              }}>
                {strength.text}
              </p>
            </>
          )}
        </div>

        <div className="buttons">
          <button className="btn generate" onClick={generatePassword}>Generate New</button>
          <button className="btn copy" onClick={copyToClipboard}>📋 Copy</button>
          <button className="btn save" onClick={savePassword}>💾 Save</button>
          <button className="btn download" onClick={downloadTxt}>TXT</button>
          <button className="btn pdf" onClick={downloadPDF}>PDF</button>
          <button className="btn" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "👁️ Show" : "🙈 Hide"}
          </button>
        </div>

        {savedPasswords.length > 0 && (
          <>
            <h3 style={{ marginTop: "25px", marginBottom: "10px" }}>Saved Passwords</h3>
            {savedPasswords.map((item, index) => (
              <div key={index} className="saved-item">
                <span>{item}</span>
                <button className="delete-btn" onClick={() => deletePassword(index)}>🗑️</button>
              </div>
            ))}
          </>
        )}

      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;