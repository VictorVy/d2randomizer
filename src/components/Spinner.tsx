// from https://loading.io/

const Spinner = () => {
    return (
        <div
            className="h-9 w-9 animate-[spin_1s_ease_infinite_normal] rounded-full border-[0.4em] border-current border-b-transparent border-l-transparent border-r-transparent opacity-80"
            role="status"
        />
    );
};

export default Spinner;
