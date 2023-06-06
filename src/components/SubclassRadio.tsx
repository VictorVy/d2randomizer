import Dexie from "dexie";
import Tooltip from "./Tooltip";
import { useLiveQuery } from "dexie-react-hooks";
import { Class, Element } from "../utils/Enums";

interface SubclassRadioProps {
    selectedClass: number;
    selectedSubclass: number;
    handleChange: (n: number) => void;
}

const db = new Dexie("D2Randomizer");
db.version(1).stores({
    weapons: "hash, name, type, class_type, tier, slot, ammoType, icon, owned, inVault, inInv, equipped, instanceIds",
    titan_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    hunter_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    warlock_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    subclasses: "hash, name, buildName, class_type, icon, inInv, equipped",
});

const subclasses = db.table("subclasses");

const parseSubclassBuildName = (buildName: string) => {
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
};

function classInterpreter(num: number) {
    switch (num) {
        case Class.TITAN:
            return "titan";
        case Class.HUNTER:
            return "hunter";
        default:
            return "warlock";
    }
}

const SubclassRadio = ({ selectedClass, selectedSubclass, handleChange }: SubclassRadioProps) => {
    const disableSubclass = [false, false, false, false, false];

    const fetchSubclasses = useLiveQuery(() => subclasses.where("class_type").equals(selectedClass).toArray(), []);

    if (localStorage.getItem("access_token")) {
        fetchSubclasses?.forEach((subclass) => {
            const subNum = parseSubclassBuildName(subclass.buildName);

            disableSubclass[subNum] = subclass.inInv === -1 && subclass.equipped === -1;
        });
    }

    return (
        <div className="relative flex items-center space-x-3 rounded bg-black bg-opacity-20 px-3 py-2 shadow">
            <label className="">
                <input
                    className="peer absolute h-0 w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(Element.SOLAR)}
                    defaultChecked
                    checked={selectedSubclass === Element.SOLAR}
                    disabled={disableSubclass[Element.SOLAR]}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-60 duration-75 peer-checked:opacity-95 peer-hover:opacity-95 peer-active:opacity-100 peer-disabled:opacity-10"
                    src="https://www.bungie.net/common/destiny2_content/icons/fedcb91b7ab0584c12f0e9fec730702b.png"
                />
                <Tooltip>{localStorage.getItem("thermal_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(Element.ARC)}
                    defaultChecked
                    checked={selectedSubclass === Element.ARC}
                    disabled={disableSubclass[Element.ARC]}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-60 duration-75 peer-checked:opacity-95 peer-hover:opacity-95 peer-active:opacity-100 peer-disabled:opacity-10"
                    src="https://www.bungie.net/common/destiny2_content/icons/949af7a61d60a8e6071282daafa9e6e9.png"
                />
                <Tooltip>{localStorage.getItem("arc_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(Element.VOID)}
                    defaultChecked
                    checked={selectedSubclass === Element.VOID}
                    disabled={disableSubclass[Element.VOID]}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-60 duration-75 peer-checked:opacity-95 peer-hover:opacity-95 peer-active:opacity-100 peer-disabled:opacity-10"
                    src="https://www.bungie.net/common/destiny2_content/icons/32b112a9460e6f0e2b9ee15dc53fe1c1.png"
                />
                <Tooltip>{localStorage.getItem("void_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(Element.STASIS)}
                    defaultChecked
                    checked={selectedSubclass === Element.STASIS}
                    disabled={disableSubclass[Element.STASIS]}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-60 duration-75 peer-checked:opacity-95 peer-hover:opacity-95 peer-active:opacity-100 peer-disabled:opacity-10"
                    src="https://www.bungie.net/common/destiny2_content/icons/6e441ffa8c8171ce9caf71e51b72fc19.png"
                />
                <Tooltip>{localStorage.getItem("stasis_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(Element.STRAND)}
                    defaultChecked
                    checked={selectedSubclass === Element.STRAND}
                    disabled={disableSubclass[Element.STRAND]}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-60 duration-75 peer-checked:opacity-95 peer-hover:opacity-95 peer-active:opacity-100 peer-disabled:opacity-10"
                    src="https://www.bungie.net/common/destiny2_content/icons/41c0024ce809085ac16f4e0777ea0ac4.png"
                />
                <Tooltip>{localStorage.getItem("strand_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
        </div>
    );
};

export default SubclassRadio;
