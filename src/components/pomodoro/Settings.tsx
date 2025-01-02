import { XIcon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface ModalSettingProps {
  pomodoroRef: React.RefObject<HTMLInputElement>;
  shortBreakRef: React.RefObject<HTMLInputElement>;
  longBreakRef: React.RefObject<HTMLInputElement>;
  openSetting: boolean;
  setOpenSetting: (open: boolean) => void;
  updateTimeDefaultValue: () => void;
}

function ModalSetting({
  pomodoroRef,
  shortBreakRef,
  longBreakRef,
  openSetting,
  setOpenSetting,
  updateTimeDefaultValue,
}: ModalSettingProps) {
  const inputs = [
    {
      value: "Pomodoro",
      ref: pomodoroRef,
      defaultValue: 25,
    },
    {
      value: "Short Break",
      ref: shortBreakRef,
      defaultValue: 5,
    },
    {
      value: "Long Break",
      ref: longBreakRef,
      defaultValue: 10,
    },
  ];

  return (
    <>
      <div
        className={`absolute h-full w-full left-0 top-0 bg-black bg-opacity-30 ${
          openSetting ? "" : "hidden"
        }`}
        onClick={() => setOpenSetting(false)}
      ></div>
      <div
        className={`max-w-xl bg-black border border-primary/40 absolute sm:w-96 w-11/12 left-1/2 top-1/2 p-5 rounded-md ${
          openSetting ? "" : "hidden"
        }`}
        style={{
          transform: "translate(-50%,-50%)",
        }}
      >
        <div className="text-white flex justify-between items-center">
          <h1 className="uppercase font-bold tracking-wider">Time setting</h1>
          <XIcon onClick={() => setOpenSetting(false)} />
        </div>
        <div className="h-[2px] w-full bg-white mt-5 mb-5"></div>
        <div className="flex gap-5">
          {inputs.map((input, index) => {
            return (
              <div key={index}>
                <h1 className="text-white text-sm">{input.value}</h1>
                <input
                  defaultValue={input.defaultValue}
                  type="number"
                  className="w-full bg-gray-400 bg-opacity-30 py-2 rounded outline-none text-center"
                  ref={input.ref}
                />
              </div>
            );
          })}
        </div>
        <Button
          variant="default"
          size="lg"
          className="w-full mt-5"
          onClick={updateTimeDefaultValue}
        >
          Save
        </Button>
      </div>
    </>
  );
}

export default React.memo(ModalSetting);
