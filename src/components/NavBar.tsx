const NavBar = () => {
    const logged = localStorage.getItem("access_token") !== null;

    return (
        <div className="grid grid-cols-2 bg-gray-800 px-4 py-2 text-white">
            <div className="m-1 flex justify-self-start">
                <a href="/" className="">
                    <h1 className="text-2xl font-bold">D2Randomizer</h1>
                </a>
            </div>
            <div className="m-1 flex justify-self-end">
                <h2 className="mx-3 my-1">
                    {logged
                        ? localStorage.getItem("bungie_display_name") +
                          "#" +
                          localStorage.getItem("bungie_display_name_code")
                        : "Guest"}
                </h2>
                <img src="www.bungie.net/img/profile/avatars/ccavatar2021113.jpg" />
                <button
                    className="w-20 bg-gray-700 px-2 py-1 hover:bg-gray-600"
                    onClick={
                        logged
                            ? () => {
                                  localStorage.clear();
                                  window.location.href = "/";
                              }
                            : () =>
                                  (window.location.href =
                                      "https://www.bungie.net/en/OAuth/Authorize?client_id=44322&response_type=code")
                    }
                >
                    {logged ? "Logout" : "Login"}
                </button>
            </div>
        </div>
    );
};

export default NavBar;
