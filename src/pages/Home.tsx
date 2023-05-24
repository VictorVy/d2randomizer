import Dexie from "dexie";
import NavBar from "../components/NavBar";
import { useLiveQuery } from "dexie-react-hooks";

const db = new Dexie("D2Randomizer");
db.version(1).stores({
    weapons: "hash, name, type, tier, slot, ammoType, icon",
    armour: "hash, name, type, tier, slot, icon",
});

const weapons = db.table("weapons");
const armour = db.table("armour");

const addWeapon = async (
    hash: number,
    name: string,
    type: string,
    tier: string,
    slot: string,
    ammoType: string,
    icon: string
) => {
    await weapons.add({
        hash: hash,
        name: name,
        type: type,
        tier: tier,
        slot: slot,
        ammoType: ammoType,
        icon: icon,
    });
};

const addArmour = async (hash: number, name: string, type: string, tier: string, slot: string, icon: string) => {
    await armour.add({
        hash: hash,
        name: name,
        type: type,
        tier: tier,
        slot: slot,
        icon: icon,
    });
};

const Home = () => {
    const logged = localStorage.getItem("access_token") !== null;

    const fetchWeapons = useLiveQuery(() => weapons.toArray(), []);
    const fetchArmour = useLiveQuery(() => armour.toArray(), []);

    if (fetchWeapons?.length === 0 && fetchArmour?.length === 0) {
        console.log("fetching");

        fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", {
            method: "GET",
            headers: {},
        })
            .then((response) => response.json())
            .then((data) => {
                fetch("https://www.bungie.net/" + data.Response.jsonWorldContentPaths.en)
                    .then((response) => response.json())
                    .then((data) => {
                        let keys = Object.keys(data.DestinyInventoryItemDefinition);

                        for (let i = 0; i < keys.length; i++) {
                            const item = data.DestinyInventoryItemDefinition[keys[i]];

                            if (item.itemType === 3) {
                                addWeapon(
                                    item.hash,
                                    item.displayProperties.name,
                                    item.itemTypeDisplayName,
                                    item.inventory.tierTypeName,
                                    item.equippingBlock.equipmentSlotTypeDisplayName,
                                    item.equippingBlock.ammoTypeDisplayName,
                                    item.displayProperties.icon
                                );
                            } else if (item.itemType === 2) {
                                addArmour(
                                    item.hash,
                                    item.displayProperties.name,
                                    item.itemTypeDisplayName,
                                    item.inventory.tierTypeName,
                                    item.equippingBlock.equipmentSlotTypeDisplayName,
                                    item.displayProperties.icon
                                );
                            }
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            });
    }

    return (
        <div className="">
            <NavBar />
        </div>
    );
};

export default Home;
