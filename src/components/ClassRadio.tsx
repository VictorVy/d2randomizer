interface ClassRadioProps {
    selectedClass: number;
    handleChange: (n: number) => void;
}

const ClassRadio = ({ selectedClass, handleChange }: ClassRadioProps) => {
    const TITAN: number = 0;
    const HUNTER: number = 1;
    const WARLOCK: number = 2;

    return (
        <div className="m-2 flex max-w-min items-center rounded-md bg-black bg-opacity-30 p-2 shadow">
            <label title="Titan" className="px-2">
                <input
                    className="peer absolute h-0 w-0"
                    type="radio"
                    name="class-radio"
                    onChange={() => handleChange(TITAN)}
                    checked={selectedClass === TITAN}
                />
                <svg
                    className="fill-white opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                >
                    <path d="m14.839 15.979-13.178-7.609v15.218zm2.322 0 13.178 7.609v-15.218zm5.485-12.175-6.589-3.804-13.178 7.609 13.178 7.609 13.179-7.609zm0 16.784-6.589-3.805-13.178 7.609 13.178 7.608 13.179-7.608-6.59-3.805z" />
                </svg>
            </label>
            <label title="Hunter" className="px-2">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="class-radio"
                    onChange={() => handleChange(HUNTER)}
                    defaultChecked
                    checked={selectedClass === HUNTER}
                />
                <svg
                    className="fill-white opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                >
                    <path d="m9.055 10.446 6.945-.023-6.948 10.451 6.948-.024-7.412 11.15h-7.045l7.036-10.428h-7.036l7.032-10.422h-7.032l7.507-11.126 6.95-.024zm13.89 0-6.945-10.446 6.95.024 7.507 11.126h-7.032l7.032 10.422h-7.036l7.036 10.428h-7.045l-7.412-11.15 6.948.024-6.948-10.451z" />
                </svg>
            </label>
            <label title="Warlock" className="px-2">
                <input
                    className="peer absolute w-0"
                    type="radio"
                    name="class-radio"
                    onChange={() => handleChange(WARLOCK)}
                    checked={selectedClass === WARLOCK}
                />
                <svg
                    className="fill-white opacity-50 peer-checked:opacity-90 peer-hover:opacity-90 peer-active:opacity-100"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                >
                    <path d="m5.442 23.986 7.255-11.65-2.71-4.322-9.987 15.972zm5.986 0 4.28-6.849-2.717-4.333-6.992 11.182zm7.83-11.611 7.316 11.611h5.426l-10.015-15.972zm-7.26 11.611h8.004l-4.008-6.392zm6.991-11.182-2.703 4.324 4.302 6.858h5.413zm-5.707-.459 2.71-4.331 2.71 4.331-2.703 4.326z" />
                </svg>
            </label>
        </div>
    );
};

export default ClassRadio;
