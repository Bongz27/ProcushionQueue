import React, { useState } from "react";
import axios from "axios";
import { calculateETC } from "./utils/calculateETC";

const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:3000";

const AddOrder = () => {
    const [clientName, setClientName] = useState("");
    const [clientContact, setClientContact] = useState("");
    const [category, setCategory] = useState("New Mix");
    const [paintType, setPaintType] = useState("");
    const [colorCode, setColorCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ✅ Generate Unique Transaction ID
    const generateTransactionID = () => {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        return `TXN-${datePart}-${randomPart}`;
    };

    // ✅ Validate Contact Number (Only 10 digits)
    const validateContact = (input) => {
        return /^\d{10}$/.test(input);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        console.log("📝 Validating form input...");

        if (!validateContact(clientContact)) {
            alert("❌ Contact number must be exactly 10 digits!");
            setLoading(false);
            return;
        }

        if (paintType.trim() === "") {
            alert("❌ Paint Type cannot be empty!");
            setLoading(false);
            return;
        }

        const newTransactionID = generateTransactionID();
        console.log("✅ Generated Unique Transaction ID:", newTransactionID);

        const startTime = new Date().toISOString();
        const estimatedCompletionTime = new Date();
        estimatedCompletionTime.setMinutes(estimatedCompletionTime.getMinutes() + 40); // ✅ Fixed Estimated Completion Format

        const newOrder = {
            transaction_id: newTransactionID,
            client_name: clientName,
            client_contact: clientContact,
            paint_type: paintType,
            color_code: category === "New Mix" ? "Pending" : colorCode || "N/A",
            category,
            priority: "Standard",
            start_time: startTime,
            estimated_completion: estimatedCompletionTime.toISOString(), // ✅ Fixed Format
            current_status: "Waiting"
        };

        console.log("🚀 Sending order data:", newOrder);

        try {
            const response = await axios.post(`${BASE_URL}/api/orders`, newOrder, {
                headers: { "Content-Type": "application/json", Accept: "application/json" }
            });

            if (response.data?.transaction_id) {
                console.log("✅ Order added successfully:", response.data);
                setMessage("✅ Order added successfully!");
            } else {
                console.error("🚨 Error: Order data missing in response!", response.data);
                setMessage("🚨 Error adding order!");
            }

        } catch (error) {
            console.error("🚨 Error adding order:", error.message);
            setMessage("❌ Error adding order: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Add New Order</h2>
            <form onSubmit={handleSubmit}>
                <label>Client Name:</label>
                <input type="text" className="form-control" value={clientName} onChange={(e) => setClientName(e.target.value)} required />

                <label>Client Contact:</label>
                <input type="text" className="form-control" value={clientContact} onChange={(e) => setClientContact(e.target.value)} required />

                <label>Category:</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>New Mix</option>
                    <option>Reorder Mix</option>
                    <option>Colour Code</option>
                </select>

                <label>Paint Type:</label>
                <input type="text" className="form-control" value={paintType} onChange={(e) => setPaintType(e.target.value)} required />

                <label>Colour Code:</label>
                <input type="text" className="form-control" value={colorCode} onChange={(e) => setColorCode(e.target.value)} disabled={category === "New Mix"} />

                <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                    {loading ? "Submitting..." : "Add Order"}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddOrder;