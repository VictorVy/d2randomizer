interface LockProps {
    onLock: (value: boolean) => void;
    defaultLocked?: boolean;
    disable?: boolean;
}

const Lock = ({ onLock, defaultLocked, disable }: LockProps) => {
    return (
        <label className="relative flex cursor-pointer select-none items-center" title="Lock randomization">
            <input
                type="checkbox"
                defaultChecked={defaultLocked}
                disabled={disable}
                className="peer sr-only"
                onChange={(e) => onLock(e.target.checked)}
            />
            <div className="group flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 bg-opacity-80 shadow transition-all duration-150 peer-checked:bg-black peer-checked:bg-opacity-50 peer-disabled:opacity-30">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute w-[0.9em] fill-black stroke-black opacity-[65%] transition-all duration-150 peer-checked:group-[]:opacity-0"
                >
                    <g>
                        <path
                            fillRule="evenodd"
                            d="M9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.3871 4.73025 15.7635 5.4372 15.9192 6.20001C16.0297 6.74114 16.5579 7.09026 17.099 6.97979C17.6401 6.86933 17.9893 6.34111 17.8788 5.79999C17.6452 4.65591 17.0807 3.59545 16.2426 2.75736C15.1174 1.63214 13.5913 1 12 1C10.4087 1 8.88258 1.63214 7.75736 2.75736C6.63214 3.88258 6 5.4087 6 7V10H5C3.34315 10 2 11.3431 2 13V20C2 21.6569 3.34315 23 5 23H19C20.6569 23 22 21.6569 22 20V13C22 11.3431 20.6569 10 19 10H8V7C8 5.93913 8.42143 4.92172 9.17157 4.17157ZM5 12C4.44772 12 4 12.4477 4 13V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V13C20 12.4477 19.5523 12 19 12H5Z"
                        />
                    </g>
                </svg>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute w-[0.9em] fill-white stroke-white opacity-0 duration-150 peer-checked:group-[]:opacity-[86%]"
                >
                    <g>
                        <path
                            fillRule="evenodd"
                            d="M6 10V7C6 5.4087 6.63214 3.88258 7.75736 2.75736C8.88258 1.63214 10.4087 1 12 1C13.5913 1 15.1174 1.63214 16.2426 2.75736C17.3679 3.88258 18 5.4087 18 7V10H19C20.6569 10 22 11.3431 22 13V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V13C2 11.3431 3.34315 10 5 10H6ZM9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V10H8V7C8 5.93913 8.42143 4.92172 9.17157 4.17157ZM5 12C4.44772 12 4 12.4477 4 13V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V13C20 12.4477 19.5523 12 19 12H5Z"
                        />
                    </g>
                </svg>
            </div>
        </label>
    );
};

export default Lock;
