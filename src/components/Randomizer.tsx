import { useEffect, useState } from "react";
import ClassRadio from "./ClassRadio";
import LoadoutSlot from "./LoadoutSlot";
import Lock from "./Lock";
import SubclassRadio from "./SubclassRadio";
import Dexie, { IndexableType } from "dexie";
import ArmourSettings from "./ArmourSettings";
import WeaponSettings from "./WeaponSettings";

const db = new Dexie("D2Randomizer");
db.version(1).stores({
    weapons: "hash, name, type, class_type, tier, slot, ammoType, icon, owned, inInv, equipped",
    titan_armour: "hash, name, type, class_type, tier, slot, icon, owned, inInv, equipped",
    hunter_armour: "hash, name, type, class_type, tier, slot, icon, owned, inInv, equipped",
    warlock_armour: "hash, name, type, class_type, tier, slot, icon, owned, inInv, equipped",
    subclasses: "hash, name, buildName, class_type, icon, inInv, equipped",
});

const weapons = db.table("weapons");
const titan_armour = db.table("titan_armour");
const hunter_armour = db.table("hunter_armour");
const warlock_armour = db.table("warlock_armour");
const subclasses = db.table("subclasses");

const TITAN: number = 0;
const HUNTER: number = 1;
// const WARLOCK: number = 2;

const SOLAR = 0;
const VOID = 1;
const ARC = 2;
const STASIS = 3;
const STRAND = 4;

const Randomizer = () => {
    const logged = localStorage.getItem("access_token") ? true : false;

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

    let [lockedWeaponExoticSlot, setLockedWeaponExoticSlot] = useState(-1);
    let [lockedArmourExoticSlot, setLockedArmourExoticSlot] = useState(-1);

    const [slotsLocked, setSlotsLocked] = useState(SLOTS_LOCKED);

    const setSlotLocked = (slot: number, locked: boolean) => {
        let tmpSlotsLocked = [...slotsLocked];
        tmpSlotsLocked[slot] = locked;
        setSlotsLocked(tmpSlotsLocked);
    };

    // lock class when armour is locked
    let [disableClassLock, setDisableClassLock] = useState(false);

    useEffect(() => {
        if (!firstRand) {
            const armourLocked = slotsLocked[3] || slotsLocked[4] || slotsLocked[5] || slotsLocked[6];

            setClassLocked(armourLocked);
            setDisableClassLock(armourLocked);

            for (let i = 0; i < 3; i++) {
                if (slotItems[i].tier === "Exotic") {
                    setLockedWeaponExoticSlot(slotsLocked[i] ? i : -1);
                    break;
                }
            }

            for (let i = 3; i < 7; i++) {
                if (slotItems[i].tier === "Exotic") {
                    setLockedArmourExoticSlot(slotsLocked[i] ? i : -1);
                    break;
                }
            }
        }
    }, [slotsLocked]);

    const parseSubclassBuildName = (buildName: string) => {
        const element: string = buildName.split("_")[0];

        switch (element) {
            case "thermal":
                return SOLAR;
            case "arc":
                return ARC;
            case "void":
                return VOID;
            case "stasis":
                return STASIS;
            default:
                return STRAND;
        }
    };

    const chooseWeapon = (selClass: number, slotHash: string, rarity: string) =>
        new Promise((resolve) => {
            weapons
                .where("slot")
                .equals(parseInt(slotHash))
                .and((weapon) => !logged || weapon.owned)
                .and((weapon) =>
                    rarity.startsWith("!") ? weapon.tier !== rarity.substring(1) : weapon.tier === rarity
                )
                .and((weapon) => weapon.class_type === selClass || weapon.class_type === 3)
                .toArray()
                .then((filteredWeapons) => {
                    if (filteredWeapons.length === 0) {
                        console.log("No weapons found for slot " + slotHash + " and rarity " + rarity);

                        resolve(chooseWeapon(selClass, slotHash, rarity === "Exotic" ? "!Exotic" : rarity));
                    } else {
                        const randomIndex = Math.floor(Math.random() * filteredWeapons.length);
                        const chosenExotic = filteredWeapons[randomIndex];

                        resolve(chosenExotic);
                    }
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
                .and((armour) => !logged || armour.owned)
                .and((armour) =>
                    rarity.startsWith("!") ? armour.tier !== rarity.substring(1) : armour.tier === rarity
                )
                .toArray()
                .then((filteredArmour) => {
                    if (filteredArmour.length === 0) {
                        resolve(chooseArmour(selClass, slotHash, rarity === "Exotic" ? "!Exotic" : rarity));
                    } else {
                        const randomIndex = Math.floor(Math.random() * filteredArmour.length);
                        const chosenExotic = filteredArmour[randomIndex];

                        resolve(chosenExotic);
                    }
                });
        });

    async function randomize() {
        if (firstRand) {
            setFirstRand(false);
        }

        let randClass: number;

        if (logged) {
            const userClasses = [];

            for (let i = 0; i < 3; i++) {
                if (localStorage.getItem(`character_${i}`)) {
                    userClasses.push(i);
                }
            }

            randClass = userClasses[Math.floor(Math.random() * userClasses.length)];
        } else {
            randClass = Math.floor(Math.random() * 3);
        }

        let randSubclass: number;

        if (logged) {
            const userSubclasses = await subclasses
                .where("class_type")
                .equals(randClass)
                .and((subclass) => subclass.inInv !== -1)
                .toArray();

            randSubclass = parseSubclassBuildName(
                userSubclasses[Math.floor(Math.random() * userSubclasses.length)].buildName
            );
        } else {
            randSubclass = Math.floor(Math.random() * 5);
        }

        setSelectedClass(classLocked ? selectedClass : randClass);
        setSelectedSubclass(subclassLocked ? selectedSubclass : randSubclass);

        await randomizeItems(classLocked ? selectedClass : randClass);

        setSlotItems(tmpSlotItems);
    }

    async function randomizeItems(selClass: number) {
        let exoticWeaponSlot = -1;
        let exoticArmourSlot = -1;

        if (lockedWeaponExoticSlot === -1) {
            const unlockedSlots = [0, 1, 2].filter((slot) => !slotsLocked[slot]);
            exoticWeaponSlot = unlockedSlots[Math.floor(Math.random() * unlockedSlots.length)];
        }
        if (lockedArmourExoticSlot === -1) {
            const unlockedSlots = [3, 4, 5, 6].filter((slot) => !slotsLocked[slot]);
            exoticArmourSlot = unlockedSlots[Math.floor(Math.random() * unlockedSlots.length)];
        }

        tmpSlotItems = [...slotItems];

        if (lockedWeaponExoticSlot === -1 && !slotsLocked[exoticWeaponSlot]) {
            tmpSlotItems[exoticWeaponSlot] = await chooseWeapon(selClass, SLOT_HASHES[exoticWeaponSlot], "Exotic");
        }
        if (lockedArmourExoticSlot === -1 && !slotsLocked[exoticArmourSlot]) {
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
        <div className="flex flex-col items-center gap-2 py-8">
            <div className="relative">
                <div className="absolute -left-9 top-1/2 -translate-y-1/2">
                    <Lock onLock={setClassLocked} defaultLocked={true} disable={disableClassLock} />
                </div>
                <ClassRadio selected={selectedClass} handleChange={setSelectedClass} disableAll={disableClassLock} />
            </div>
            <div className="relative">
                <div className="absolute -left-9 top-1/2 -translate-y-1/2">
                    <Lock onLock={setSubclassLocked} />
                </div>
                <SubclassRadio
                    selectedClass={selectedClass}
                    selectedSubclass={selectedSubclass}
                    handleChange={setSelectedSubclass}
                />
            </div>
            <div className="my-5 grid w-screen grid-flow-col grid-cols-[auto_max-content_auto] space-x-6">
                <div className="flex justify-end">
                    <WeaponSettings />
                </div>
                <div className="grid grid-cols-[max-content_max-content] gap-x-28 gap-y-7">
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
                <div className="flex">
                    <ArmourSettings />
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
