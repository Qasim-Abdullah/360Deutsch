import { useState, useEffect, useRef } from "react";
export interface Msg {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    attachment?: string;
}

export function useChatWidget() {
    const userData = { id: "dummy-user-123", name: "Guest User" };
    const [isWindowOpen, setisWindowOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Msg[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Welcome to the AI-Powered 360° Assistant. How can I assist you?",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachment, setAttachment] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [size, setSize] = useState({ width: 400, height: 600 });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const userFileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isResizingRef = useRef(false);

    useEffect(() => {
        if (isWindowOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isWindowOpen]);
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current) return;
            const newWidth = window.innerWidth - e.clientX - 24;
            const newHeight = window.innerHeight - e.clientY - 24;
            if (newWidth > 320 && newWidth < 800) setSize(prev => ({ ...prev, width: newWidth }));
            if (newHeight > 400 && newHeight < window.innerHeight - 50) setSize(prev => ({ ...prev, height: newHeight }));
        };

        const handleMouseUp = () => {
            isResizingRef.current = false;
            document.body.style.cursor = "default";
        };

        if (isWindowOpen) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isWindowOpen]);

    const startResize = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        document.body.style.cursor = "nwse-resize";
    };

    const handleSend = async () => {
        if (!input.trim() && !attachment) return;

        const userMsg: Msg = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
            attachment: attachment || undefined
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setAttachment(null);
        setIsTyping(true);

        try {
            const response = await fetch("http://localhost:8005/chat/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: userData.id.toString(),
                    message: userMsg.content,
                    image: userMsg.attachment
                }),
            });

            const data = await response.json();
            const aiMsg: Msg = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.message,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMsg]);

            if (data.debug) {
                const intent = data.debug.step_1_intent || "Unknown";
                const routing = data.debug.step_2_routing || "Default";
                const debugMsg: Msg = {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    content: `🔍 [Debug]: Intent: ${intent} | Routing: ${routing}`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, debugMsg]);
            }

        } catch (error: any) {
            console.error("Error:", error);
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Error connecting to AI.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    
   
   

    
   

    return {
        isWindowOpen, setisWindowOpen,
        input, setInput,
        messages, setMessages,
        isTyping,
        isRecording,
        attachment, setAttachment,
        showCamera, setShowCamera,
        size,
        messagesEndRef,
        userFileInputRef,
        videoRef,
        canvasRef,
        startResize,
        handleSend,
       
      
    };
}
