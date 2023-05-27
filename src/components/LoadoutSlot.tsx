interface LoadoutSlotProps {
    item?: any;
}

const LoadoutSlot = ({ item }: LoadoutSlotProps) => {
    return (
        <div className="relative rounded border-2 border-neutral-950 border-opacity-30 bg-black bg-opacity-25 shadow">
            {item ? (
                <>
                    <img src={"https://bungie.net" + item.icon} width={50} height={50} className="peer rounded" />
                    <span
                        className="absolute -top-[2.8em] left-1/2 min-w-max origin-bottom -translate-x-1/2 scale-0
                rounded bg-gray-900
                bg-opacity-80 px-2 py-1 text-[0.6em]
                font-semibold text-white
                shadow-md transition-all duration-100 ease-out peer-hover:scale-100"
                    >
                        {item.name}
                    </span>
                </>
            ) : (
                <svg
                    viewBox="0 0 24 24"
                    width="50"
                    height="50"
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
