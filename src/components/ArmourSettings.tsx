import { useEffect, useState } from "react";
import Toggle from "./Toggle";

const ArmourSettings = () => {
    const logged = localStorage.getItem("access_token") !== null;

    let [drop, setDrop] = useState(false);

    let [commons, setCommons] = useState(false);
    let [uncommons, setUncommons] = useState(false);
    let [rares, setRares] = useState(false);
    let [legendaries, setLegendaries] = useState(true);
    let [exotics, setExotics] = useState(true);
    let [ensureExotics, setEnsureExotics] = useState(true);

    let [inVault, setInVault] = useState(logged);
    let [inInventory, setInInventory] = useState(logged);
    let [equipped, setEquipped] = useState(logged);

    useEffect(() => {
        localStorage.setItem("armour_commons", commons.toString());
        localStorage.setItem("armour_uncommons", uncommons.toString());
        localStorage.setItem("armour_rares", rares.toString());
        localStorage.setItem("armour_legendaries", legendaries.toString());
        localStorage.setItem("armour_exotics", exotics.toString());
        localStorage.setItem("armour_ensure_exotics", ensureExotics.toString());

        localStorage.setItem("armour_in_vault", inVault.toString());
        localStorage.setItem("armour_in_inventory", inInventory.toString());
        localStorage.setItem("armour_equipped", equipped.toString());
    }, [commons, uncommons, rares, legendaries, exotics, ensureExotics, inVault, inInventory, equipped]);

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
                    "grid origin-top grid-cols-2 space-x-4 rounded bg-black bg-opacity-10 p-3 duration-500" +
                    (drop ? " opacity-100" : " -translate-y-2 opacity-0")
                }
            >
                <div className="space-y-3">
                    <Toggle text="Commons" onChange={setCommons} />
                    <Toggle text="Uncommons" onChange={setUncommons} />
                    <Toggle text="Rares" onChange={setRares} />
                    <Toggle text="Legendaries" onChange={setLegendaries} defaultCheck={true} />
                    <Toggle text="Exotics" onChange={setExotics} defaultCheck={true} />
                    <Toggle text="Ensure exotic" onChange={setEnsureExotics} disabled={!exotics} defaultCheck={true} />
                </div>
                <div className="space-y-3">
                    <Toggle text="Vault" onChange={setInVault} defaultCheck={logged} disabled={!logged} />
                    <Toggle text="Inventory" onChange={setInInventory} defaultCheck={logged} disabled={!logged} />
                    <Toggle text="Equipped" onChange={setEquipped} defaultCheck={logged} disabled={!logged} />
                </div>
            </div>
        </div>
    );
};

export default ArmourSettings;
