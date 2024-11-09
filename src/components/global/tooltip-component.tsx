import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";

interface TooltipComponentProps {
  children: React.ReactNode;
  message: string;
}

const TooltipComponent: React.FC<TooltipComponentProps> = ({
  children,
  message,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children} </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipComponent;