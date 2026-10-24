"use client";

import { useState, useEffect } from "react";

export default function IranClock() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    let offsetSeconds = 0;
    let initialSync = false;

    // 1. Fetch accurate time from API
    fetch("https://worldtimeapi.org/api/timezone/Asia/Tehran")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.datetime) {
          const iranTime = new Date(data.datetime);
          const localTime = new Date();
          offsetSeconds = (iranTime.getTime() - localTime.getTime()) / 1000;
          initialSync = true;
          updateClock();
        }
      })
      .catch(() => {
         initialSync = true;
         updateClock();
      });

    const updateClock = () => {
      if (!initialSync) return;
      
      const now = new Date();
      const iranDate = new Date(now.getTime() + offsetSeconds * 1000);

      const timeString = iranDate.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      setTime(timeString);

      const weekday = iranDate.toLocaleDateString("fa-IR", { weekday: "long" });
      const day = iranDate.toLocaleDateString("fa-IR", { day: "numeric" });
      const month = iranDate.toLocaleDateString("fa-IR", { month: "long" });
      const year = iranDate.toLocaleDateString("fa-IR", { year: "numeric" });

      const formattedDate = `${weekday} ، ${day} ${month} ${year}`;
      setDate(formattedDate);
    };

    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!time || !date) return null;

  return (
    // Using a fixed width or min-width and text-right ensures the text block is flush right
    <div className="hidden lg:flex flex-col min-w-[150px] ml-4 border-r border-border pr-4" dir="rtl">
      <div className="text-right w-full">
        <span className="text-sm font-bold text-foreground leading-tight block">{time}</span>
        <span className="text-sm font-bold text-muted leading-tight block mt-1">{date}</span>
      </div>
    </div>
  );
}