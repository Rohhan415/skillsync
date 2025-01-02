"use client";

import Alarm from "@/components/pomodoro/alarm";
import Settings from "@/components/pomodoro/Settings";
import Timer from "@/components/pomodoro/Timer";
import React, { useCallback, useEffect, useRef, useState } from "react";

export const Pomodoro = () => {
  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(10);
  const [seconds, setSecond] = useState(0);
  const [stage, setStage] = useState(0);
  const [consumedSecond, setConsumedSecond] = useState(0);
  const [ticking, setTicking] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);

  const alarmRef = useRef<HTMLAudioElement>(null);
  const pomodoroRef = useRef<HTMLInputElement>(null);
  const shortBreakRef = useRef<HTMLInputElement>(null);
  const longBreakRef = useRef<HTMLInputElement>(null);

  const updateTimeDefaultValue = useCallback(() => {
    if (!pomodoroRef.current || !shortBreakRef.current || !longBreakRef.current)
      return;

    setPomodoro(Number(pomodoroRef.current.value));
    setShortBreak(Number(shortBreakRef.current.value));
    setLongBreak(Number(longBreakRef.current.value));
    setOpenSetting(false);
    setSecond(0);
    setConsumedSecond(0);
  }, []);

  const switchStage = (index: React.SetStateAction<number>) => {
    const isYes =
      consumedSecond && stage !== index
        ? confirm("Are you sure you want to switch?")
        : false;
    if (isYes) {
      reset();
      setStage(index);
    } else if (!consumedSecond) {
      setStage(index);
    }
  };

  const getTickingTime = useCallback(() => {
    const timeStage = {
      0: pomodoro,
      1: shortBreak,
      2: longBreak,
    };
    return timeStage[stage as keyof typeof timeStage];
  }, [pomodoro, shortBreak, longBreak, stage]);
  const updateMinute = useCallback(() => {
    const updateStage = {
      0: setPomodoro,
      1: setShortBreak,
      2: setLongBreak,
    };
    return updateStage[stage as keyof typeof updateStage];
  }, [stage]);

  const reset = useCallback(() => {
    setConsumedSecond(0);
    setTicking(false);
    setSecond(0);
    updateTimeDefaultValue();
  }, [updateTimeDefaultValue]);

  const timeUp = useCallback(() => {
    reset();
    setIsTimeUp(true);
    alarmRef.current?.play();
  }, [reset]);

  const clockTicking = useCallback(() => {
    const minutes = getTickingTime();
    const setMinutes = updateMinute();

    if (minutes === 0 && seconds === 0) {
      timeUp();
    } else if (seconds === 0) {
      setMinutes((minute) => minute - 1);
      setSecond(59);
    } else {
      setSecond((second) => second - 1);
    }
  }, [getTickingTime, updateMinute, seconds, timeUp]);
  const muteAlarm = () => {
    alarmRef.current?.pause();
    if (alarmRef.current) {
      alarmRef.current.currentTime = 0;
    }
  };

  const startTimer = () => {
    setIsTimeUp(false);
    muteAlarm();
    setTicking((ticking) => !ticking);
  };

  useEffect(() => {
    window.onbeforeunload = () => {
      return consumedSecond ? "Show waring" : null;
    };

    const timer = setInterval(() => {
      if (ticking) {
        setConsumedSecond((value) => value + 1);
        clockTicking();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    seconds,
    pomodoro,
    shortBreak,
    longBreak,
    ticking,
    consumedSecond,
    clockTicking,
  ]);

  return (
    <div className="bg-background flex-1 flex  justify-center mx-auto font-inter">
      <div className=" flex flex-col  ">
        <Timer
          stage={stage}
          switchStage={switchStage}
          getTickingTime={getTickingTime}
          seconds={seconds}
          ticking={ticking}
          startTimer={startTimer}
          muteAlarm={muteAlarm}
          isTimeUp={isTimeUp}
          reset={reset}
          setOpenSetting={setOpenSetting}
        />

        <Alarm ref={alarmRef} />
        <Settings
          openSetting={openSetting}
          setOpenSetting={setOpenSetting}
          pomodoroRef={pomodoroRef}
          shortBreakRef={shortBreakRef}
          longBreakRef={longBreakRef}
          updateTimeDefaultValue={updateTimeDefaultValue}
        />
      </div>
    </div>
  );
};
