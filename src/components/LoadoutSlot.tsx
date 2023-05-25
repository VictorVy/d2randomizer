interface LoadoutSlotProps {
    source?: string;
}

const LoadoutSlot = ({ source }: LoadoutSlotProps) => {
    return (
        <div className="bg-black bg-opacity-25">
            {source ? (
                <img src={source} />
            ) : (
                <svg
                    viewBox="0 0 24 24"
                    width="44"
                    height="44"
                    stroke="white"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
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
