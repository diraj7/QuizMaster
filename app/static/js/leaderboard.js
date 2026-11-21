const message = document.getElementById("message");
const quizSelect = document.getElementById("quiz-select");
const tableBody = document.getElementById("leaderboard-body");

function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}

async function loadLeaderboard() {
    tableBody.innerHTML = "";
    message.textContent = "";
    const response = await fetch("/api/quizzes/" + quizSelect.value + "/leaderboard");
    if (!response.ok) {
        message.textContent = "Could not load the leaderboard.";
        return;
    }
    const attempts = await response.json();
    if (attempts.length === 0) {
        message.textContent = "No attempts yet for this quiz.";
    }
    attempts.forEach(function (attempt, index) {
        const row = document.createElement("tr");
        addCell(row, index + 1);
        addCell(row, attempt.player_name);
        addCell(row, attempt.score + " / " + attempt.total_questions);
        addCell(row, attempt.time_taken_seconds);
        tableBody.appendChild(row);
    });
}

async function loadQuizzes() {
    try {
        const response = await fetch("/api/quizzes");

        if (!response.ok) {
            message.textContent = "Could not load quizzes.";
            return;
        }

        const quizzes = await response.json();

        if (quizzes.length === 0) {
            message.textContent = "No quizzes yet.";
            return;
        }

        quizzes.forEach(function (quiz) {
            const option = document.createElement("option");
            option.value = quiz.id;
            option.textContent = quiz.title;
            quizSelect.appendChild(option);
        });

        // The result page links here with ?quiz=<id>
        const wantedId = new URLSearchParams(window.location.search).get("quiz");

        if (wantedId) {
            quizSelect.value = wantedId;
        }

        loadLeaderboard();

    } catch (error) {
        message.textContent = "Could not load quizzes.";
    }
}
    if (quizzes.length === 0) {
        message.textContent = "No quizzes yet.";
        return;
    }
    quizzes.forEach(function (quiz) {
        const option = document.createElement("option");
        option.value = quiz.id;
        option.textContent = quiz.title;
        quizSelect.appendChild(option);
    });

    // The result page links here with ?quiz=<id>
    const wantedId = new URLSearchParams(window.location.search).get("quiz");
    if (wantedId) {
        quizSelect.value = wantedId;
    }
    loadLeaderboard();
}

quizSelect.addEventListener("change", loadLeaderboard);

loadQuizzes();



const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("shows an error when quizzes cannot load due to network failure", async () => {
    const message = { textContent: "" };
    const quizSelect = {
        value: "",
        addEventListener: () => {},
        appendChild: () => {},
    };
    const tableBody = { innerHTML: "" };

    const elements = {
        message,
        "quiz-select": quizSelect,
        "leaderboard-body": tableBody,
    };

    const document = {
        getElementById: (id) => elements[id],
        createElement: () => ({
            appendChild: () => {},
            set textContent(value) {},
        }),
    };

    const source = fs.readFileSync(
        path.join(process.cwd(), "app/static/js/leaderboard.js"),
        "utf8"
    );

    vm.runInNewContext(source, {
        document,
        window: { location: { search: "" } },
        URLSearchParams,
        fetch: async () => {
            throw new Error("Network error");
        },
    });

    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(message.textContent, "Could not load quizzes.");
});
