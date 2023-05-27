import { useEffect, useState } from "react";
import ClassRadio from "./ClassRadio";
import LoadoutSlot from "./LoadoutSlot";
import Lock from "./Lock";
import SubclassRadio from "./SubclassRadio";
import Dexie, { IndexableType } from "dexie";

const db = new Dexie("D2Randomizer");
db.version(1).stores({
    weapons: "hash, name, type, tier, slot, ammoType, icon",
    titan_armour: "hash, name, type, tier, slot, icon",
    hunter_armour: "hash, name, type, tier, slot, icon",
    warlock_armour: "hash, name, type, tier, slot, icon",
    subclasses: "hash, name, element, icon",
});

const weapons = db.table("weapons");
const titan_armour = db.table("titan_armour");
const hunter_armour = db.table("hunter_armour");
const warlock_armour = db.table("warlock_armour");

const Randomizer = () => {
    const TITAN: number = 0;
    const HUNTER: number = 1;
    // const WARLOCK: number = 2;

    const SOLAR = 0;
    const VOID = 1;
    const ARC = 2;
    const STASIS = 3;
    const STRAND = 4;

    const SLOT_HASHES: string[] = [
        localStorage.getItem("kinetic_hash")!,
        localStorage.getItem("energy_hash")!,
        localStorage.getItem("power_hash")!,
        localStorage.getItem("helmet_hash")!,
        localStorage.getItem("gauntlets_hash")!,
        localStorage.getItem("chest_hash")!,
        localStorage.getItem("boots_hash")!,
    ];

    let tmpSlotItems: any[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    const [slotItems, setSlotItems] = useState(tmpSlotItems);

    let [selectedClass, setSelectedClass] = useState(1);
    let [selectedSubclass, setSelectedSubclass] = useState(0);

    let [classLocked, setClassLocked] = useState(false);
    let [subclassLocked, setSubclassLocked] = useState(false);

    const SLOTS_LOCKED = [false, false, false, false, false, false, false];

    const chooseWeapon = (slotHash: string, rarity: string) =>
        new Promise((resolve) => {
            weapons
                .where("slot")
                .equals(parseInt(slotHash))
                .and((weapon) =>
                    rarity.startsWith("!") ? weapon.tier !== rarity.substring(1) : weapon.tier === rarity
                )
                .and((weapon) => weapon.class_type === selectedClass || weapon.class_type === 3)
                .toArray()
                .then((exoticWeapons) => {
                    const randomIndex = Math.floor(Math.random() * exoticWeapons.length);
                    const chosenExotic = exoticWeapons[randomIndex];

                    resolve(chosenExotic);
                });
        });

    const chooseArmour = (slotHash: string, rarity: string) =>
        new Promise((resolve) => {
            let armourTable: Dexie.Table<any, IndexableType>;

            console.log("resolved ", selectedClass);

            switch (selectedClass) {
                case TITAN:
                    armourTable = titan_armour;
                    break;
                case HUNTER:
                    armourTable = hunter_armour;
                    break;
                default:
                    armourTable = warlock_armour;
                    break;
            }

            armourTable
                .where("slot")
                .equals(parseInt(slotHash))
                .and((armour) =>
                    rarity.startsWith("!") ? armour.tier !== rarity.substring(1) : armour.tier === rarity
                )
                .toArray()
                .then((exoticArmour) => {
                    const randomIndex = Math.floor(Math.random() * exoticArmour.length);
                    const chosenExotic = exoticArmour[randomIndex];

                    resolve(chosenExotic);
                });
        });

    async function randomize() {
        if (!classLocked) {
            const tmp = Math.floor(Math.random() * 3);
            setSelectedClass(tmp);
            console.log(selectedClass);
        }
        if (!subclassLocked) {
            setSelectedSubclass(Math.floor(Math.random() * 5));
        }

        const exoticWeaponSlot = Math.floor(Math.random() * 3);
        const exoticArmourSlot = Math.floor(Math.random() * 4) + 3;

        tmpSlotItems = [undefined, undefined, undefined, undefined, undefined, undefined, undefined];

        tmpSlotItems[exoticWeaponSlot] = await chooseWeapon(SLOT_HASHES[exoticWeaponSlot], "Exotic");
        tmpSlotItems[exoticArmourSlot] = await chooseArmour(SLOT_HASHES[exoticArmourSlot], "Exotic");

        for (let i = 0; i < 3; i++) {
            if (i !== exoticWeaponSlot) {
                tmpSlotItems[i] = await chooseWeapon(SLOT_HASHES[i], "!Exotic");
            }
        }
        for (let i = 3; i < 7; i++) {
            if (i !== exoticArmourSlot) {
                tmpSlotItems[i] = await chooseArmour(SLOT_HASHES[i], "!Exotic");
            }
        }
    }

    return (
        <div className="flex flex-col items-center gap-8 p-12">
            <div className="relative">
                <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                    <Lock onLock={setClassLocked} />
                </div>
                <ClassRadio selected={selectedClass} handleChange={setSelectedClass} />
            </div>
            <div className="relative">
                <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                    <Lock onLock={setSubclassLocked} />
                </div>
                <SubclassRadio
                    selectedClass={selectedClass}
                    selectedElement={selectedSubclass}
                    handleChange={setSelectedSubclass}
                />
            </div>
            <div className="bg-red my-4 grid grid-cols-2 gap-x-20 gap-y-8">
                <LoadoutSlot item={slotItems[0]} /> {/* kinetic weapon */}
                <LoadoutSlot item={slotItems[3]} /> {/* helmet */}
                <LoadoutSlot item={slotItems[1]} /> {/* energy weapon */}
                <LoadoutSlot item={slotItems[4]} /> {/* gauntlets */}
                <LoadoutSlot item={slotItems[2]} /> {/* power weapon */}
                <LoadoutSlot item={slotItems[5]} /> {/* chest */}
                <div />
                <LoadoutSlot item={slotItems[6]} /> {/* boots */}
            </div>
            <button
                className="rounded border-b-2 border-black bg-gray-900 px-4 py-2 font-semibold text-white shadow-md hover:border-gray-900 hover:bg-gray-800"
                onClick={() => randomize().then(() => setSlotItems(tmpSlotItems))}
            >
                Randomize
            </button>
        </div>
    );
};

export default Randomizer;
