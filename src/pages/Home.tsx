const Home = () => {
    let authCode;

    if (window.location.href.includes("code=")) {
        authCode = window.location.href.split("code=")[1].split("&")[0];
        console.log(authCode);
    }

    return <div>{authCode}</div>;
};

export default Home;
