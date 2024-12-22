"use client";

import { useState } from "react";
import Timer from "@/components/pomodoro/Timer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Pomodoro() {
  const [workTime, setWorkTime] = useState<number>(25);
  const [breakTime, setBreakTime] = useState<number>(5);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-8">Pomodoro Timer</h1>

      <div className="flex gap-4 mb-6">
        <div className="flex flex-col items-center">
          <label className="mb-2">Work Interval (min)</label>
          <Input
            type="number"
            value={workTime}
            onChange={(e) => setWorkTime(Number(e.target.value))}
            className="w-20"
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="mb-2">Break Interval (min)</label>
          <Input
            type="number"
            value={breakTime}
            onChange={(e) => setBreakTime(Number(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      <Timer workTime={workTime} breakTime={breakTime} />

      <Button variant="secondary" className="mt-8">
        Reset
      </Button>
    </div>
  );
}
