import { useState } from "react";

const WeaponSettings = () => {
    let [drop, setDrop] = useState(false);

    return (
        <div className="flex flex-col items-end space-y-2">
            <label className="peer flex h-[1.5em] max-w-min cursor-pointer flex-row rounded-full bg-black bg-opacity-30 pl-2 pr-1 text-xs text-white opacity-95 duration-300 hover:bg-opacity-50">
                <input type="checkbox" className="peer sr-only" onChange={(e) => setDrop(e.target.checked)} />
                Weapons
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4 rotate-90 fill-white duration-500 ease-out peer-checked:rotate-0"
                >
                    <path d="M24,27.2,13.4,16.6a1.9,1.9,0,0,0-3,.2,2.1,2.1,0,0,0,.2,2.7l12,11.9a1.9,1.9,0,0,0,2.8,0l12-11.9a2.1,2.1,0,0,0,.2-2.7,1.9,1.9,0,0,0-3-.2Z" />
                </svg>
            </label>
            <div
                className={
                    "flex origin-top flex-col rounded bg-black bg-opacity-10 px-2 py-1 duration-500" +
                    (drop ? " opacity-100" : " -translate-y-2 opacity-0")
                }
            >
                Bruh
            </div>
        </div>
    );
};

export default WeaponSettings;
