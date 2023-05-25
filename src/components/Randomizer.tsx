import ClassRadio from "./ClassRadio";
import LoadoutSlot from "./LoadoutSlot";
import Dexie, { IndexableType } from "dexie";

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

const Randomizer = () => {
    const TITAN: number = 0;
    const HUNTER: number = 1;
    const WARLOCK: number = 2;

    const SLOT_HASHES: string[] = [
        localStorage.getItem("kinetic_hash")!,
        localStorage.getItem("energy_hash")!,
        localStorage.getItem("power_hash")!,
        localStorage.getItem("helmet_hash")!,
        localStorage.getItem("gauntlets_hash")!,
        localStorage.getItem("chest_hash")!,
        localStorage.getItem("boots_hash")!,
    ];

    let selectedClass: number = HUNTER;
    let exoticChosen: boolean = false;

    const setSelectedClass = (newSelectedClass: number) => {
        selectedClass = newSelectedClass;
    };

    const chooseWeapon = (slotHash: string, rarity: string) => {
        console.log(slotHash);

        weapons
            .where("slot")
            .equals(parseInt(slotHash))
            .and((weapon) => (rarity.startsWith("!") ? weapon.tier !== rarity.substring(1) : weapon.tier === rarity))
            .and((weapon) => weapon.class_type === selectedClass || weapon.class_type === 3)
            .toArray()
            .then((exoticWeapons) => {
                const randomIndex = Math.floor(Math.random() * exoticWeapons.length);
                const chosenExotic = exoticWeapons[randomIndex];

                console.log(chosenExotic);
            });
    };

    const chooseArmour = (slotHash: string, rarity: string) => {
        console.log(slotHash);

        let armourTable: Dexie.Table<any, IndexableType>;

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
            .and((armour) => (rarity.startsWith("!") ? armour.tier !== rarity.substring(1) : armour.tier === rarity))
            .and((armour) => armour.class_type === selectedClass || armour.class_type === 3)
            .toArray()
            .then((exoticArmour) => {
                const randomIndex = Math.floor(Math.random() * exoticArmour.length);
                const chosenExotic = exoticArmour[randomIndex];

                console.log(chosenExotic);
            });
    };

    const randomize = () => {
        exoticChosen = false;

        const exoticSlot = Math.floor(Math.random() * 7);

        while (!exoticChosen) {
            if (exoticSlot < 3) {
                chooseWeapon(SLOT_HASHES[exoticSlot], "!Exotic");
            } else {
                chooseArmour(SLOT_HASHES[exoticSlot], "!Exotic");
            }

            exoticChosen = true;
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 p-12">
            <ClassRadio handleChange={setSelectedClass} />
            <div className="bg-red grid grid-cols-2 gap-x-20 gap-y-8">
                <LoadoutSlot /> {/* kinetic weapon */}
                <LoadoutSlot /> {/* helmet */}
                <LoadoutSlot /> {/* energy weapon */}
                <LoadoutSlot /> {/* gauntlets */}
                <LoadoutSlot /> {/* power weapon */}
                <LoadoutSlot /> {/* chest */}
                <div />
                <LoadoutSlot /> {/* boots */}
            </div>
            <button
                className="rounded border-b-2 border-black bg-gray-900 px-4 py-2 font-bold text-white hover:border-gray-900 hover:bg-gray-800"
                onClick={randomize}
            >
                randomize
            </button>
        </div>
    );
};

export default Randomizer;
