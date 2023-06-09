import LoadingOverlay from "../components/LoadingOverlay";

const Login = () => {
    if (window.location.href.includes("code=")) {
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
        const apiKey = import.meta.env.VITE_API_KEY;

        const authCode = window.location.href.split("code=")[1].split("&")[0];

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

                    window.location.href = "/";
                }
            });
    }

    if (localStorage.getItem("access_token")) {
        window.location.href = "/";
    }

    return (
        <div className="h-screen w-screen bg-black">
            <LoadingOverlay loading={true} />
        </div>
    );
};

export default Login;
