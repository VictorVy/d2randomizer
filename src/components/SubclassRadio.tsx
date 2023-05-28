import Dexie from "dexie";
import Tooltip from "./Tooltip";

interface SubclassRadioProps {
    selectedClass: number;
    selectedElement: number;
    handleChange: (n: number) => void;
}

const SubclassRadio = ({ selectedClass, selectedElement, handleChange }: SubclassRadioProps) => {
    const SOLAR = 0;
    const ARC = 1;
    const VOID = 2;
    const STASIS = 3;
    const STRAND = 4;

    function classInterpreter(num: number) {
        switch (num) {
            case 0:
                return "titan";
            case 1:
                return "hunter";
            default:
                return "warlock";
        }
    }

    return (
        <div className="relative flex items-center space-x-3 rounded bg-black bg-opacity-30 px-3 py-2 shadow">
            <label className="">
                <input
                    className="peer absolute h-0 w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(SOLAR)}
                    defaultChecked
                    checked={selectedElement === SOLAR}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    src="https://www.bungie.net/common/destiny2_content/icons/fedcb91b7ab0584c12f0e9fec730702b.png"
                />
                <Tooltip>{localStorage.getItem("thermal_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(ARC)}
                    defaultChecked
                    checked={selectedElement === ARC}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    src="https://www.bungie.net/common/destiny2_content/icons/949af7a61d60a8e6071282daafa9e6e9.png"
                />
                <Tooltip>{localStorage.getItem("arc_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(VOID)}
                    defaultChecked
                    checked={selectedElement === VOID}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    src="https://www.bungie.net/common/destiny2_content/icons/32b112a9460e6f0e2b9ee15dc53fe1c1.png"
                />
                <Tooltip>{localStorage.getItem("void_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(STASIS)}
                    defaultChecked
                    checked={selectedElement === STASIS}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    src="https://www.bungie.net/common/destiny2_content/icons/6e441ffa8c8171ce9caf71e51b72fc19.png"
                />
                <Tooltip>{localStorage.getItem("stasis_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
            <label className="">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="subclass-radio"
                    onChange={() => handleChange(STRAND)}
                    defaultChecked
                    checked={selectedElement === STRAND}
                />
                <img
                    className="w-10 cursor-pointer rounded bg-black bg-opacity-25 opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    src="https://www.bungie.net/common/destiny2_content/icons/41c0024ce809085ac16f4e0777ea0ac4.png"
                />
                <Tooltip>{localStorage.getItem("strand_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
        </div>
    );
};

export default SubclassRadio;
