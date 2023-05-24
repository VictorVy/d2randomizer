import NavBar from "../components/NavBar";

const Home = () => {
    const logged = localStorage.getItem("access_token") !== null;
    const fetched = localStorage.getItem("weapons") !== null;

    fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", {
        method: "GET",
        headers: {},
    })
        .then((response) => response.json())
        .then((data) => {
            fetch("https://www.bungie.net/" + data.Response.jsonWorldContentPaths.en)
                .then((response) => response.json())
                .then((data) => {
                    let keys = Object.keys(data.DestinyInventoryItemDefinition);

                    const weapons = new Map();
                    const armour = new Map();

                    for (let i = 0; i < keys.length; i++) {
                        const item = data.DestinyInventoryItemDefinition[keys[i]];

                        if (item.itemType === 3) {
                            weapons.set(item.hash, item);
                        } else if (item.itemType === 2) {
                            armour.set(item.hash, item);
                        }
                    }

                    // localStorage.setItem("weapons", JSON.stringify(Array.from(weapons.entries())));
                    // localStorage.setItem("armour", JSON.stringify(Array.from(armour.entries())));

                    // console.log(localStorage.getItem("weapons"));
                })
                .catch((error) => {
                    console.log(error);
                });
        });

    return (
        <div className="">
            <NavBar />
        </div>
    );
};

export default Home;
