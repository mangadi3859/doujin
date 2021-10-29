const axios = require("axios").default;
const JsZip = require("jszip");

module.exports.test = async (id) => {
    let data = (await axios.get("https://nhentai.net/api/gallery/" + id)).data;
    data.thumb = `https://i.nhentai.net/galleries/${data.media_id}/1.jpg`;

    return data;
};

/**Turn nhentai into zip buffer
 *
 * @param {string} id - nhentai id
 */
module.exports.download = async (id) => {
    if (!id) throw new TypeError("id is required");
    id = id.toString();
    const zip = new JsZip();
    const regex = new RegExp(/^((?:https?:\/\/|www\.)?nhentai\.net\/g\/)?(\d+)/, "i");
    const code = id.match(regex);

    if (!code) throw new TypeError("Invalid id");
    id = id.replace(regex, "$2");
    let res = (await axios.get("https://nhentai.net/api/gallery/" + id)).data;

    if (!res || !res.images) throw new Error("Doujin not found");
    const folder = `${res.title.pretty} (${res.id})`;
    zip.folder(folder);
    let page = 1;

    let promises = res.images.pages.map((obj, i) =>
        axios.get(`https://i.nhentai.net/galleries/${res.media_id}/${i + 1}.jpg`, { responseType: "arraybuffer", timeout: 5000 }).catch((err) => {
            console.log(err.message);
            return axios.get(`https://i2.nhentai.net/galleries/${res.media_id}/${i + 1}.jpg`, { responseType: "arraybuffer", timeout: 5000 }).catch((err) => {
                return null;
            });
        }),
    );

    let resolve = await Promise.all(promises);

    resolve.forEach((buffer, index) => {
        if (!buffer) return;
        page++;
        let arraybuffer = Buffer.from(buffer.data);
        zip.file(`${folder}/${index}.jpg`, arraybuffer.toString("base64"), { base64: true });
    });

    const finalFile = await zip.generateAsync({ type: "arraybuffer" });

    return {
        title: res.title.pretty,
        id: res.id,
        doujin: res,
        buffer: Buffer.from(finalFile),
    };
};
