const Home = () => {
    if (window.location.href.includes("code=")) {
        const clientId = "44322";
        const clientSecret = "QxA5VQAHIX-LgRVyamAD1Ld1tLYHc5sVriw-CB06Ejg";
        const apiKey = "bfc8c907315847f280060e3c86073dfa";

        const authCode = window.location.href.split("code=")[1].split("&")[0];
        console.log(authCode);

        fetch("https://www.bungie.net/Platform/App/OAuth/Token/", {
            method: "POST",
            headers: {
                "X-API-Key": apiKey,
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + window.btoa(clientId + ":" + clientSecret),
            },
            body: new URLSearchParams({
                // "client_id": clientId,
                // "client_secret": clientSecret,
                "grant_type": "authorization_code",
                "code": authCode,
            }),
        })
            .then((response) => {
                console.log(response);
                return response.json();
            })
            .then((data) => console.log(data));

        return <div>{authCode}</div>;
    }

    return <div>bruh</div>;
};

export default Home;
