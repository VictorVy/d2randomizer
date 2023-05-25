import ClassRadio from "./ClassRadio";
import LoadoutSlot from "./LoadoutSlot";

const Randomizer = () => {
    const TITAN: number = 0;
    const HUNTER: number = 1;
    const WARLOCK: number = 2;

    let selectedClass: number = HUNTER;

    const setSelectedClass = (newSelectedClass: number) => {
        selectedClass = newSelectedClass;
        console.log(selectedClass);
    };

    return (
        <div className="flex flex-col items-center gap-12 p-16">
            <ClassRadio handleChange={setSelectedClass} />
            <div className="bg-red grid grid-cols-2 gap-x-16 gap-y-8">
                <LoadoutSlot /> {/* kinetic weapon */}
                <LoadoutSlot /> {/* helmet */}
                <LoadoutSlot /> {/* energy weapon */}
                <LoadoutSlot /> {/* gauntlets */}
                <LoadoutSlot /> {/* heavy weapon */}
                <LoadoutSlot /> {/* boots */}
            </div>
            <button className="rounded border-b-2 border-black bg-gray-900 px-4 py-2 font-bold text-white hover:border-gray-900 hover:bg-gray-800">
                randomize
            </button>
        </div>
    );
};

export default Randomizer;
