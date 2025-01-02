import { BellOff } from "lucide-react";
import React from "react";
import Navigation from "./navigation";
import { Button } from "../ui/button";

interface TimerProps {
  stage: number;
  switchStage: (index: number) => void;
  getTickingTime: () => number;
  seconds: number;
  ticking: boolean;
  startTimer: () => void;
  isTimeUp: boolean;
  muteAlarm: () => void;
  reset: () => void;
  setOpenSetting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Timer({
  stage,
  switchStage,
  getTickingTime,
  seconds,
  ticking,
  startTimer,
  isTimeUp,
  muteAlarm,
  reset,
  setOpenSetting,
}: TimerProps) {
  const options = ["Pomodoro", "Short Break", "Long Break"];
  return (
    <div className="mx-auto pt-5 text-white flex flex-col justify-center items-center w-[40rem] mt-10">
      <div className="flex gap-5 justify-between items-center w-full">
        {options.map((option, index) => {
          return (
            <h1
              key={index}
              className={`${
                index === stage ? "bg-gray-500 bg-opacity-30" : ""
              } p-3 cursor-pointer transition-all rounded text-center flex-1`}
              onClick={() => switchStage(index)}
            >
              {option}
            </h1>
          );
        })}
        <Navigation setOpenSetting={setOpenSetting} />
      </div>
      <div className="mt-10 mb-10">
        <h1 className="text-8xl font-bold select-none m-0">
          {getTickingTime()}:{seconds.toString().padStart(2, "0")}
        </h1>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center">
          <Button size="lg" variant="default" onClick={startTimer}>
            {ticking ? "Stop" : "Start"}
          </Button>
          {isTimeUp && (
            <BellOff
              className="text-3xl text-white cursor-pointer"
              onClick={muteAlarm}
            />
          )}
        </div>
        {ticking && (
          <Button
            size="lg"
            className=""
            variant="destructiveGhost"
            onClick={reset}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
