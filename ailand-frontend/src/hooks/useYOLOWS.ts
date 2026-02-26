"use client";

import { useEffect, useRef, useState } from "react";

export type Detection = {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
};

export function useYOLOWS(url: string, enabled: boolean) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (Array.isArray(data)) setDetections(data);
    };

    return () => ws.close();
  }, [url, enabled]);

  const sendFrame = (base64: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "frame",
          image: base64,
        })
      );
    }
  };

  const setTexts = (texts: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "set_texts",
          texts,
        })
      );
    }
  };

  return { connected, detections, sendFrame, setTexts };
}
