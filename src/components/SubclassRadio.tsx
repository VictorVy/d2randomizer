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
                    src={localStorage.getItem("thermal_hunter_icon") as string}
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
                    src={localStorage.getItem("arc_hunter_icon") as string}
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
                    src={localStorage.getItem("void_hunter_icon") as string}
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
                    src={localStorage.getItem("stasis_hunter_icon") as string}
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
                    src={localStorage.getItem("strand_hunter_icon") as string}
                />
                <Tooltip>{localStorage.getItem("strand_" + classInterpreter(selectedClass))}</Tooltip>
            </label>
        </div>
    );
};

export default SubclassRadio;
