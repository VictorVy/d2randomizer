interface ToggleProps {
    text: string;
    disabled?: boolean;
    defaultCheck?: boolean;
    forWeapons?: boolean;
    onChange: (b: boolean) => void;
}

const Toggle = ({ text, defaultCheck, forWeapons, disabled, onChange }: ToggleProps) => {
    return (
        <div className="flex">
            <input
                className="peer mr-1 w-8 cursor-pointer appearance-none rounded-full bg-slate-500 bg-opacity-80 duration-150 ease-out after:absolute after:ml-[0.12rem] after:h-4 after:w-4 after:translate-y-[0.12em] after:rounded-full after:bg-white after:opacity-80 after:duration-150 after:ease-out checked:bg-slate-900 checked:after:ml-[0.848rem] after:checked:duration-150 after:hover:opacity-90 disabled:opacity-20"
                type="checkbox"
                id={"toggle-" + text + (forWeapons ? "-weapons" : "-armour")}
                disabled={disabled}
                defaultChecked={defaultCheck}
                onChange={(e) => onChange(e.target.checked)}
            />
            <label
                className="inline-block cursor-pointer pl-[0.15rem] text-sm text-white opacity-90 duration-150 peer-hover:opacity-100"
                htmlFor={"toggle-" + text + (forWeapons ? "-weapons" : "-armour")}
            >
                {text}
            </label>
        </div>
    );
};

export default Toggle;
