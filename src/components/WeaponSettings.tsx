import { useState } from "react";
import Toggle from "./Toggle";

function setCommons(b: boolean) {
    localStorage.setItem("weapon_commons", b.toString());
}
function setUncommons(b: boolean) {
    localStorage.setItem("weapon_uncommons", b.toString());
}
function setRares(b: boolean) {
    localStorage.setItem("weapon_rares", b.toString());
}
function setLegendaries(b: boolean) {
    localStorage.setItem("weapon_legendaries", b.toString());
}
function setEnsureExotics(b: boolean) {
    localStorage.setItem("weapon_ensure_exotics", b.toString());
}

function setInVault(b: boolean) {
    localStorage.setItem("weapon_in_vault", b.toString());
}
function setInInventory(b: boolean) {
    localStorage.setItem("weapon_in_inventory", b.toString());
}
function setEquipped(b: boolean) {
    localStorage.setItem("weapon_equipped", b.toString());
}

localStorage.setItem("weapon_commons", "false");
localStorage.setItem("weapon_uncommons", "false");
localStorage.setItem("weapon_rares", "false");
localStorage.setItem("weapon_legendaries", "true");
localStorage.setItem("weapon_exotics", "true");
localStorage.setItem("weapon_ensure_exotics", "true");

localStorage.setItem("weapon_in_vault", "true");
localStorage.setItem("weapon_in_inventory", "true");
localStorage.setItem("weapon_equipped", "true");

const WeaponSettings = () => {
    const logged = localStorage.getItem("access_token") !== null;

    let [drop, setDrop] = useState(false);

    let [exoticsEnabled, setExoticsEnabled] = useState(true);

    function setExotics(b: boolean) {
        localStorage.setItem("weapon_exotics", b.toString());
        setExoticsEnabled(b);
    }

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
                    "grid origin-top grid-cols-2 rounded bg-black bg-opacity-10 pb-3 pr-3 pt-3 duration-500" +
                    (drop ? "" : " invisible -translate-y-2 opacity-0")
                }
            >
                <div className="space-y-3">
                    <Toggle
                        text="Vault"
                        forWeapons={true}
                        onChange={setInVault}
                        defaultCheck={logged}
                        disabled={!logged}
                    />
                    <Toggle
                        text="Inventory"
                        forWeapons={true}
                        onChange={setInInventory}
                        defaultCheck={logged}
                        disabled={!logged}
                    />
                    <Toggle
                        text="Equipped"
                        forWeapons={true}
                        onChange={setEquipped}
                        defaultCheck={logged}
                        disabled={!logged}
                    />
                </div>
                <div className="space-y-3">
                    <Toggle text="Commons" forWeapons={true} onChange={setCommons} />
                    <Toggle text="Uncommons" forWeapons={true} onChange={setUncommons} />
                    <Toggle text="Rares" forWeapons={true} onChange={setRares} />
                    <Toggle text="Legendaries" forWeapons={true} onChange={setLegendaries} defaultCheck={true} />
                    <Toggle text="Exotics" forWeapons={true} onChange={setExotics} defaultCheck={true} />
                    <Toggle
                        text="Ensure exotic"
                        forWeapons={true}
                        onChange={setEnsureExotics}
                        disabled={!exoticsEnabled}
                        defaultCheck={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default WeaponSettings;
