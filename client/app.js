const API = "http://localhost:3000";

let currentGame = null;
let playerSide = null;
let pollingStarted = false;

async function createGame() {

    const response = await fetch(
        API + "/api/game/create",
        {
            method: "POST"
        }
    );

    const data = await response.json();

    currentGame = data.gameCode;
    playerSide = data.side;

    document.getElementById("status").innerHTML = `
        Code de partie :
        <b>${currentGame}</b>
    `;

    showGame();
}

async function joinGame() {

    const gameCode =
        document.getElementById("gameCode").value.trim();

    if (!gameCode) {
        alert("Veuillez saisir un code.");
        return;
    }

    const response = await fetch(
        API + "/api/game/join",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                gameCode
            })
        }
    );

    const data = await response.json();

    if (!data.success) {

        alert(
            data.message ||
            "Impossible de rejoindre la partie"
        );

        return;
    }

    currentGame = gameCode;
    playerSide = data.side;

    showGame();
}

function showGame() {

    document.getElementById("gameArea")
        .style.display = "block";

    document.getElementById("playerSide")
        .innerHTML =
        "Vous êtes : " +
        playerSide.toUpperCase();

    if (!pollingStarted) {

        pollingStarted = true;

        setInterval(
            loadState,
            2000
        );
    }

    loadState();
}

async function loadState() {

    if (!currentGame) {
        return;
    }

    try {

        const response =
            await fetch(
                API +
                "/api/game/state/" +
                currentGame
            );

        const game =
            await response.json();

        document.getElementById(
            "gameStatus"
        ).innerHTML = `
            Etat : ${game.status}<br>
            Tour : ${game.currentPlayer}
        `;

        renderBoard(game);

    } catch (error) {

        console.error(error);
    }
}

function renderBoard(game) {

    const northRow =
        document.getElementById(
            "northRow"
        );

    const southRow =
        document.getElementById(
            "southRow"
        );

    if (!northRow || !southRow) {
        return;
    }

    northRow.innerHTML = "";
    southRow.innerHTML = "";

    // Ligne Nord (affichage inversé)

    for (let i = 6; i >= 0; i--) {

        const pit =
            document.createElement(
                "div"
            );

        pit.className = "pit";

        pit.textContent =
            game.north[i];

        // NORTH peut cliquer seulement sur ses cases

        if (
            playerSide === "north"
        ) {

            pit.style.cursor =
                "pointer";

            pit.onclick =
                () => playMove(i);
        }

        northRow.appendChild(
            pit
        );
    }

    // Ligne Sud

    for (let i = 0; i < 7; i++) {

        const pit =
            document.createElement(
                "div"
            );

        pit.className = "pit";

        pit.textContent =
            game.south[i];

        // SOUTH peut cliquer seulement sur ses cases

        if (
            playerSide === "south"
        ) {

            pit.style.cursor =
                "pointer";

            pit.onclick =
                () => playMove(i);
        }

        southRow.appendChild(
            pit
        );
    }

    document.getElementById(
        "scoreNorth"
    ).textContent =
        game.scoreNorth;

    document.getElementById(
        "scoreSouth"
    ).textContent =
        game.scoreSouth;
}

async function playMove(pitIndex) {

    try {

        const response =
            await fetch(
                API + "/api/game/play",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        gameCode:
                            currentGame,

                        side:
                            playerSide,

                        pitIndex
                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            alert(
                data.message
            );

            return;
        }

        loadState();

    } catch (error) {

        console.error(error);
    }
}
