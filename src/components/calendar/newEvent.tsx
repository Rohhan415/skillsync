import React from "react";
import CustomDialogTrigger from "../global/custom-dialog";
import EventForm from "./EventForm";

interface EventsProps {
  children: React.ReactNode;
  className: string;
}

const NewEvent: React.FC<EventsProps> = ({ children, className }) => {
  return (
    <CustomDialogTrigger
      header="Create an Event!"
      className={className}
      content={<EventForm />}
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default NewEvent;
