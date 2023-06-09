import Dexie, { IndexableType, Table } from "dexie";
import NavBar from "../components/NavBar";
import Randomizer from "../components/Randomizer";
import { useEffect, useState } from "react";
import { Class, Location, Element } from "../utils/Enums";
import LoadingOverlay from "../components/LoadingOverlay";

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

const allTables = [weapons, titan_armour, hunter_armour, warlock_armour, subclasses];

function getArmourTable(c: number) {
    return c === Class.TITAN ? titan_armour : c === Class.HUNTER ? hunter_armour : warlock_armour;
}

const apiKey: string = import.meta.env.VITE_API_KEY;

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

function addWeapon(
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
) {
    weapons.put({
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
}

function addArmour(
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
) {
    getArmourTable(class_type).put({
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
}

function addSubclass(
    hash: number,
    name: string,
    buildName: string,
    class_type: number,
    element: number,
    icon: string,
    inInv: number,
    equipped: number,
    instanceId: string
) {
    subclasses.put({
        hash: hash,
        name: name,
        buildName: buildName,
        class_type: class_type,
        element: element,
        icon: icon,
        inInv: inInv,
        equipped: equipped,
        instanceId: instanceId,
    });
}

function onLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("bungie_membership_id");
    localStorage.removeItem("bungie_display_name");
    localStorage.removeItem("bungie_display_name_code");
    localStorage.removeItem("pfp_path");

    localStorage.removeItem("character_" + Class.TITAN);
    localStorage.removeItem("character_" + Class.HUNTER);
    localStorage.removeItem("character_" + Class.WARLOCK);

    localStorage.removeItem(Class.TITAN + "_equipped");
    localStorage.removeItem(Class.HUNTER + "_equipped");
    localStorage.removeItem(Class.WARLOCK + "_equipped");

    clearDB().then(() => window.location.reload());
}

function clearDB() {
    const tasks: Promise<any>[] = [];

    tasks.push(clearItems(weapons));
    tasks.push(clearItems(titan_armour));
    tasks.push(clearItems(hunter_armour));
    tasks.push(clearItems(warlock_armour));
    tasks.push(subclasses.filter((subclass) => subclass.inInv !== -1).modify({ inInv: -1, equipped: -1 }));

    return Promise.all(tasks);
}

function clearItems(table: Table<any, IndexableType>) {
    return table
        .filter((item) => item.owned)
        .modify({ inVault: false, inInv: -1, equipped: -1, instanceIds: [[], [], []] });
}

function formatCode(code: string) {
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
}

function fetchManifest() {
    return new Promise((resolve) => {
        fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", {
            method: "GET",
        })
            .then((response) => response.json())
            .then((result) => {
                resolve(result.Response);
            });
    });
}

function fetchPowerCapHashes(manifest: any) {
    return new Promise<number[]>((resolve) => {
        const capHashes: number[] = [];

        fetch("https://www.bungie.net" + manifest.jsonWorldComponentContentPaths.en.DestinyPowerCapDefinition)
            .then((response) => response.json())
            .then((powerData) => {
                const keys = Object.keys(powerData);

                for (let i = 0; i < keys.length; i++) {
                    if (powerData[keys[i]].powerCap >= 999900) {
                        capHashes.push(powerData[keys[i]].hash);
                    }
                }
            })
            .then(() => resolve(capHashes));
    });
}

async function parseManifest(manifest: any, capHashes: number[]) {
    return fetch("https://www.bungie.net" + manifest.jsonWorldContentPaths.en)
        .then((response) => response.json())
        .then((data) => {
            const nonSunset = (hash: number) => {
                for (let i = 0; i < capHashes.length; i++) {
                    if (hash === capHashes[i]) {
                        return true;
                    }
                }

                return false;
            };

            let keys;

            db.transaction("rw", allTables, () => {
                keys = Object.keys(data.DestinyInventoryItemDefinition);

                for (let i = 0; i < keys.length; i++) {
                    addItemToDB(data.DestinyInventoryItemDefinition[keys[i]], nonSunset);
                }
            });

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
                if (data.DestinyInventoryBucketDefinition[keys[i]].displayProperties.name === "General") {
                    localStorage.setItem("vault_hash", data.DestinyInventoryBucketDefinition[keys[i]].hash);
                } else if (data.DestinyInventoryBucketDefinition[keys[i]].displayProperties.name === "Subclass") {
                    localStorage.setItem("subclass_hash", data.DestinyInventoryBucketDefinition[keys[i]].hash);
                }
            }
        });
}

function addItemToDB(item: any, nonSunset: (hash: number) => boolean) {
    if (item.itemType === 3 && nonSunset(item.quality.versions[item.quality.currentVersion].powerCapHash)) {
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
    } else if (item.itemType === 2 && nonSunset(item.quality.versions[item.quality.currentVersion].powerCapHash)) {
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
    } else if (item.itemType === 16 && item.classType !== Class.UNKNOWN) {
        localStorage.setItem(item.talentGrid.buildName, item.displayProperties.name);

        addSubclass(
            item.hash,
            item.displayProperties.name,
            item.talentGrid.buildName,
            item.classType,
            parseSubclassBuildName(item.talentGrid.buildName),
            "https://www.bungie.net" + item.displayProperties.icon,
            -1,
            -1,
            ""
        );
    }
}

function fetchDisplayName(bungieMembershipId: string) {
    return new Promise<string>((resolve) => {
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

                resolve(displayName + "%23" + displayNameCode);
            });
    });
}

function fetchD2MembershipId(fullDisplayName: string) {
    return new Promise<{ d2MembershipId: string; d2MembershipType: string }>((resolve) => {
        fetch(`https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/${fullDisplayName}/`, {
            method: "GET",
            headers: {
                "X-API-Key": apiKey,
            },
        })
            .then((response) => response.json())
            .then((result) => {
                const d2MembershipId: string = result.Response[0].membershipId;
                const d2MembershipType: string = result.Response[0].membershipType;

                localStorage.setItem("d2_membership_id", d2MembershipId);
                localStorage.setItem("d2_membership_type", d2MembershipType);

                resolve({ d2MembershipId, d2MembershipType });
            });
    });
}

function fetchProfile(d2MembershipId: string, d2MembershipType: string) {
    return new Promise<any>((resolve) => {
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
                resolve(result.Response);
            });
    });
}

async function parseProfile(profile: any) {
    const vaultHash = parseInt(localStorage.getItem("vault_hash") as string);
    const subclassHash = parseInt(localStorage.getItem("subclass_hash") as string);

    const kinetic_hash = parseInt(localStorage.getItem("kinetic_hash") as string);
    const energy_hash = parseInt(localStorage.getItem("energy_hash") as string);
    const power_hash = parseInt(localStorage.getItem("power_hash") as string);
    const helmet_hash = parseInt(localStorage.getItem("helmet_hash") as string);
    const gauntlets_hash = parseInt(localStorage.getItem("gauntlets_hash") as string);
    const chest_hash = parseInt(localStorage.getItem("chest_hash") as string);
    const boots_hash = parseInt(localStorage.getItem("boots_hash") as string);

    function inWeaponBucket(bucketHash: number) {
        return bucketHash === kinetic_hash || bucketHash === energy_hash || bucketHash === power_hash;
    }

    function inArmourBucket(bucketHash: number) {
        return (
            bucketHash === helmet_hash ||
            bucketHash === gauntlets_hash ||
            bucketHash === chest_hash ||
            bucketHash === boots_hash
        );
    }

    function bucketNumber(bucketHash: number) {
        if (bucketHash === kinetic_hash) {
            return 0;
        } else if (bucketHash === energy_hash) {
            return 1;
        } else if (bucketHash === power_hash) {
            return 2;
        } else if (bucketHash === helmet_hash) {
            return 3;
        } else if (bucketHash === gauntlets_hash) {
            return 4;
        } else if (bucketHash === chest_hash) {
            return 5;
        } else if (bucketHash === boots_hash) {
            return 6;
        } else {
            return -1;
        }
    }

    let items = profile.profileInventory.data.items;

    db.transaction("rw", allTables.slice(0, -1), async () => {
        for (let i = 0; i < items.length; i++) {
            if (items[i].bucketHash === vaultHash) {
                let updated = await flagVaultItem(weapons, items[i]);

                if (!updated) {
                    updated = await flagVaultItem(titan_armour, items[i]);

                    if (!updated) {
                        updated = await flagVaultItem(hunter_armour, items[i]);

                        if (!updated) {
                            flagVaultItem(warlock_armour, items[i]);
                        }
                    }
                }
            }
        }
    });

    const characterIds: string[] = Object.keys(profile.characters.data);

    for (let i = 0; i < characterIds.length; i++) {
        const classType = profile.characters.data[characterIds[i]].classType;
        localStorage.setItem("character_" + classType, characterIds[i]);

        const armourTable = getArmourTable(classType);

        const characterInventory = profile.characterInventories.data[characterIds[i]].items;

        for (let j = 0; j < characterInventory.length; j++) {
            const item = characterInventory[j];

            if (inWeaponBucket(item.bucketHash)) {
                flagInventoryItem(weapons, item, classType);
            } else if (inArmourBucket(item.bucketHash)) {
                flagInventoryItem(armourTable, item, classType);
            } else if (item.bucketHash === subclassHash) {
                subclasses.update(item.itemHash, {
                    inInv: classType,
                    instanceId: item.itemInstanceId,
                });
            }
        }

        const characterEquipment = profile.characterEquipment.data[characterIds[i]].items;

        const charEquipped: string[] = ["", "", "", "", "", "", ""];

        for (let j = 0; j < characterEquipment.length; j++) {
            const item = characterEquipment[j];

            if (inWeaponBucket(item.bucketHash)) {
                flagEquippedItem(weapons, item, classType);
                charEquipped[bucketNumber(item.bucketHash)] = item.itemInstanceId;
            } else if (inArmourBucket(characterEquipment[j].bucketHash)) {
                flagEquippedItem(armourTable, item, classType);
                charEquipped[bucketNumber(item.bucketHash)] = item.itemInstanceId;
            } else if (item.bucketHash === subclassHash) {
                subclasses.update(item.itemHash, {
                    equipped: classType,
                    instanceId: item.itemInstanceId,
                });
            }
        }

        localStorage.setItem(classType + "_equipped", JSON.stringify(charEquipped));
    }
}

function flagVaultItem(table: Table<any, IndexableType>, item: any) {
    return table.update(item.itemHash, (i: { owned: boolean; inVault: boolean; instanceIds: string[][] }) => {
        i.owned = true;
        i.inVault = true;
        i.instanceIds[Location.VAULT].push(item.itemInstanceId);
    });
}

function flagInventoryItem(table: Table<any, IndexableType>, item: any, classType: number) {
    return table.update(item.itemHash, (i: { owned: boolean; inInv: number; instanceIds: string[][] }) => {
        i.owned = true;
        i.inInv = classType;
        i.instanceIds[Location.INVENTORY].push(item.itemInstanceId);
    });
}

function flagEquippedItem(table: Table<any, IndexableType>, item: any, classType: number) {
    return table.update(item.itemHash, (i: { owned: boolean; equipped: number; instanceIds: string[][] }) => {
        i.owned = true;
        i.equipped = classType;
        i.instanceIds[Location.EQUIPPED].push(item.itemInstanceId);
    });
}

const Home = () => {
    let [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let canceled = false;

            const count = await weapons.count();

            if (count === 0) {
                setLoading(true);
                fetchManifest().then(async (manifest) => {
                    if (!canceled) {
                        parseManifest(manifest, await fetchPowerCapHashes(manifest)).then(() => setLoading(false));
                    }
                });
            }

            if (localStorage.getItem("access_token")) {
                clearDB().then(() => {
                    if (!canceled) {
                        const bungieMembershipId = localStorage.getItem("bungie_membership_id")!;

                        fetchDisplayName(bungieMembershipId).then((fullDisplayName) =>
                            fetchD2MembershipId(fullDisplayName).then(({ d2MembershipId, d2MembershipType }) =>
                                fetchProfile(d2MembershipId, d2MembershipType).then((profile) => parseProfile(profile))
                            )
                        );
                    }
                });
            }

            return () => {
                canceled = true;
                setLoading(false);
            };
        })();
    }, []);

    return loading ? (
        <LoadingOverlay />
    ) : (
        <div className="h-screen w-screen bg-gray-700">
            <NavBar onLogout={onLogout} />
            <Randomizer />
        </div>
    );
};

export default Home;
