import Tooltip from "./Tooltip";

interface LoadoutSlotProps {
    item?: any;
}

const LoadoutSlot = ({ item }: LoadoutSlotProps) => {
    return (
        <div className="relative rounded border-2 border-neutral-950 border-opacity-30 bg-black bg-opacity-25 shadow">
            {item ? (
                <>
                    <img src={"https://bungie.net" + item.icon} width={44} height={44} className="peer rounded" />
                    <Tooltip>{item.name}</Tooltip>
                </>
            ) : (
                <svg
                    viewBox="0 0 24 24"
                    width="44"
                    height="44"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    className="opacity-50"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            )}
        </div>
    );
};

export default LoadoutSlot;
