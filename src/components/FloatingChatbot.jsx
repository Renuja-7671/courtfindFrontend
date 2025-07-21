import React, { useState } from "react";
import { Button, Modal, Form, InputGroup } from "react-bootstrap";
import { BsRobot } from "react-icons/bs";
import { sendMessageToChatbot } from "../services/chatbotService"; 

const FloatingChatbot = () => {
    const [show, setShow] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState("");

    const toggleChatbot = () => setShow(!show);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userMessage.trim()) return;

        const newMessages = [...messages, { text: userMessage, sender: "user" }];
        setMessages(newMessages);
        setUserMessage("");

        try {
            const response = await sendMessageToChatbot(userMessage);
            setMessages([...newMessages, { text: response.reply, sender: "bot" }]);
        } catch (error) {
            setMessages([...newMessages, { text: "Error fetching response", sender: "bot" }]);
        }
    };

    return (
        <>
            {/* Floating Chat Icon */}
            <div className="chatbot-container" onClick={toggleChatbot}>
                <span className="chatbot-text">Need Help?</span>
                <Button variant="primary" className="chatbot-btn">
                    <BsRobot size={24} />
                </Button>
            </div>

            {/* Chatbot Modal */}
            <Modal show={show} onHide={toggleChatbot} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chat with COURTFIND</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="chat-container">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <Form onSubmit={handleSendMessage}>
                        <InputGroup className="mt-2">
                            <Form.Control
                                type="text"
                                placeholder="Type a message..."
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                            />
                            <Button variant="primary" type="submit">
                                Send
                            </Button>
                        </InputGroup>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Floating Chatbot Styles */}
            <style>{`

                .chatbot-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    z-index: 1000;
                }
                .chatbot-btn {
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.9);
                }
                .chatbot-text {
                    background-color: white;
                    color: #333;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.8);
                    transition: opacity 0.3s ease-in-out;
                }
                .chatbot-container:hover .chatbot-text {
                    opacity: 1;
                }
                .chat-container {
                    max-height: 500px;
                    overflow-y: auto;
                    padding: 10px;
                }
                .chat-message {
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    border-radius: 12px;
                    max-width: 75%;
                }
                .user {
                    background-color: #007bff;
                    text-align: right;
                    color: white;
                    align-self: flex-end;
                }
                .bot {
                    background-color: #f1f1f1;
                    align-self: flex-start;
                }
            `}</style>
        </>
    );
};

export default FloatingChatbot;
