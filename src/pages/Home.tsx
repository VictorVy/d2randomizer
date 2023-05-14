// import { useState } from "react";
import NavBar from "../components/NavBar";

const Home = () => {
    // const [name, setName] = useState("bruh2");
    // const [memId, setMemId] = useState("bruh1");

    // fetch("https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/Dep%230681/", {
    //     method: "GET",
    //     headers: {
    //         "X-API-Key": "bfc8c907315847f280060e3c86073dfa",
    //     },
    // })
    //     .then((response) => response.json())
    //     .then((result) => {
    //         setMemId(result.Response[0].membershipId);
    //         setName(result.Response[0].displayName + "#" + result.Response[0].bungieGlobalDisplayNameCode);
    //     });

    // return (
    //     <div className="flex-col">
    //         {localStorage.getItem("access_token")}
    //         <h1>{name}</h1>
    //         <h1>{memId}</h1>
    //     </div>
    // );

    return (
        <div>
            <NavBar />
        </div>
    );
};

export default Home;
