import Dexie, { IndexableType } from "dexie";
import NavBar from "../components/NavBar";
import Randomizer from "../components/Randomizer";
import { useLiveQuery } from "dexie-react-hooks";

const db = new Dexie("D2Randomizer");
db.version(1).stores({
    weapons: "hash, name, type, tier, slot, ammoType, icon",
    titan_armour: "hash, name, type, tier, slot, icon",
    hunter_armour: "hash, name, type, tier, slot, icon",
    warlock_armour: "hash, name, type, tier, slot, icon",
});

const weapons = db.table("weapons");
const titan_armour = db.table("titan_armour");
const hunter_armour = db.table("hunter_armour");
const warlock_armour = db.table("warlock_armour");

const addWeapon = async (
    hash: number,
    name: string,
    type: string,
    tier: string,
    slot: number,
    ammoType: number,
    icon: string,
    class_type: number,
    damage_type: number
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
    });
};

const addArmour = async (
    hash: number,
    name: string,
    type: string,
    tier: string,
    slot: number,
    icon: string,
    class_type: number
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
    });
};

const Home = () => {
    const logged = localStorage.getItem("access_token") !== null;

    const fetchWeapons = useLiveQuery(() => weapons.toArray(), []);

    if (fetchWeapons?.length === 0) {
        console.log("fetching");

        fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                // fetch power cap
                fetch(
                    "https://www.bungie.net/" +
                        data.Response.jsonWorldComponentContentPaths.en.DestinyPowerCapDefinition
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
                        // fetch weapons/armour and item slot hashes
                        fetch("https://www.bungie.net/" + data.Response.jsonWorldContentPaths.en)
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
                                            item.defaultDamageType
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
                                            item.classType
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
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    });
            });
    }

    return (
        <div className="h-screen w-screen bg-gray-700">
            <NavBar />
            <Randomizer />
        </div>
    );
};

export default Home;
