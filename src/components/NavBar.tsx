const NavBar = () => {
    const logged = localStorage.getItem("access_token") !== null;
    const pfpPath = "" + localStorage.getItem("pfp_path");

    return (
        <div className="grid grid-cols-2 bg-gray-800 px-4 py-2 text-white">
            <div className="m-1 flex justify-self-start">
                <a href="/" className="">
                    <h1 className="text-2xl font-bold">D2Randomizer</h1>
                </a>
            </div>
            <div className="m-1 flex justify-self-end">
                <h2 className="my-1">
                    {logged
                        ? localStorage.getItem("bungie_display_name") +
                          "#" +
                          localStorage.getItem("bungie_display_name_code")
                        : "Guest"}
                </h2>
                {logged ? (
                    <img className="mx-3 h-8 w-8" src={pfpPath} />
                ) : (
                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-2 my-1"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                )}
                <button
                    className="w-20 rounded border-b-2 border-black bg-gray-700 px-2 py-1 font-semibold shadow hover:border-gray-950 hover:bg-gray-600"
                    onClick={
                        logged
                            ? () => {
                                  localStorage.clear();
                                  window.location.href = "/";
                              }
                            : () =>
                                  (window.location.href = `https://www.bungie.net/en/OAuth/Authorize?client_id=${
                                      import.meta.env.VITE_CLIENT_ID
                                  }&response_type=code`)
                    }
                >
                    {logged ? "Logout" : "Login"}
                </button>
            </div>
        </div>
    );
};

export default NavBar;
