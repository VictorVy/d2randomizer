const LoginCard = () => {
    return (
        <div
            className="bg-green-400
                        text-center 
                        max-w-max max-h-max
                        p-2"
        >
            <p className="m-2">
                <b>Login</b> to begin randomizing
            </p>
            <a href="https://www.bungie.net/en/OAuth/Authorize?client_id=44322&response_type=code">
                <button
                    className="bg-blue-400 text-white
                            hover:bg-blue-600
                            px-2 py-1 my-2"
                >
                    bruh
                </button>
            </a>
        </div>
    );
};

export default LoginCard;
