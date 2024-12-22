import { useEffect, useState } from "react";

interface TimerProps {
  workTime: number;
  breakTime: number;
}

export default function Timer({ workTime, breakTime }: TimerProps) {
  const [time, setTime] = useState(workTime * 60);
  const [isWorkInterval, setIsWorkInterval] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            setIsWorkInterval(!isWorkInterval);
            return isWorkInterval ? breakTime * 60 : workTime * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isWorkInterval, workTime, breakTime]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(workTime * 60);
    setIsWorkInterval(true);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div
      className={`w-full max-w-md p-8 rounded-xl text-center ${
        isWorkInterval ? "bg-red-200" : "bg-green-200"
      } transition-all duration-500`}
    >
      <h2 className="text-xl font-medium mb-4">
        {isWorkInterval ? "Work Time" : "Break Time"}
      </h2>
      <div className="text-5xl font-bold mb-6">
        {`${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`}
      </div>
      <div className="flex justify-center gap-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={toggleTimer}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
