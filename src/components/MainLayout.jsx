import React from "react";
import NavigationBar from "./Navbar";
import Footer from "./Footer";
import FloatingChatbot from "./FloatingChatbot";

const MainLayout = ({ children }) => {
    return (
        <>
            <NavigationBar />
            <div className="content">
                {children}
                <FloatingChatbot />
            </div>
            <Footer />
        </>
    );
};

export default MainLayout;
