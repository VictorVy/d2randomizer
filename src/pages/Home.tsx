import Dexie, { IndexableType } from "dexie";
import NavBar from "../components/NavBar";
import Randomizer from "../components/Randomizer";
import { useLiveQuery } from "dexie-react-hooks";

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

    Promise.all(tasks).then(() => {
        window.location.href = "/";
    });
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

                        localStorage.setItem("num_hashes", numHashes.toString());
                    })
                    .then(() => {
                        // fetch weapons/armour, item slot hashes, ad subclasses
                        fetch("https://www.bungie.net" + data.Response.jsonWorldContentPaths.en)
                            .then((response) => response.json())
                            .then((data) => {
                                let keys = Object.keys(data.DestinyInventoryItemDefinition);

                                const nonSunset = (hash: number) => {
                                    for (let i = 0; i < parseInt(localStorage.getItem("num_hashes") as string); i++) {
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

    return (
        <div className="h-screen w-screen bg-gray-700">
            <NavBar onLogout={onLogout} />
            <Randomizer />
        </div>
    );
};

export default Home;
