import Dexie, { IndexableType } from "dexie";
import NavBar from "../components/NavBar";
import Randomizer from "../components/Randomizer";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

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

const addWeapon = async (
    hash: number,
    name: string,
    type: string,
    tier: string,
    slot: number,
    ammoType: number,
    icon: string,
    class_type: number,
    damage_type: number,
    owned: boolean,
    inVault: boolean,
    inInv: number,
    equipped: number,
    instanceIds: string[][]
) => {
    await weapons.put({
        hash: hash,
        name: name,
        type: type,
        tier: tier,
        slot: slot,
        ammoType: ammoType,
        icon: icon,
        class_type: class_type,
        damage_type: damage_type,
        owned: owned,
        inVault: inVault,
        inInv: inInv,
        equipped: equipped,
        instanceIds: instanceIds,
    });
};

const addArmour = async (
    hash: number,
    name: string,
    type: string,
    tier: string,
    slot: number,
    icon: string,
    class_type: number,
    owned: boolean,
    inVault: boolean,
    inInv: number,
    equipped: number,
    instanceIds: string[][]
) => {
    const armour_table: Dexie.Table<any, IndexableType> =
        class_type === 0 ? titan_armour : class_type === 1 ? hunter_armour : warlock_armour;

    await armour_table.put({
        hash: hash,
        name: name,
        type: type,
        tier: tier,
        slot: slot,
        icon: icon,
        class_type: class_type,
        owned: owned,
        inVault: inVault,
        inInv: inInv,
        equipped: equipped,
        instanceIds: instanceIds,
    });
};

const addSubclass = async (
    hash: number,
    name: string,
    buildName: string,
    class_type: number,
    icon: string,
    inInv: number,
    equipped: number
) => {
    await subclasses.put({
        hash: hash,
        name: name,
        buildName: buildName,
        class_type: class_type,
        icon: icon,
        inInv: inInv,
        equipped: equipped,
    });
};

const onLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("bungie_membership_id");
    localStorage.removeItem("bungie_display_name");
    localStorage.removeItem("bungie_display_name_code");
    localStorage.removeItem("pfp_path");

    localStorage.removeItem("character_0");
    localStorage.removeItem("character_1");
    localStorage.removeItem("character_2");

    localStorage.removeItem("0_equipped");
    localStorage.removeItem("1_equipped");
    localStorage.removeItem("2_equipped");

    clearDB();
};

function clearDB() {
    return new Promise((resolve) => {
        const tasks: Promise<any>[] = [];

        tasks.push(
            weapons
                .filter((weapon) => weapon.owned)
                .modify({ inVault: false, inInv: -1, equipped: -1, instanceIds: [[], [], []] })
        );
        tasks.push(
            titan_armour
                .filter((armour) => armour.owned)
                .modify({ inVault: false, inInv: -1, equipped: -1, instanceIds: [[], [], []] })
        );
        tasks.push(
            hunter_armour
                .filter((armour) => armour.owned)
                .modify({ inVault: false, inInv: -1, equipped: -1, instanceIds: [[], [], []] })
        );
        tasks.push(
            warlock_armour
                .filter((armour) => armour.owned)
                .modify({ inVault: false, inInv: -1, equipped: -1, instanceIds: [[], [], []] })
        );
        tasks.push(subclasses.filter((subclass) => subclass.inInv === 1).modify({ inInv: -1, equipped: -1 }));

        Promise.all(tasks).then(resolve);
    });
}

const formatCode = (code: string) => {
    if (code.length === 0) {
        return "0000";
    } else if (code.length === 1) {
        return "000" + code;
    } else if (code.length === 2) {
        return "00" + code;
    } else if (code.length === 3) {
        return "0" + code;
    } else {
        return code;
    }
};

const Home = () => {
    let fetchWeapons = useLiveQuery(() => weapons.toArray(), []);

    if (fetchWeapons?.length === 0) {
        fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                // fetch power cap
                fetch(
                    "https://www.bungie.net" + data.Response.jsonWorldComponentContentPaths.en.DestinyPowerCapDefinition
                )
                    .then((response) => response.json())
                    .then((data) => {
                        let keys = Object.keys(data);

                        let numHashes = 0;

                        for (let i = 0; i < keys.length; i++) {
                            if (data[keys[i]].powerCap >= 999900) {
                                localStorage.setItem("power_cap_" + numHashes, data[keys[i]].hash);
                                numHashes++;
                            }
                        }

                        // fetch weapons/armour, item slot hashes, and subclasses
                        fetch("https://www.bungie.net" + data.Response.jsonWorldContentPaths.en)
                            .then((response) => response.json())
                            .then((data) => {
                                let keys = Object.keys(data.DestinyInventoryItemDefinition);

                                const nonSunset = (hash: number) => {
                                    for (let i = 0; i < numHashes; i++) {
                                        if (hash === parseInt(localStorage.getItem("power_cap_" + i) as string)) {
                                            return true;
                                        }
                                    }

                                    return false;
                                };

                                for (let i = 0; i < keys.length; i++) {
                                    const item = data.DestinyInventoryItemDefinition[keys[i]];

                                    if (
                                        item.itemType === 3 &&
                                        nonSunset(item.quality.versions[item.quality.currentVersion].powerCapHash)
                                    ) {
                                        addWeapon(
                                            item.hash,
                                            item.displayProperties.name,
                                            item.itemTypeDisplayName,
                                            item.inventory.tierTypeName,
                                            item.equippingBlock.equipmentSlotTypeHash,
                                            item.equippingBlock.ammoType,
                                            item.displayProperties.icon,
                                            item.classType,
                                            item.defaultDamageType,
                                            false,
                                            false,
                                            -1,
                                            -1,
                                            [[], [], []]
                                        );
                                    } else if (
                                        item.itemType === 2 &&
                                        nonSunset(item.quality.versions[item.quality.currentVersion].powerCapHash)
                                    ) {
                                        addArmour(
                                            item.hash,
                                            item.displayProperties.name,
                                            item.itemTypeDisplayName,
                                            item.inventory.tierTypeName,
                                            item.equippingBlock.equipmentSlotTypeHash,
                                            item.displayProperties.icon,
                                            item.classType,
                                            false,
                                            false,
                                            -1,
                                            -1,
                                            [[], [], []]
                                        );
                                    } else if (item.itemType === 16 && item.classType !== 3) {
                                        localStorage.setItem(item.talentGrid.buildName, item.displayProperties.name);

                                        addSubclass(
                                            item.hash,
                                            item.displayProperties.name,
                                            item.talentGrid.buildName,
                                            item.classType,
                                            "https://www.bungie.net" + item.displayProperties.icon,
                                            -1,
                                            -1
                                        );
                                    }
                                }

                                keys = Object.keys(data.DestinyEquipmentSlotDefinition);

                                for (let i = 0; i < keys.length; i++) {
                                    const slot = data.DestinyEquipmentSlotDefinition[keys[i]];

                                    if (slot.displayProperties.name === "Chest Armor") {
                                        localStorage.setItem("chest_hash", slot.hash);
                                    } else if (slot.displayProperties.name === "Leg Armor") {
                                        localStorage.setItem("boots_hash", slot.hash);
                                    } else if (slot.displayProperties.name === "Helmet") {
                                        localStorage.setItem("helmet_hash", slot.hash);
                                    } else if (slot.displayProperties.name === "Gauntlets") {
                                        localStorage.setItem("gauntlets_hash", slot.hash);
                                    } else if (slot.displayProperties.name === "Kinetic Weapons") {
                                        localStorage.setItem("kinetic_hash", slot.hash);
                                    } else if (slot.displayProperties.name === "Energy Weapons") {
                                        localStorage.setItem("energy_hash", slot.hash);
                                    } else if (slot.displayProperties.name === "Power Weapons") {
                                        localStorage.setItem("power_hash", slot.hash);
                                    }
                                }

                                keys = Object.keys(data.DestinyInventoryBucketDefinition);

                                for (let i = 0; i < keys.length; i++) {
                                    if (
                                        data.DestinyInventoryBucketDefinition[keys[i]].displayProperties.name ===
                                        "General"
                                    ) {
                                        localStorage.setItem(
                                            "vault_hash",
                                            data.DestinyInventoryBucketDefinition[keys[i]].hash
                                        );
                                    } else if (
                                        data.DestinyInventoryBucketDefinition[keys[i]].displayProperties.name ===
                                        "Subclass"
                                    ) {
                                        localStorage.setItem(
                                            "subclass_hash",
                                            data.DestinyInventoryBucketDefinition[keys[i]].hash
                                        );
                                    }
                                }
                            });
                    });
            });
    }

    useEffect(() => {
        if (localStorage.getItem("access_token")) {
            const apiKey: string = import.meta.env.VITE_API_KEY;
            const bungieMembershipId = localStorage.getItem("bungie_membership_id")!;

            clearDB().then(() => {
                fetch(`https://www.bungie.net/Platform//User/GetBungieNetUserById/${bungieMembershipId}/`, {
                    method: "GET",
                    headers: {
                        "X-API-Key": apiKey,
                    },
                })
                    .then((response) => response.json())
                    .then((result) => {
                        const displayName: string = result.Response.cachedBungieGlobalDisplayName;
                        const displayNameCode: string = formatCode(
                            result.Response.cachedBungieGlobalDisplayNameCode.toString()
                        );

                        localStorage.setItem("bungie_display_name", displayName);
                        localStorage.setItem("bungie_display_name_code", displayNameCode);
                        localStorage.setItem("pfp_path", "https://www.bungie.net" + result.Response.profilePicturePath);

                        fetch(
                            `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/${displayName}%23${displayNameCode}/`,
                            {
                                method: "GET",
                                headers: {
                                    "X-API-Key": apiKey,
                                },
                            }
                        )
                            .then((response) => response.json())
                            .then((result) => {
                                const d2MembershipId: string = result.Response[0].membershipId;
                                const d2MembershipType: string = result.Response[0].membershipType;

                                localStorage.setItem("d2_membership_id", d2MembershipId);
                                localStorage.setItem("d2_membership_type", d2MembershipType);

                                fetch(
                                    `https://www.bungie.net/Platform/Destiny2/${d2MembershipType}/Profile/${d2MembershipId}/?components=102,200,201,205,300`,
                                    {
                                        method: "GET",
                                        headers: {
                                            "X-API-Key": apiKey,
                                            Authorization: "Bearer " + localStorage.getItem("access_token"),
                                        },
                                    }
                                )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                        const vaultHash = parseInt(localStorage.getItem("vault_hash") as string);
                                        const subclassHash = parseInt(localStorage.getItem("subclass_hash") as string);

                                        const kinetic_hash = parseInt(localStorage.getItem("kinetic_hash") as string);
                                        const energy_hash = parseInt(localStorage.getItem("energy_hash") as string);
                                        const power_hash = parseInt(localStorage.getItem("power_hash") as string);
                                        const helmet_hash = parseInt(localStorage.getItem("helmet_hash") as string);
                                        const gauntlets_hash = parseInt(
                                            localStorage.getItem("gauntlets_hash") as string
                                        );
                                        const chest_hash = parseInt(localStorage.getItem("chest_hash") as string);
                                        const boots_hash = parseInt(localStorage.getItem("boots_hash") as string);

                                        let items = result.Response.profileInventory.data.items;

                                        for (let i = 0; i < items.length; i++) {
                                            if (items[i].bucketHash === vaultHash) {
                                                await weapons
                                                    .update(
                                                        items[i].itemHash,
                                                        (weapon: {
                                                            owned: boolean;
                                                            inVault: boolean;
                                                            instanceIds: string[][];
                                                        }) => {
                                                            weapon.owned = true;
                                                            weapon.inVault = true;
                                                            weapon.instanceIds[0].push(items[i].itemInstanceId);
                                                        }
                                                    )
                                                    .then((updated) => {
                                                        if (!updated) {
                                                            titan_armour
                                                                .update(
                                                                    items[i].itemHash,
                                                                    (armour: {
                                                                        owned: boolean;
                                                                        inVault: boolean;
                                                                        instanceIds: string[][];
                                                                    }) => {
                                                                        armour.owned = true;
                                                                        armour.inVault = true;
                                                                        armour.instanceIds[0].push(
                                                                            items[i].itemInstanceId
                                                                        );
                                                                    }
                                                                )
                                                                .then((updated) => {
                                                                    if (!updated) {
                                                                        hunter_armour
                                                                            .update(
                                                                                items[i].itemHash,
                                                                                (armour: {
                                                                                    owned: boolean;
                                                                                    inVault: boolean;
                                                                                    instanceIds: string[][];
                                                                                }) => {
                                                                                    armour.owned = true;
                                                                                    armour.inVault = true;
                                                                                    armour.instanceIds[0].push(
                                                                                        items[i].itemInstanceId
                                                                                    );
                                                                                }
                                                                            )
                                                                            .then((updated) => {
                                                                                if (!updated) {
                                                                                    warlock_armour.update(
                                                                                        items[i].itemHash,
                                                                                        (armour: {
                                                                                            owned: boolean;
                                                                                            inVault: boolean;
                                                                                            instanceIds: string[][];
                                                                                        }) => {
                                                                                            armour.owned = true;
                                                                                            armour.inVault = true;
                                                                                            armour.instanceIds[0].push(
                                                                                                items[i].itemInstanceId
                                                                                            );
                                                                                        }
                                                                                    );
                                                                                }
                                                                            });
                                                                    }
                                                                });
                                                        }
                                                    });
                                            }
                                        }

                                        const characterIds: string[] = Object.keys(result.Response.characters.data);

                                        for (let i = 0; i < characterIds.length; i++) {
                                            const classType =
                                                result.Response.characters.data[characterIds[i]].classType;
                                            localStorage.setItem("character_" + classType, characterIds[i]);

                                            const armourTable =
                                                classType === 0
                                                    ? titan_armour
                                                    : classType === 1
                                                    ? hunter_armour
                                                    : warlock_armour;

                                            const characterInventory =
                                                result.Response.characterInventories.data[characterIds[i]].items;

                                            for (let j = 0; j < characterInventory.length; j++) {
                                                if (
                                                    characterInventory[j].bucketHash === kinetic_hash ||
                                                    characterInventory[j].bucketHash === energy_hash ||
                                                    characterInventory[j].bucketHash === power_hash
                                                ) {
                                                    await weapons.update(
                                                        characterInventory[j].itemHash,
                                                        (weapon: {
                                                            owned: boolean;
                                                            inInv: number;
                                                            instanceIds: string[][];
                                                        }) => {
                                                            weapon.owned = true;
                                                            weapon.inInv = classType;
                                                            weapon.instanceIds[1].push(
                                                                characterInventory[j].itemInstanceId
                                                            );
                                                        }
                                                    );
                                                } else if (
                                                    characterInventory[j].bucketHash === helmet_hash ||
                                                    characterInventory[j].bucketHash === gauntlets_hash ||
                                                    characterInventory[j].bucketHash === chest_hash ||
                                                    characterInventory[j].bucketHash === boots_hash
                                                ) {
                                                    await armourTable.update(
                                                        characterInventory[j].itemHash,
                                                        (armour: {
                                                            owned: boolean;
                                                            inInv: number;
                                                            instanceIds: string[][];
                                                        }) => {
                                                            armour.owned = true;
                                                            armour.inInv = classType;
                                                            armour.instanceIds[1].push(
                                                                characterInventory[j].itemInstanceId
                                                            );
                                                        }
                                                    );
                                                } else if (characterInventory[j].bucketHash === subclassHash) {
                                                    await subclasses.update(characterInventory[j].itemHash, {
                                                        inInv: classType,
                                                    });
                                                }
                                            }

                                            const characterEquipment =
                                                result.Response.characterEquipment.data[characterIds[i]].items;

                                            const charEquipped: string[] = ["", "", "", "", "", "", ""];

                                            for (let j = 0; j < characterEquipment.length; j++) {
                                                if (
                                                    characterEquipment[j].bucketHash === kinetic_hash ||
                                                    characterEquipment[j].bucketHash === energy_hash ||
                                                    characterEquipment[j].bucketHash === power_hash
                                                ) {
                                                    await weapons.update(
                                                        characterEquipment[j].itemHash,
                                                        (weapon: {
                                                            owned: boolean;
                                                            equipped: number;
                                                            instanceIds: string[][];
                                                        }) => {
                                                            weapon.owned = true;
                                                            weapon.equipped = classType;
                                                            weapon.instanceIds[2].push(
                                                                characterEquipment[j].itemInstanceId
                                                            );

                                                            const itemHash = characterEquipment[j].bucketHash;
                                                            charEquipped[
                                                                itemHash === kinetic_hash
                                                                    ? 0
                                                                    : itemHash === energy_hash
                                                                    ? 1
                                                                    : 2
                                                            ] = characterEquipment[j].itemInstanceId;
                                                        }
                                                    );
                                                } else if (
                                                    characterEquipment[j].bucketHash === helmet_hash ||
                                                    characterEquipment[j].bucketHash === gauntlets_hash ||
                                                    characterEquipment[j].bucketHash === chest_hash ||
                                                    characterEquipment[j].bucketHash === boots_hash
                                                ) {
                                                    await armourTable.update(
                                                        characterEquipment[j].itemHash,
                                                        (armour: {
                                                            owned: boolean;
                                                            equipped: number;
                                                            instanceIds: string[][];
                                                        }) => {
                                                            armour.owned = true;
                                                            armour.equipped = classType;
                                                            armour.instanceIds[2].push(
                                                                characterEquipment[j].itemInstanceId
                                                            );

                                                            const itemHash = characterEquipment[j].bucketHash;
                                                            charEquipped[
                                                                itemHash === helmet_hash
                                                                    ? 3
                                                                    : itemHash === gauntlets_hash
                                                                    ? 4
                                                                    : itemHash === chest_hash
                                                                    ? 5
                                                                    : 6
                                                            ] = characterEquipment[j].itemInstanceId;
                                                        }
                                                    );
                                                } else if (characterEquipment[j].bucketHash === subclassHash) {
                                                    await subclasses.update(characterEquipment[j].itemHash, {
                                                        equipped: classType,
                                                    });
                                                }
                                            }

                                            localStorage.setItem(classType + "_equipped", JSON.stringify(charEquipped));
                                        }
                                    });
                            });
                    });
            });
        }
    }, []);

    return (
        <div className="h-screen w-screen bg-gray-700">
            <NavBar onLogout={onLogout} />
            <Randomizer />
        </div>
    );
};

export default Home;
