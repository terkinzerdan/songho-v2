const express = require("express");
const cors = require("cors");
const path = require("path");

const games = require("./games");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../client")
    )
);

const PORT = process.env.PORT || 3000;


function generateCode() {

    let code;

    do {

        code =
            "SGH-" +
            Math.floor(
                100000 +
                Math.random() * 900000
            );

    } while (games[code]);

    return code;
}


app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../client",
            "index.html"
        )
    );

});



app.post("/api/game/create", (req, res) => {

    const code = generateCode();

    games[code] = {

        code,

        north: [5, 5, 5, 5, 5, 5, 5],

        south: [5, 5, 5, 5, 5, 5, 5],

        scoreNorth: 0,

        scoreSouth: 0,

        currentPlayer: "south",

        playerSouth: "PLAYER1",

        playerNorth: null,

        status: "waiting"
    };

    res.json({
        success: true,
        gameCode: code,
        side: "south"
    });

});



app.post("/api/game/join", (req, res) => {

    const { gameCode } = req.body;

    if (!gameCode) {

        return res.status(400).json({
            success: false,
            message: "Code manquant"
        });
    }

    const game = games[gameCode];

    if (!game) {

        return res.status(404).json({
            success: false,
            message: "Partie introuvable"
        });
    }

    if (game.playerNorth) {

        return res.status(400).json({
            success: false,
            message: "Partie complète"
        });
    }

    game.playerNorth = "PLAYER2";

    game.status = "ready";

    res.json({
        success: true,
        side: "north",
        game
    });

});



app.get("/api/game/state/:code", (req, res) => {

    const game =
        games[
            req.params.code
        ];

    if (!game) {

        return res.status(404).json({
            success: false,
            message: "Partie introuvable"
        });
    }

    res.json(game);

});



app.post("/api/game/play", (req, res) => {

    const {
        gameCode,
        side,
        pitIndex
    } = req.body;

    const game =
        games[gameCode];

    if (!game) {

        return res.status(404).json({
            success: false,
            message: "Partie introuvable"
        });
    }

    if (
        side !== "south" &&
        side !== "north"
    ) {

        return res.status(400).json({
            success: false,
            message: "Camp invalide"
        });
    }

    if (
        game.currentPlayer !== side
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Ce n'est pas votre tour"
        });
    }

    const board =
        side === "south"
            ? game.south
            : game.north;

    if (
        typeof pitIndex !== "number" ||
        pitIndex < 0 ||
        pitIndex > 6
    ) {

        return res.status(400).json({
            success: false,
            message: "Case invalide"
        });
    }

    if (
        board[pitIndex] === 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Case vide"
        });
    }

   

    board[pitIndex]--;

    

    game.currentPlayer =
        side === "south"
            ? "north"
            : "south";

    res.json({
        success: true,
        game
    });

});



app.listen(PORT, 0.0.0.0,() => {

    console.log(
        `SONGHO SERVER RUNNING ON PORT ${PORT}`
    );

});
