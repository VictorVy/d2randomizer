const Login = () => {
    if (window.location.href.includes("code=")) {
        const clientId = "44322";
        const clientSecret = "QxA5VQAHIX-LgRVyamAD1Ld1tLYHc5sVriw-CB06Ejg";
        const apiKey = "bfc8c907315847f280060e3c86073dfa";

        const authCode = window.location.href.split("code=")[1].split("&")[0];

        const formatCode = (code: string) => {
            if (code.length === 0) {
                return "0000";
            } else if (code.length === 1) {
                return "000" + code;
            } else if (code.length === 2) {
                return "00" + code;
            } else if (code.length === 3) {
                return "0" + code;
            } else {
                return code;
            }
        };

        fetch("https://www.bungie.net/Platform/App/OAuth/Token/", {
            method: "POST",
            headers: {
                "X-API-Key": apiKey,
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + window.btoa(clientId + ":" + clientSecret),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: authCode,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.access_token) {
                    localStorage.setItem("access_token", data.access_token);
                    localStorage.setItem("refresh_token", data.refresh_token);
                    localStorage.setItem("bungie_membership_id", data.membership_id);

                    fetch(`https://www.bungie.net/Platform//User/GetBungieNetUserById/${data.membership_id}/`, {
                        method: "GET",
                        headers: {
                            "X-API-Key": apiKey,
                        },
                    })
                        .then((response) => response.json())
                        .then((result) => {
                            localStorage.setItem("bungie_display_name", result.Response.cachedBungieGlobalDisplayName);
                            localStorage.setItem(
                                "bungie_display_name_code",
                                formatCode(result.Response.cachedBungieGlobalDisplayNameCode.toString())
                            );
                            localStorage.setItem("pfp_path", "www.bungie.net" + result.Response.profilePicturePath);

                            fetch(
                                `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/${localStorage.getItem(
                                    "bungie_display_name"
                                )}%23${localStorage.getItem("bungie_display_name_code")}/`,
                                // `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/Dep%230681/`,
                                {
                                    method: "GET",
                                    headers: {
                                        "X-API-Key": apiKey,
                                    },
                                }
                            )
                                .then((response) => response.json())
                                .then((result) => {
                                    localStorage.setItem("d2_membership_id", result.Response[0].membershipId);
                                    localStorage.setItem("d2_membership_type", result.Response[0].membershipType);

                                    window.location.href = "/home";
                                });
                        });
                }
            });
    }

    if (localStorage.getItem("access_token")) {
        window.location.href = "/home";
    }

    return <div className="grid h-screen w-screen place-items-center bg-black" />;
};

export default Login;
