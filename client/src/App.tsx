import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await fetch(API_URL);
    const { data, hash, signature } = await response.json();
    setData(data);
    setHash(hash);
    setSignature(signature);
  };

  const updateData = async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      await getData();
      Swal.fire("Success", "Data updated successfully", "success");
    } else {
      Swal.fire("Error", "Failed to update data", "error");
    }
  };

  const verifyData = async () => {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        body: JSON.stringify({ data, hash, signature }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const result = await response.json();
      console.log("Verification result:", result);
      Swal.fire("Verification Result", result.message, "success");
    } catch (error) {
      console.error("Error verifying data:", error);
      Swal.fire("Error", "Error verifying data", "error");
    }
  };

  const temperData = async () => {
    const response = await fetch(`${API_URL}/simulate-tampering`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Data tempering result:", result);
      Swal.fire("Data tempering result", result.message, "success");
    } else {
      Swal.fire("Error", "Failed to temper data", "error");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={temperData}>
          Temper Data
        </button>
      </div>
    </div>
  );
}

export default App;
