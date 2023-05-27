import { ReactNode } from "react";

interface TooltipProps {
    children: ReactNode;
}

const Tooltip = ({ children }: TooltipProps) => {
    return (
        <span
            className="absolute -top-[2.8em] left-1/2 min-w-max origin-bottom -translate-x-1/2 scale-0
rounded bg-gray-900
bg-opacity-80 px-2 py-1 text-[0.6em]
font-semibold text-white
shadow-md transition-all duration-100 ease-out peer-hover:scale-100"
        >
            {children}
        </span>
    );
};

export default Tooltip;
