import { useEffect, useState } from "react";
import Toggle from "./Toggle";

const ArmourSettings = () => {
    let [drop, setDrop] = useState(false);

    let [commons, setCommons] = useState(false);
    let [uncommons, setUncommons] = useState(false);
    let [rares, setRares] = useState(false);
    let [legendaries, setLegendaries] = useState(false);
    let [exotics, setExotics] = useState(false);
    let [ensureExotics, setEnsureExotics] = useState(false);

    useEffect(() => {
        localStorage.setItem("armour_commons", commons.toString());
        localStorage.setItem("armour_uncommons", uncommons.toString());
        localStorage.setItem("armour_rares", rares.toString());
        localStorage.setItem("armour_legendaries", legendaries.toString());
        localStorage.setItem("armour_exotics", exotics.toString());
        localStorage.setItem("armour_ensure_exotics", ensureExotics.toString());
    }, [commons, uncommons, rares, legendaries, exotics, ensureExotics]);

    return (
        <div className="flex flex-col space-y-2">
            <label className="peer flex h-[1.5em] max-w-min cursor-pointer flex-row rounded-full bg-black bg-opacity-30 pl-1 pr-2 text-xs text-white opacity-95 duration-300 hover:bg-opacity-50">
                <input type="checkbox" className="peer sr-only" onChange={(e) => setDrop(e.target.checked)} />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4 -rotate-90 fill-white duration-500 ease-out peer-checked:rotate-0"
                >
                    <path d="M24,27.2,13.4,16.6a1.9,1.9,0,0,0-3,.2,2.1,2.1,0,0,0,.2,2.7l12,11.9a1.9,1.9,0,0,0,2.8,0l12-11.9a2.1,2.1,0,0,0,.2-2.7,1.9,1.9,0,0,0-3-.2Z" />
                </svg>
                Armour
            </label>
            <div
                className={
                    "flex origin-top flex-col space-y-2 rounded bg-black bg-opacity-10 p-3 duration-500" +
                    (drop ? " opacity-100" : " -translate-y-2 opacity-0")
                }
            >
                <Toggle text="Commons" onChange={setCommons} />
                <Toggle text="Uncommons" onChange={setUncommons} />
                <Toggle text="Rares" onChange={setRares} />
                <Toggle text="Legendaries" onChange={setLegendaries} />
                <Toggle text="Exotics" onChange={setExotics} />
                <Toggle text="Ensure exotic" onChange={setEnsureExotics} disabled={!exotics} />
            </div>
        </div>
    );
};

export default ArmourSettings;
