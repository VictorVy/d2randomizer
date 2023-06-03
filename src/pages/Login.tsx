import Dexie from "dexie";

const db = new Dexie("D2Randomizer");
db.version(1).stores({
    weapons: "hash, name, type, class_type, tier, slot, ammoType, icon, owned, inVault, inInv, equipped, instanceIds",
    titan_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    hunter_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    warlock_armour: "hash, name, type, class_type, tier, slot, icon, owned, inVault, inInv, equipped, instanceIds",
    subclasses: "hash, name, buildName, class_type, icon, inInv, equipped",
});

const weapons = db.table("weapons");
const titan_armour = db.table("titan_armour");
const hunter_armour = db.table("hunter_armour");
const warlock_armour = db.table("warlock_armour");
const subclasses = db.table("subclasses");

const Login = () => {
    if (window.location.href.includes("code=")) {
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
        const apiKey = import.meta.env.VITE_API_KEY;

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
                            localStorage.setItem(
                                "pfp_path",
                                "https://www.bungie.net" + result.Response.profilePicturePath
                            );

                            fetch(
                                `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/${localStorage.getItem(
                                    "bungie_display_name"
                                )}%23${localStorage.getItem("bungie_display_name_code")}/`,
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

                                    fetch(
                                        `https://www.bungie.net/Platform/Destiny2/${result.Response[0].membershipType}/Profile/${result.Response[0].membershipId}/?components=102,200,201,205,300`,
                                        {
                                            method: "GET",
                                            headers: {
                                                "X-API-Key": apiKey,
                                                Authorization: "Bearer " + localStorage.getItem("access_token"),
                                            },
                                        }
                                    )
                                        .then((response) => response.json())
                                        .then(async (result) => {
                                            const vaultHash = parseInt(localStorage.getItem("vault_hash") as string);
                                            const subclassHash = parseInt(
                                                localStorage.getItem("subclass_hash") as string
                                            );

                                            const kinetic_hash = parseInt(
                                                localStorage.getItem("kinetic_hash") as string
                                            );
                                            const energy_hash = parseInt(localStorage.getItem("energy_hash") as string);
                                            const power_hash = parseInt(localStorage.getItem("power_hash") as string);
                                            const helmet_hash = parseInt(localStorage.getItem("helmet_hash") as string);
                                            const gauntlets_hash = parseInt(
                                                localStorage.getItem("gauntlets_hash") as string
                                            );
                                            const chest_hash = parseInt(localStorage.getItem("chest_hash") as string);
                                            const boots_hash = parseInt(localStorage.getItem("boots_hash") as string);

                                            let items = result.Response.profileInventory.data.items;

                                            for (let i = 0; i < items.length; i++) {
                                                if (items[i].bucketHash === vaultHash) {
                                                    await weapons
                                                        .update(
                                                            items[i].itemHash,
                                                            (weapon: {
                                                                owned: boolean;
                                                                inVault: boolean;
                                                                instanceIds: string[][];
                                                            }) => {
                                                                weapon.owned = true;
                                                                weapon.inVault = true;
                                                                weapon.instanceIds[0].push(items[i].itemInstanceId);
                                                            }
                                                        )
                                                        .then((updated) => {
                                                            if (!updated) {
                                                                titan_armour
                                                                    .update(
                                                                        items[i].itemHash,
                                                                        (armour: {
                                                                            owned: boolean;
                                                                            inVault: boolean;
                                                                            instanceIds: string[][];
                                                                        }) => {
                                                                            armour.owned = true;
                                                                            armour.inVault = true;
                                                                            armour.instanceIds[0].push(
                                                                                items[i].itemInstanceId
                                                                            );
                                                                        }
                                                                    )
                                                                    .then((updated) => {
                                                                        if (!updated) {
                                                                            hunter_armour
                                                                                .update(
                                                                                    items[i].itemHash,
                                                                                    (armour: {
                                                                                        owned: boolean;
                                                                                        inVault: boolean;
                                                                                        instanceIds: string[][];
                                                                                    }) => {
                                                                                        armour.owned = true;
                                                                                        armour.inVault = true;
                                                                                        armour.instanceIds[0].push(
                                                                                            items[i].itemInstanceId
                                                                                        );
                                                                                    }
                                                                                )
                                                                                .then((updated) => {
                                                                                    if (!updated) {
                                                                                        warlock_armour.update(
                                                                                            items[i].itemHash,
                                                                                            (armour: {
                                                                                                owned: boolean;
                                                                                                inVault: boolean;
                                                                                                instanceIds: string[][];
                                                                                            }) => {
                                                                                                armour.owned = true;
                                                                                                armour.inVault = true;
                                                                                                armour.instanceIds[0].push(
                                                                                                    items[i]
                                                                                                        .itemInstanceId
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                });
                                                                        }
                                                                    });
                                                            }
                                                        });
                                                }
                                            }

                                            const characterIds: string[] = Object.keys(result.Response.characters.data);

                                            for (let i = 0; i < characterIds.length; i++) {
                                                const classType =
                                                    result.Response.characters.data[characterIds[i]].classType;
                                                localStorage.setItem("character_" + classType, characterIds[i]);

                                                const armourTable =
                                                    classType === 0
                                                        ? titan_armour
                                                        : classType === 1
                                                        ? hunter_armour
                                                        : warlock_armour;

                                                const characterInventory =
                                                    result.Response.characterInventories.data[characterIds[i]].items;

                                                for (let j = 0; j < characterInventory.length; j++) {
                                                    if (
                                                        characterInventory[j].bucketHash === kinetic_hash ||
                                                        characterInventory[j].bucketHash === energy_hash ||
                                                        characterInventory[j].bucketHash === power_hash
                                                    ) {
                                                        await weapons.update(
                                                            characterInventory[j].itemHash,
                                                            (weapon: {
                                                                owned: boolean;
                                                                inInv: number;
                                                                instanceIds: string[][];
                                                            }) => {
                                                                weapon.owned = true;
                                                                weapon.inInv = classType;
                                                                weapon.instanceIds[1].push(
                                                                    characterInventory[j].itemInstanceId
                                                                );
                                                            }
                                                        );
                                                    } else if (
                                                        characterInventory[j].bucketHash === helmet_hash ||
                                                        characterInventory[j].bucketHash === gauntlets_hash ||
                                                        characterInventory[j].bucketHash === chest_hash ||
                                                        characterInventory[j].bucketHash === boots_hash
                                                    ) {
                                                        await armourTable.update(
                                                            characterInventory[j].itemHash,
                                                            (armour: {
                                                                owned: boolean;
                                                                inInv: number;
                                                                instanceIds: string[][];
                                                            }) => {
                                                                armour.owned = true;
                                                                armour.inInv = classType;
                                                                armour.instanceIds[1].push(
                                                                    characterInventory[j].itemInstanceId
                                                                );
                                                            }
                                                        );
                                                    } else if (characterInventory[j].bucketHash === subclassHash) {
                                                        await subclasses.update(characterInventory[j].itemHash, {
                                                            inInv: classType,
                                                        });
                                                    }
                                                }

                                                const characterEquipment =
                                                    result.Response.characterEquipment.data[characterIds[i]].items;

                                                for (let j = 0; j < characterEquipment.length; j++) {
                                                    if (
                                                        characterEquipment[j].bucketHash === kinetic_hash ||
                                                        characterEquipment[j].bucketHash === energy_hash ||
                                                        characterEquipment[j].bucketHash === power_hash
                                                    ) {
                                                        await weapons.update(
                                                            characterEquipment[j].itemHash,
                                                            (weapon: {
                                                                owned: boolean;
                                                                equipped: number;
                                                                instanceIds: string[][];
                                                            }) => {
                                                                weapon.owned = true;
                                                                weapon.equipped = classType;
                                                                weapon.instanceIds[2].push(
                                                                    characterEquipment[j].itemInstanceId
                                                                );
                                                            }
                                                        );
                                                    } else if (
                                                        characterEquipment[j].bucketHash === helmet_hash ||
                                                        characterEquipment[j].bucketHash === gauntlets_hash ||
                                                        characterEquipment[j].bucketHash === chest_hash ||
                                                        characterEquipment[j].bucketHash === boots_hash
                                                    ) {
                                                        await armourTable.update(
                                                            characterEquipment[j].itemHash,
                                                            (armour: {
                                                                owned: boolean;
                                                                equipped: number;
                                                                instanceIds: string[][];
                                                            }) => {
                                                                armour.owned = true;
                                                                armour.equipped = classType;
                                                                armour.instanceIds[2].push(
                                                                    characterEquipment[j].itemInstanceId
                                                                );
                                                            }
                                                        );
                                                    } else if (characterEquipment[j].bucketHash === subclassHash) {
                                                        await subclasses.update(characterEquipment[j].itemHash, {
                                                            equipped: classType,
                                                        });
                                                    }
                                                }
                                            }

                                            window.location.href = "/home";
                                        });
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
