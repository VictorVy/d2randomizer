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

const TITAN: number = 0;
const HUNTER: number = 1;
// const WARLOCK: number = 2;

const SOLAR = 0;
const VOID = 1;
const ARC = 2;
const STASIS = 3;
const STRAND = 4;

const Randomizer = () => {
    const SLOT_HASHES: string[] = [
        localStorage.getItem("kinetic_hash")!,
        localStorage.getItem("energy_hash")!,
        localStorage.getItem("power_hash")!,
        localStorage.getItem("helmet_hash")!,
        localStorage.getItem("gauntlets_hash")!,
        localStorage.getItem("chest_hash")!,
        localStorage.getItem("boots_hash")!,
    ];

    let [firstRand, setFirstRand] = useState(true);

    let tmpSlotItems: any[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    const [slotItems, setSlotItems] = useState(tmpSlotItems);

    let [selectedClass, setSelectedClass] = useState(1);
    let [selectedSubclass, setSelectedSubclass] = useState(0);

    let [classLocked, setClassLocked] = useState(true);
    let [subclassLocked, setSubclassLocked] = useState(false);

    const SLOTS_LOCKED: boolean[] = [false, false, false, false, false, false, false];

    const [slotsLocked, setSlotsLocked] = useState(SLOTS_LOCKED);

    const setSlotLocked = (slot: number, locked: boolean) => {
        console.log("Setting slot " + slot + " to " + locked);

        let tmpSlotsLocked = [...slotsLocked];
        tmpSlotsLocked[slot] = locked;
        setSlotsLocked(tmpSlotsLocked);
    };

    // lock class when armour is locked
    let [disableClassLock, setDisableClassLock] = useState(false);

    useEffect(() => {
        if (!firstRand) {
            if (slotsLocked[3] || slotsLocked[4] || slotsLocked[5] || slotsLocked[6]) {
                setClassLocked(true);
                setDisableClassLock(true);
            } else {
                setDisableClassLock(false);
            }
        }
    }, [slotsLocked]);

    const chooseWeapon = (selClass: number, slotHash: string, rarity: string) =>
        new Promise((resolve) => {
            weapons
                .where("slot")
                .equals(parseInt(slotHash))
                .and((weapon) =>
                    rarity.startsWith("!") ? weapon.tier !== rarity.substring(1) : weapon.tier === rarity
                )
                .and((weapon) => weapon.class_type === selClass || weapon.class_type === 3)
                .toArray()
                .then((exoticWeapons) => {
                    const randomIndex = Math.floor(Math.random() * exoticWeapons.length);
                    const chosenExotic = exoticWeapons[randomIndex];

                    resolve(chosenExotic);
                });
        });

    const chooseArmour = (selClass: number, slotHash: string, rarity: string) =>
        new Promise((resolve) => {
            let armourTable: Dexie.Table<any, IndexableType>;

            switch (selClass) {
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
        if (firstRand) {
            setFirstRand(false);
        }

        const randClass = Math.floor(Math.random() * 3);
        const randSubclass = Math.floor(Math.random() * 5);

        setSelectedClass(classLocked ? selectedClass : randClass);
        setSelectedSubclass(subclassLocked ? selectedSubclass : randSubclass);

        await randomizeItems(classLocked ? selectedClass : randClass);

        setSlotItems(tmpSlotItems);
    }

    async function randomizeItems(selClass: number) {
        const exoticWeaponSlot = Math.floor(Math.random() * 3);
        const exoticArmourSlot = Math.floor(Math.random() * 4) + 3;

        tmpSlotItems = [...slotItems];

        if (!slotsLocked[exoticWeaponSlot]) {
            tmpSlotItems[exoticWeaponSlot] = await chooseWeapon(selClass, SLOT_HASHES[exoticWeaponSlot], "Exotic");
        }
        if (!slotsLocked[exoticArmourSlot]) {
            tmpSlotItems[exoticArmourSlot] = await chooseArmour(selClass, SLOT_HASHES[exoticArmourSlot], "Exotic");
        }

        for (let i = 0; i < 3; i++) {
            if (i !== exoticWeaponSlot && !slotsLocked[i]) {
                tmpSlotItems[i] = await chooseWeapon(selClass, SLOT_HASHES[i], "!Exotic");
            }
        }
        for (let i = 3; i < 7; i++) {
            if (i !== exoticArmourSlot && !slotsLocked[i]) {
                tmpSlotItems[i] = await chooseArmour(selClass, SLOT_HASHES[i], "!Exotic");
            }
        }
    }

    return (
        <div className="flex flex-col items-center gap-8 p-12">
            <div className="relative">
                <div className="absolute -left-9 top-1/2 -translate-y-1/2">
                    <Lock onLock={setClassLocked} defaultLocked={true} disable={disableClassLock} />
                </div>
                <ClassRadio selected={selectedClass} handleChange={setSelectedClass} disable={disableClassLock} />
            </div>
            <div className="relative">
                <div className="absolute -left-9 top-1/2 -translate-y-1/2">
                    <Lock onLock={setSubclassLocked} />
                </div>
                <SubclassRadio
                    selectedClass={selectedClass}
                    selectedElement={selectedSubclass}
                    handleChange={setSelectedSubclass}
                />
            </div>
            <div className="bg-red my-4 grid grid-cols-2 gap-x-32 gap-y-8">
                <div className="relative">
                    <LoadoutSlot item={slotItems[0]} /> {/* kinetic weapon */}
                    <div className="absolute -right-2/3 top-1/2 -translate-y-1/2">
                        <Lock onLock={(locked: boolean) => setSlotLocked(0, locked)} disable={firstRand} />
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                        <Lock onLock={(locked: boolean) => setSlotLocked(3, locked)} disable={firstRand} />
                    </div>
                    <LoadoutSlot item={slotItems[3]} /> {/* helmet */}
                </div>
                <div className="relative">
                    <LoadoutSlot item={slotItems[1]} /> {/* energy weapon */}
                    <div className="absolute -right-2/3 top-1/2 -translate-y-1/2">
                        <Lock onLock={(locked: boolean) => setSlotLocked(1, locked)} disable={firstRand} />
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                        <Lock onLock={(locked: boolean) => setSlotLocked(4, locked)} disable={firstRand} />
                    </div>
                    <LoadoutSlot item={slotItems[4]} /> {/* gauntlets */}
                </div>
                <div className="relative">
                    <LoadoutSlot item={slotItems[2]} /> {/* power weapon */}
                    <div className="absolute -right-2/3 top-1/2 -translate-y-1/2">
                        <Lock onLock={(locked: boolean) => setSlotLocked(2, locked)} disable={firstRand} />
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                        <Lock onLock={(locked: boolean) => setSlotLocked(5, locked)} disable={firstRand} />
                    </div>
                    <LoadoutSlot item={slotItems[5]} /> {/* chest */}
                </div>
                <div />
                <div className="relative">
                    <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                        <Lock onLock={(locked: boolean) => setSlotLocked(6, locked)} disable={firstRand} />
                    </div>
                    <LoadoutSlot item={slotItems[6]} /> {/* boots */}
                </div>
            </div>
            <button
                className="rounded border-b-2 border-black bg-gray-900 px-4 py-2 font-semibold text-white shadow-md duration-75 hover:border-gray-900 hover:bg-gray-800"
                onClick={() => randomize()}
            >
                Randomize
            </button>
        </div>
    );
};

export default Randomizer;
