import NavBar from "../components/NavBar";

const Home = () => {
    const logged = localStorage.getItem("access_token") !== null;

    // fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", {
    //     method: "GET",
    //     headers: {},
    // })
    //     .then((response) => response.json())
    //     .then((data) => {
    //         localStorage.setItem("manifest", data.Response.jsonWorldContentPaths.en);
    //     });

    return (
        <div className="">
            <NavBar />
        </div>
    );
};

export default Home;
