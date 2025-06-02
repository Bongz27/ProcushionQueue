import React, { useState } from "react";
import axios from "axios";

// Use relative URL for API (works on both local and production)
const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:3000";

const AddOrder = () => {
    const [transactionID, setTransactionID] = useState("");
    const [clientName, setClientName] = useState("");
    const [clientContact, setClientContact] = useState("");
    const [paintType, setPaintType] = useState("");
    const [colorCode, setColorCode] = useState("");
    const [category, setCategory] = useState("New Mix");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

       const newOrder = {  
            transaction_id: transactionID,  
            client_name: clientName,  // ✅ Fixes inconsistency with backend  
            client_contact: clientContact,  
            paint_type: paintType,  
            color_code: category === "New Mix" ? "Pending" : colorCode || "N/A",  // ✅ Fixes `color_code` casing  
            category,  
            start_time: new Date().toISOString(),  
            estimated_completion: "N/A",  
            current_status: "Waiting"  
        };

        try {
            const response = await axios.post(`${BASE_URL}/api/orders`, newOrder);
            if (response.data && response.data.transaction_id) {
                setMessage("✅ Order added successfully!");
                // Reset form
                setTransactionID("");
                setClientName("");
                setClientContact("");
                setPaintType("");
                setColorCode("");
                setCategory("New Mix");
            } else {
                setMessage("🚨 Error: Order data missing in response!");
            }
        } catch (error) {
            setMessage("🚨 Error adding order: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = transactionID && clientName && clientContact && paintType && category;

    return (
        <div>
            <h2>Add New Order</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" value={transactionID} onChange={(e) => setTransactionID(e.target.value)} placeholder="Transaction ID" required />
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" required />
                <input type="text" value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="Client Contact" required />
                <input type="text" value={paintType} onChange={(e) => setPaintType(e.target.value)} placeholder="Paint Type" required />
                <input type="text" value={colorCode} onChange={(e) => setColorCode(e.target.value)} placeholder="Color Code" />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="New Mix">New Mix</option>
                    <option value="Reorder Mix">Reorder Mix</option>
                    <option value="Colour Code">Colour Code</option>
                </select>
                <button type="submit" disabled={!isFormValid || loading}>
                    {loading ? "Submitting..." : "Submit Order"}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddOrder;