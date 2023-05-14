const LoginCard = () => {
    return (
        <div
            className="max-h-max
                        max-w-max 
                        bg-green-400 p-2
                        text-center"
        >
            <p className="m-2">
                <b>Login</b> to customize your randomization
            </p>
            <a href="https://www.bungie.net/en/OAuth/Authorize?client_id=44322&response_type=code">
                <button className="my-2 bg-blue-400 px-2 py-1 text-white hover:bg-blue-600">Login</button>
            </a>
        </div>
    );
};

export default LoginCard;
