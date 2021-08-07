import axios from "axios";

const btn = ducument.querySelector("[download-btn]");

btn.addEventListener("click", () => {
    axios.post("/download/isla", {
        id: doujinId,
    });
});
