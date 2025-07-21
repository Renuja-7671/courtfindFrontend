import React, { useState } from "react";
import { sendMessageToChatbot } from "../services/chatbotService";
import { Container, Form, Button, Card } from "react-bootstrap";
import { BsRobot } from "react-icons/bs";


const Chatbot = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setChat([...chat, userMessage]);

        try {
            const response = await sendMessageToChatbot(message);
            const botMessage = { sender: "bot", text: response.reply };
            setChat([...chat, userMessage, botMessage]);
        } catch (error) {
            console.error("Chatbot Error:", error);
        }

        setMessage("");
    };

    return (
        <Container className="mt-4">
            <Card style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
                <h4><BsRobot size={35} />  COURTFIND Helping Bot</h4>
                <strong><p>Need help with something? Just ask me-----</p></strong> 
                <div style={{ height: "300px", overflowY: "auto", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                    {chat.map((msg, index) => (
                        <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "10px 0" }}>
                            <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong> {msg.text}
                        </div>
                    ))}
                </div>
                <Form.Group className="mt-3">
                    <Form.Control
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                </Form.Group>
                <Button className="mt-2" onClick={handleSendMessage} variant="primary">
                    Send
                </Button>
            </Card>
        </Container>
    );
};

export default Chatbot;
