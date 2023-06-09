import { useEffect, useState } from "react";
import ClassRadio from "./ClassRadio";
import LoadoutSlot from "./LoadoutSlot";
import Lock from "./Lock";
import SubclassRadio from "./SubclassRadio";
import Dexie, { IndexableType, Table } from "dexie";
import ArmourSettings from "./ArmourSettings";
import WeaponSettings from "./WeaponSettings";
import { Class, Element, Location } from "../utils/Enums";

interface RandomizerProps {
    disabledClasses: boolean[];
}

const db = new Dexie("D2Randomizer");
db.version(1).stores({
    weapons: "hash, name, type, class_type, tier, slot, ammoType, icon, owned, inVault, inInv, equipped, instanceIds",
    titan_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    hunter_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    warlock_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    subclasses: "hash, name, buildName, class_type, element, icon, inInv, equipped, instanceId",
});

const weapons = db.table("weapons");
const titan_armour = db.table("titan_armour");
const hunter_armour = db.table("hunter_armour");
const warlock_armour = db.table("warlock_armour");
const subclasses = db.table("subclasses");

function getArmourTable(c: number) {
    return c === Class.TITAN ? titan_armour : c === Class.HUNTER ? hunter_armour : warlock_armour;
}

function getSubclassInstanceId(selClass: number, selSubclass: number) {
    return subclasses
        .where("class_type")
        .equals(selClass)
        .and((subclass) => subclass.element === selSubclass)
        .first((subclass) => subclass.instanceId);
}

function chooseItem(
    table: Table<any, IndexableType>,
    selClass: number,
    slotHash: number,
    rarities: boolean[],
    buckets: boolean[],
    logged: boolean
) {
    return new Promise<any>((resolve) => {
        table
            .where("slot")
            .equals(slotHash)
            .and(
                (item) =>
                    !logged ||
                    (item.owned &&
                        ((buckets[0] ? item.inVault : false) ||
                            (buckets[1] ? item.inInv !== -1 : false) ||
                            (buckets[2] ? item.equipped !== -1 : false)))
            )
            .and(
                (item) =>
                    (rarities[0] && item.tier === "Common") ||
                    (rarities[1] && item.tier === "Uncommon") ||
                    (rarities[2] && item.tier === "Rare") ||
                    (rarities[3] && item.tier === "Legendary") ||
                    (rarities[4] && item.tier === "Exotic")
            )
            .and((item) => item.class_type === selClass || item.class_type === 3)
            .toArray()
            .then((filteredItems) => {
                if (filteredItems.length === 0) {
                    resolve(undefined);
                } else {
                    const randomIndex = Math.floor(Math.random() * filteredItems.length);
                    const chosenItem = filteredItems[randomIndex];

                    resolve(chosenItem);
                }
            });
    });
}

function flagItemEquipped(
    table: Table<any, IndexableType>,
    itemHash: number,
    instanceId: string,
    selectedClass: number
) {
    return table
        .where("hash")
        .equals(itemHash)
        .and((item) => item.inInv === selectedClass)
        .modify((item: { equipped: number; inInv: number; instanceIds: string[][] }) => {
            item.equipped = selectedClass;
            item.inInv = -1;
            item.instanceIds = [
                item.instanceIds[Location.VAULT],
                item.instanceIds[Location.INVENTORY].filter((iId: string) => iId !== instanceId),
                [...item.instanceIds[Location.EQUIPPED], instanceId],
            ];
        });
}

const apiKey = import.meta.env.VITE_API_KEY;

let tmpSlotItems: any[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined];
const slotInstanceIds: any[] = [...tmpSlotItems];

function parseSubclassBuildName(buildName: string) {
    const element: string = buildName.split("_")[0];

    switch (element) {
        case "thermal":
            return Element.SOLAR;
        case "arc":
            return Element.ARC;
        case "void":
            return Element.VOID;
        case "stasis":
            return Element.STASIS;
        default:
            return Element.STRAND;
    }
}

function getExoticSlots(items: any[]) {
    const exoticSlots: number[] = [-1, -1];

    for (let i = 0; i < 7; i++) {
        if (items[i] && items[i].tier === "Exotic") {
            exoticSlots[i < 3 ? 0 : 1] = i;
            if (i > 2) {
                break;
            }
        }
    }

    return exoticSlots;
}

function getRandomInstanceId(item: any, locationsAllowed: boolean[]) {
    if (item) {
        const allIds: string[] = [
            ...(locationsAllowed[Location.VAULT] ? item.instanceIds[Location.VAULT] : []),
            ...(locationsAllowed[Location.INVENTORY] ? item.instanceIds[Location.INVENTORY] : []),
            ...(locationsAllowed[Location.EQUIPPED] ? item.instanceIds[Location.EQUIPPED] : []),
        ];

        const randomId: string = allIds[Math.floor(Math.random() * allIds.length)];

        const location: number = item.instanceIds[Location.VAULT].includes(randomId)
            ? Location.VAULT
            : item.instanceIds[Location.INVENTORY].includes(randomId)
            ? Location.INVENTORY
            : item.instanceIds[Location.EQUIPPED].includes(randomId)
            ? Location.EQUIPPED
            : -1;

        return { location: location, id: randomId };
    } else {
        return undefined;
    }
}

function randomizeClass(logged: boolean) {
    if (logged) {
        const userClasses = [];

        for (let i = 0; i < 3; i++) {
            if (localStorage.getItem(`character_${i}`)) {
                userClasses.push(i);
            }
        }

        return userClasses[Math.floor(Math.random() * userClasses.length)];
    } else {
        return Math.floor(Math.random() * 3);
    }
}

async function randomizeSubclass(randomClass: number, logged: boolean) {
    if (logged) {
        const userSubclasses = await subclasses
            .where("class_type")
            .equals(randomClass)
            .and((subclass) => subclass.inInv !== -1 || subclass.equipped !== -1)
            .toArray();

        return parseSubclassBuildName(userSubclasses[Math.floor(Math.random() * userSubclasses.length)].buildName);
    } else {
        return Math.floor(Math.random() * 5);
    }
}

const Randomizer = ({ disabledClasses }: RandomizerProps) => {
    const logged: boolean = localStorage.getItem("access_token") ? true : false;
    const accessToken: string = logged ? localStorage.getItem("access_token")! : "";

    const [slotItems, setSlotItems] = useState(tmpSlotItems);

    const SLOT_HASHES: number[] = [
        parseInt(localStorage.getItem("kinetic_hash")!),
        parseInt(localStorage.getItem("energy_hash")!),
        parseInt(localStorage.getItem("power_hash")!),
        parseInt(localStorage.getItem("helmet_hash")!),
        parseInt(localStorage.getItem("gauntlets_hash")!),
        parseInt(localStorage.getItem("chest_hash")!),
        parseInt(localStorage.getItem("boots_hash")!),
    ];

    let [selectedClass, setSelectedClass] = useState(Class.HUNTER);
    let [selectedSubclass, setSelectedSubclass] = useState(Element.SOLAR);

    let [classLocked, setClassLocked] = useState(true);
    let [subclassLocked, setSubclassLocked] = useState(false);

    let [lockedWeaponExoticSlot, setLockedWeaponExoticSlot] = useState(-1);
    let [lockedArmourExoticSlot, setLockedArmourExoticSlot] = useState(-1);

    const [slotsLocked, setSlotsLocked] = useState([false, false, false, false, false, false, false]);

    function setSlotLocked(slot: number, locked: boolean) {
        let tmpSlotsLocked = [...slotsLocked];
        tmpSlotsLocked[slot] = locked;
        setSlotsLocked(tmpSlotsLocked);
    }

    let [disableClassLock, setDisableClassLock] = useState(false);

    useEffect(() => {
        const armourLocked =
            (slotItems[3] && slotsLocked[3]) ||
            (slotItems[4] && slotsLocked[4]) ||
            (slotItems[5] && slotsLocked[5]) ||
            (slotItems[6] && slotsLocked[6]);

        setDisableClassLock(armourLocked);

        const exoticSlots: number[] = getExoticSlots(slotItems);

        setLockedWeaponExoticSlot(exoticSlots[0] !== -1 && slotsLocked[exoticSlots[0]] ? exoticSlots[0] : -1);
        setLockedArmourExoticSlot(exoticSlots[1] !== -1 && slotsLocked[exoticSlots[1]] ? exoticSlots[1] : -1);
    }, [slotsLocked]);

    async function randomize() {
        const randomClass: number = randomizeClass(logged);

        setSelectedClass(classLocked || disableClassLock ? selectedClass : randomClass);
        setSelectedSubclass(subclassLocked ? selectedSubclass : await randomizeSubclass(randomClass, logged));

        await randomizeItems(classLocked || disableClassLock ? selectedClass : randomClass);

        setSlotItems(tmpSlotItems);

        if (logged) {
            randomizeInstanceIds(tmpSlotItems);
        }
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

        const tasks: Promise<void>[] = [];

        if (lockedWeaponExoticSlot === -1 && weaponRarities.at(-1)) {
            const unlockedSlots = [0, 1, 2].filter((slot) => !slotsLocked[slot]);
            exoticWeaponSlot = unlockedSlots[Math.floor(Math.random() * unlockedSlots.length)];
            tasks.push(
                chooseItem(
                    weapons,
                    selClass,
                    SLOT_HASHES[exoticWeaponSlot],
                    ensureWeaponExotic ? [false, false, false, false, true] : weaponRarities,
                    weaponBuckets,
                    logged
                ).then((exoticWeapon) => (tmpSlotItems[exoticWeaponSlot] = exoticWeapon))
            );
        }
        if (lockedArmourExoticSlot === -1 && armourRarities.at(-1)) {
            const unlockedSlots = [3, 4, 5, 6].filter((slot) => !slotsLocked[slot]);
            exoticArmourSlot = unlockedSlots[Math.floor(Math.random() * unlockedSlots.length)];
            tasks.push(
                chooseItem(
                    getArmourTable(selClass),
                    selClass,
                    SLOT_HASHES[exoticArmourSlot],
                    ensureArmourExotic ? [false, false, false, false, true] : armourRarities,
                    armourBuckets,
                    logged
                ).then((exoticArmour) => (tmpSlotItems[exoticArmourSlot] = exoticArmour))
            );
        }

        for (let i = 0; i < 3; i++) {
            if (i !== exoticWeaponSlot && !slotsLocked[i]) {
                tasks.push(
                    chooseItem(
                        weapons,
                        selClass,
                        SLOT_HASHES[i],
                        [...weaponRarities.slice(0, -1), false],
                        weaponBuckets,
                        logged
                    ).then((weapon) => (tmpSlotItems[i] = weapon))
                );
            }
        }
        for (let i = 3; i < 7; i++) {
            if (i !== exoticArmourSlot && !slotsLocked[i]) {
                tasks.push(
                    chooseItem(
                        getArmourTable(selClass),
                        selClass,
                        SLOT_HASHES[i],
                        [...armourRarities.slice(0, -1), false],
                        armourBuckets,
                        logged
                    ).then((armour) => (tmpSlotItems[i] = armour))
                );
            }
        }

        await Promise.all(tasks);
    }

    function randomizeInstanceIds(items: any[]) {
        const weaponInVault: boolean = localStorage.getItem("weapon_in_vault") === "true" ? true : false;
        const weaponInInv: boolean = localStorage.getItem("weapon_in_inventory") === "true" ? true : false;
        const weaponEquipped: boolean = localStorage.getItem("weapon_equipped") === "true" ? true : false;

        const armourInVault: boolean = localStorage.getItem("armour_in_vault") === "true" ? true : false;
        const armourInInv: boolean = localStorage.getItem("armour_in_inventory") === "true" ? true : false;
        const armourEquipped: boolean = localStorage.getItem("armour_equipped") === "true" ? true : false;

        for (let i = 0; i < 3; i++) {
            slotInstanceIds[i] = getRandomInstanceId(items[i], [weaponInVault, weaponInInv, weaponEquipped]);
        }
        for (let i = 3; i < 7; i++) {
            slotInstanceIds[i] = getRandomInstanceId(items[i], [armourInVault, armourInInv, armourEquipped]);
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
                getArmourTable(selectedClass)
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

    function equipItems() {
        let tasks: Promise<any>[] = [];
        const charId: string = localStorage.getItem("character_" + selectedClass)!;

        for (let i = 0; i < 7; i++) {
            const item = slotItems[i];

            if (slotInstanceIds[i] && slotInstanceIds[i].location === 0) {
                tasks.push(transferToChar(item, slotInstanceIds[i].id, charId));
            }
        }

        Promise.all(tasks).then(() => {
            setTimeout(() => {
                equipNonExotics(charId);
            }, 110);
        });
    }

    async function equipNonExotics(charId: string) {
        const exoticSlots: number[] = getExoticSlots(slotInstanceIds);

        const subclassInstanceId: string = await getSubclassInstanceId(selectedClass, selectedSubclass);

        let ids: string[] = slotInstanceIds
            .filter((instance, index) => instance !== undefined && !exoticSlots.includes(index))
            .map((instance) => instance.id);

        fetch("https://www.bungie.net/Platform/Destiny2/Actions/Items/EquipItems/", {
            method: "POST",
            headers: {
                "X-API-Key": apiKey,
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            },
            body: JSON.stringify({
                itemIds: [...ids, subclassInstanceId],
                characterId: charId,
                membershipType: parseInt(localStorage.getItem("d2_membership_type")!),
            }),
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.ErrorCode === 1) {
                    equipExotics(charId);
                } else if (result.ErrorCode === 36) {
                    setTimeout(() => equipNonExotics(charId), 110);
                }
            });
    }

    function equipExotics(charId: string) {
        const exoticSlots: number[] = getExoticSlots(slotItems);

        const ids = [];

        if (exoticSlots[0] !== -1) {
            ids.push(slotInstanceIds[exoticSlots[0]].id);
        }
        if (exoticSlots[1] !== -1) {
            ids.push(slotInstanceIds[exoticSlots[1]].id);
        }

        if (ids.length > 0) {
            fetch("https://www.bungie.net/Platform/Destiny2/Actions/Items/EquipItems/", {
                method: "POST",
                headers: {
                    "X-API-Key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                body: JSON.stringify({
                    itemIds: ids,
                    characterId: charId,
                    membershipType: parseInt(localStorage.getItem("d2_membership_type")!),
                }),
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result.ErrorCode === 1) {
                        setTimeout(resetEquipped, 200);
                    } else if (result.ErrorCode === 36) {
                        setTimeout(() => equipExotics(charId), 110);
                    }
                });
        }
    }

    async function transferToChar(item: any, instanceId: string, charId: string) {
        return fetch("https://www.bungie.net/Platform/Destiny2/Actions/Items/TransferItem/", {
            method: "POST",
            headers: {
                "X-API-Key": apiKey,
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                itemReferenceHash: item.hash,
                stackSize: 1,
                transferToVault: false,
                itemId: instanceId,
                characterId: charId,
                membershipType: parseInt(localStorage.getItem("d2_membership_type")!),
            }),
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.ErrorCode === 1) {
                    updateIDBVaultToInv(item, instanceId);
                } else if (result.ErrorCode === 36) {
                    setTimeout(() => transferToChar(item, instanceId, charId), 100);
                }
            });
    }

    function updateIDBVaultToInv(item: any, instanceId: string) {
        if (item.slot === SLOT_HASHES[0] || item.slot === SLOT_HASHES[1] || item.slot === SLOT_HASHES[2]) {
            weapons
                .where("hash")
                .equals(item.hash)
                .and((weapon) => weapon.inVault)
                .modify((weapon) => {
                    weapon.inVault = false;
                    weapon.inInv = selectedClass;
                    weapon.instanceIds = [
                        weapon.instanceIds[0].filter((iId: string) => iId !== instanceId),
                        [...weapon.instanceIds[1], instanceId],
                        weapon.instanceIds[2],
                    ];
                });
        } else {
            getArmourTable(selectedClass)
                .where("hash")
                .equals(item.hash)
                .and((armour) => armour.inVault)
                .modify((armour) => {
                    armour.inVault = false;
                    armour.inInv = selectedClass;
                    armour.instanceIds = [
                        armour.instanceIds[0].filter((iId: string) => iId !== instanceId),
                        [...armour.instanceIds[1], instanceId],
                        armour.instanceIds[2],
                    ];
                });
        }
    }

    function resetEquipped() {
        const changed = slotItems.map((item) => item !== undefined);
        const changedSlotHashes = SLOT_HASHES.filter((_, index) => changed[index]);
        const equippedHashes = JSON.parse(localStorage.getItem(selectedClass + "_equipped")!);

        function resetItem(table: Table<any, IndexableType>) {
            return table
                .where("equipped")
                .equals(selectedClass)
                .and((item) => changedSlotHashes.includes(item.slot))
                .modify((item: { slot: number; equipped: number; inInv: number; instanceIds: string[][] }) => {
                    const id: string = equippedHashes[SLOT_HASHES.indexOf(item.slot)];

                    item.equipped = -1;
                    item.inInv = selectedClass;
                    item.instanceIds = [
                        item.instanceIds[0],
                        [...item.instanceIds[1], id],
                        item.instanceIds[2].filter((instanceId: string) => instanceId !== id),
                    ];
                });
        }

        let tasks: Promise<any>[] = [];

        if (changed[0] || changed[1] || changed[2]) {
            tasks.push(resetItem(weapons));
        }
        if (changed[3] || changed[4] || changed[5] || changed[6]) {
            tasks.push(resetItem(getArmourTable(selectedClass)));
        }

        Promise.all(tasks).then(() => {
            tasks = [];

            for (let i = 0; i < 3; i++) {
                if (changed[i]) {
                    tasks.push(flagItemEquipped(weapons, slotItems[i].hash, slotInstanceIds[i].id, selectedClass));
                }
            }

            for (let i = 3; i < 7; i++) {
                if (changed[i]) {
                    tasks.push(
                        flagItemEquipped(
                            getArmourTable(selectedClass),
                            slotItems[i].hash,
                            slotInstanceIds[i].id,
                            selectedClass
                        )
                    );
                }
            }

            Promise.all(tasks).then(() => {
                localStorage.setItem(
                    selectedClass + "_equipped",
                    JSON.stringify(
                        equippedHashes.map((id: string, index: number) =>
                            slotInstanceIds[index] && slotInstanceIds[index].id ? slotInstanceIds[index].id : id
                        )
                    )
                );
            });
        });
    }

    return (
        <div className="flex flex-col items-center gap-2 py-8">
            <div className="relative">
                <div className="absolute -left-9 top-1/2 -translate-y-1/2">
                    <Lock onLock={setClassLocked} defaultLocked={true} disable={disableClassLock} />
                </div>
                <ClassRadio
                    selected={selectedClass}
                    handleChange={setSelectedClass}
                    disableAll={disableClassLock}
                    disableClasses={disabledClasses}
                />
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
