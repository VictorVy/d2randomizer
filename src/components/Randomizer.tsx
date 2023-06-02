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
    weapons: "hash, name, type, class_type, tier, slot, ammoType, icon, owned, inVault, inInv, equipped, instanceIds",
    titan_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    hunter_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    warlock_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
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

    const SLOT_HASHES: number[] = [
        parseInt(localStorage.getItem("kinetic_hash")!),
        parseInt(localStorage.getItem("energy_hash")!),
        parseInt(localStorage.getItem("power_hash")!),
        parseInt(localStorage.getItem("helmet_hash")!),
        parseInt(localStorage.getItem("gauntlets_hash")!),
        parseInt(localStorage.getItem("chest_hash")!),
        parseInt(localStorage.getItem("boots_hash")!),
    ];

    let tmpSlotItems: any[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    const [slotItems, setSlotItems] = useState(tmpSlotItems);

    const slotInstanceIds: string[] = [...tmpSlotItems];

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
        const armourLocked =
            (slotItems[3] && slotsLocked[3]) ||
            (slotItems[4] && slotsLocked[4]) ||
            (slotItems[5] && slotsLocked[5]) ||
            (slotItems[6] && slotsLocked[6]);

        setDisableClassLock(armourLocked);

        for (let i = 0; i < 3; i++) {
            if (slotItems[i] && slotItems[i].tier === "Exotic") {
                setLockedWeaponExoticSlot(slotsLocked[i] ? i : -1);
                break;
            }
        }

        for (let i = 3; i < 7; i++) {
            if (slotItems[i] && slotItems[i].tier === "Exotic") {
                setLockedArmourExoticSlot(slotsLocked[i] ? i : -1);
                break;
            }
        }
    }, [slotsLocked]);

    // randomize instance ids
    useEffect(() => {
        for (let i = 0; i < 7; i++) {
            if (slotItems[i]) {
                slotInstanceIds[i] =
                    slotItems[i].instanceIds[Math.floor(Math.random() * slotItems[i].instanceIds.length)];
            } else {
                slotInstanceIds[i] = "";
            }
        }
    }, [slotItems]);

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

    const chooseWeapon = (selClass: number, slotHash: number, rarities: boolean[], buckets: boolean[]) =>
        new Promise((resolve) => {
            weapons
                .where("slot")
                .equals(slotHash)
                .and(
                    (weapon) =>
                        !logged ||
                        (weapon.owned &&
                            ((buckets[0] ? weapon.inVault : false) ||
                                (buckets[1] ? weapon.inInv !== -1 : false) ||
                                (buckets[2] ? weapon.equipped !== -1 : false)))
                )
                .and(
                    (weapon) =>
                        (rarities[0] && weapon.tier === "Common") ||
                        (rarities[1] && weapon.tier === "Uncommon") ||
                        (rarities[2] && weapon.tier === "Rare") ||
                        (rarities[3] && weapon.tier === "Legendary") ||
                        (rarities[4] && weapon.tier === "Exotic")
                )
                .and((weapon) => weapon.class_type === selClass || weapon.class_type === 3)
                .toArray()
                .then((filteredWeapons) => {
                    if (filteredWeapons.length === 0) {
                        resolve(undefined);
                    } else {
                        const randomIndex = Math.floor(Math.random() * filteredWeapons.length);
                        const chosenExotic = filteredWeapons[randomIndex];

                        resolve(chosenExotic);
                    }
                });
        });

    const chooseArmour = (selClass: number, slotHash: number, rarities: boolean[], buckets: boolean[]) =>
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
                .equals(slotHash)
                .and(
                    (armour) =>
                        !logged ||
                        (armour.owned &&
                            ((buckets[0] ? armour.inVault : false) ||
                                (buckets[1] ? armour.inInv !== -1 : false) ||
                                (buckets[2] ? armour.equipped !== -1 : false)))
                )
                .and(
                    (armour) =>
                        (rarities[0] && armour.tier === "Common") ||
                        (rarities[1] && armour.tier === "Uncommon") ||
                        (rarities[2] && armour.tier === "Rare") ||
                        (rarities[3] && armour.tier === "Legendary") ||
                        (rarities[4] && armour.tier === "Exotic")
                )
                .toArray()
                .then((filteredArmour) => {
                    if (filteredArmour.length === 0) {
                        resolve(undefined);
                    } else {
                        const randomIndex = Math.floor(Math.random() * filteredArmour.length);
                        const chosenExotic = filteredArmour[randomIndex];

                        resolve(chosenExotic);
                    }
                });
        });

    async function randomize() {
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

        setSelectedClass(classLocked || disableClassLock ? selectedClass : randClass);
        setSelectedSubclass(subclassLocked ? selectedSubclass : randSubclass);

        await randomizeItems(classLocked || disableClassLock ? selectedClass : randClass);

        setSlotItems(tmpSlotItems);
    }

    async function randomizeItems(selClass: number) {
        const weaponRarities: boolean[] = [
            localStorage.getItem("weapon_commons") === "true",
            localStorage.getItem("weapon_uncommons") === "true",
            localStorage.getItem("weapon_rares") === "true",
            localStorage.getItem("weapon_legendaries") === "true",
            localStorage.getItem("weapon_exotics") === "true",
        ];
        const ensureWeaponExotic: boolean = localStorage.getItem("weapon_ensure_exotics") === "true";
        const armourRarities: boolean[] = [
            localStorage.getItem("armour_commons") === "true",
            localStorage.getItem("armour_uncommons") === "true",
            localStorage.getItem("armour_rares") === "true",
            localStorage.getItem("armour_legendaries") === "true",
            localStorage.getItem("armour_exotics") === "true",
        ];
        const ensureArmourExotic: boolean = localStorage.getItem("armour_ensure_exotics") === "true";

        const weaponBuckets: boolean[] = [
            localStorage.getItem("weapon_in_vault") === "true",
            localStorage.getItem("weapon_in_inventory") === "true",
            localStorage.getItem("weapon_equipped") === "true",
        ];
        const armourBuckets: boolean[] = [
            localStorage.getItem("armour_in_vault") === "true",
            localStorage.getItem("armour_in_inventory") === "true",
            localStorage.getItem("armour_equipped") === "true",
        ];

        let exoticWeaponSlot = -1;
        let exoticArmourSlot = -1;

        tmpSlotItems = [...slotItems];

        if (lockedWeaponExoticSlot === -1 && weaponRarities.at(-1)) {
            const unlockedSlots = [0, 1, 2].filter((slot) => !slotsLocked[slot]);
            exoticWeaponSlot = unlockedSlots[Math.floor(Math.random() * unlockedSlots.length)];
            tmpSlotItems[exoticWeaponSlot] = await chooseWeapon(
                selClass,
                SLOT_HASHES[exoticWeaponSlot],
                ensureWeaponExotic ? [false, false, false, false, true] : weaponRarities,
                weaponBuckets
            );
        }
        if (lockedArmourExoticSlot === -1 && armourRarities.at(-1)) {
            const unlockedSlots = [3, 4, 5, 6].filter((slot) => !slotsLocked[slot]);
            exoticArmourSlot = unlockedSlots[Math.floor(Math.random() * unlockedSlots.length)];
            tmpSlotItems[exoticArmourSlot] = await chooseArmour(
                selClass,
                SLOT_HASHES[exoticArmourSlot],
                ensureArmourExotic ? [false, false, false, false, true] : armourRarities,
                armourBuckets
            );
        }

        for (let i = 0; i < 3; i++) {
            if (i !== exoticWeaponSlot && !slotsLocked[i]) {
                tmpSlotItems[i] = await chooseWeapon(
                    selClass,
                    SLOT_HASHES[i],
                    [...weaponRarities.slice(0, -1), false],
                    weaponBuckets
                );
            }
        }
        for (let i = 3; i < 7; i++) {
            if (i !== exoticArmourSlot && !slotsLocked[i]) {
                tmpSlotItems[i] = await chooseArmour(
                    selClass,
                    SLOT_HASHES[i],
                    [...armourRarities.slice(0, -1), false],
                    armourBuckets
                );
            }
        }
    }

    function importItems() {
        tmpSlotItems = [...slotItems];

        weapons
            .where("equipped")
            .equals(selectedClass)
            .toArray()
            .then((equippedWeapons) => {
                equippedWeapons.forEach((item) => {
                    if (item.slot === SLOT_HASHES[0]) {
                        tmpSlotItems[0] = item;
                    } else if (item.slot === SLOT_HASHES[1]) {
                        tmpSlotItems[1] = item;
                    } else if (item.slot === SLOT_HASHES[2]) {
                        tmpSlotItems[2] = item;
                    }
                });
            })
            .then(() => {
                const table =
                    selectedClass === TITAN ? titan_armour : selectedClass === HUNTER ? hunter_armour : warlock_armour;

                table
                    .where("equipped")
                    .equals(selectedClass)
                    .toArray()
                    .then((equippedArmour) => {
                        equippedArmour.forEach((item) => {
                            if (item.slot === SLOT_HASHES[3]) {
                                tmpSlotItems[3] = item;
                            } else if (item.slot === SLOT_HASHES[4]) {
                                tmpSlotItems[4] = item;
                            } else if (item.slot === SLOT_HASHES[5]) {
                                tmpSlotItems[5] = item;
                            } else if (item.slot === SLOT_HASHES[6]) {
                                tmpSlotItems[6] = item;
                            }
                        });
                    })
                    .then(() => {
                        setSlotItems(tmpSlotItems);
                    });
            });
    }

    async function equipItems() {
        const tasks: Promise<Response>[] = [];

        slotItems.forEach((item, index) => {
            if (item !== undefined && item.inVault) {
                console.log(item);

                // tasks.push(
                fetch("https://www.bungie.net/Platform/Destiny2/Actions/Items/TransferItem/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                    body: JSON.stringify({
                        itemReferenceHash: item.hash,
                        stackSize: 1,
                        transferToVault: false,
                        itemId: item.instanceIds[index],
                        characterId: localStorage.getItem("character_" + selectedClass),
                        membershipType: localStorage.getItem("d2_membership_type"),
                    }),
                }).catch((error) => console.log(error));
                // );
            }
        });

        // Promise.all(tasks).then(() => {
        //     console.log("done");

        // slotItems.forEach((item, index) => {
        //     if (item !== undefined) {
        //         fetch("https://www.bungie.net/Platform/Destiny2/Actions/Items/EquipItem/", {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        //             },
        //             body: JSON.stringify({
        //                 itemId: item.instanceIds[index],
        //                 characterId: localStorage.getItem("character_" + selectedClass),
        //                 membershipType: localStorage.getItem("d2_membership_type"),
        //             }),
        //         }).then((response) => {
        //             console.log(response);
        //         });
        //     }
        // });
        // });
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
                <div className="grid grid-cols-[max-content_max-content] gap-x-28 gap-y-[1.71em]">
                    <div className="relative">
                        <LoadoutSlot item={slotItems[0]} /> {/* kinetic weapon */}
                        <div className="absolute -right-2/3 top-1/2 -translate-y-1/2">
                            <Lock onLock={(locked: boolean) => setSlotLocked(0, locked)} />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                            <Lock onLock={(locked: boolean) => setSlotLocked(3, locked)} />
                        </div>
                        <LoadoutSlot item={slotItems[3]} /> {/* helmet */}
                    </div>
                    <div className="relative">
                        <LoadoutSlot item={slotItems[1]} /> {/* energy weapon */}
                        <div className="absolute -right-2/3 top-1/2 -translate-y-1/2">
                            <Lock onLock={(locked: boolean) => setSlotLocked(1, locked)} />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                            <Lock onLock={(locked: boolean) => setSlotLocked(4, locked)} />
                        </div>
                        <LoadoutSlot item={slotItems[4]} /> {/* gauntlets */}
                    </div>
                    <div className="relative">
                        <LoadoutSlot item={slotItems[2]} /> {/* power weapon */}
                        <div className="absolute -right-2/3 top-1/2 -translate-y-1/2">
                            <Lock onLock={(locked: boolean) => setSlotLocked(2, locked)} />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                            <Lock onLock={(locked: boolean) => setSlotLocked(5, locked)} />
                        </div>
                        <LoadoutSlot item={slotItems[5]} /> {/* chest */}
                    </div>
                    <div />
                    <div className="relative">
                        <div className="absolute -left-2/3 top-1/2 -translate-y-1/2">
                            <Lock onLock={(locked: boolean) => setSlotLocked(6, locked)} />
                        </div>
                        <LoadoutSlot item={slotItems[6]} /> {/* boots */}
                    </div>
                </div>
                <div className="flex">
                    <ArmourSettings />
                </div>
            </div>
            <div className="relative flex items-center">
                <button
                    className="absolute -left-[11.45em] scale-[80%] rounded border-b-2 border-black bg-gray-900 px-4 py-2 text-white shadow-md duration-75 hover:border-gray-900 hover:bg-gray-800 disabled:opacity-50"
                    onClick={importItems}
                    disabled={!logged}
                >
                    Import Items
                </button>
                <button
                    className="rounded border-b-2 border-black bg-gray-900 px-4 py-2 font-semibold text-white shadow-md duration-75 hover:border-gray-900 hover:bg-gray-800"
                    onClick={() => randomize()}
                >
                    Randomize
                </button>
                <button
                    className="absolute -right-[10.8em] scale-[80%] rounded border-b-2 border-black bg-gray-900 px-4 py-2 text-white shadow-md duration-75 hover:border-gray-900 hover:bg-gray-800 disabled:opacity-50"
                    onClick={equipItems}
                    disabled={!logged}
                >
                    Equip Items
                </button>
            </div>
        </div>
    );
};

export default Randomizer;
