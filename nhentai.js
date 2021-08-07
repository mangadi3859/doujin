const axios = require("axios").default;
const JsZip = require("jszip");

module.exports.test = async (id) => {
    return await axios.get("https://nhentai.net/api/gallery/" + id).data;
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
    zip.folder(res.title.pretty);
    let page = 1;

    let promises = res.images.pages.map((obj, i) =>
        axios.get(`https://i.nhentai.net/galleries/${res.media_id}/${i + 1}.jpg`, { responseType: "arraybuffer", timeout: 5000 }).catch((err) => {
            console.log(err.message);
            return null;
        }),
    );
    let devide = Math.floor(promises.length / 2);

    let resolved1 = await Promise.all(promises.slice(0, devide));
    let resolved2 = await Promise.all(promises.slice(devide, promises.length));
    // let resolve = await Promise.all(promises);

    [...resolved1, ...resolved2].forEach((buffer, index) => {
        if (!buffer) return;
        page++;
        let arraybuffer = Buffer.from(buffer.data);
        zip.file(`${res.title.pretty}/${index}.jpg`, arraybuffer.toString("base64"), { base64: true });
    });

    const finalFile = await zip.generateAsync({ type: "arraybuffer" });

    return {
        title: res.title.pretty,
        id: res.id,
        doujin: res,
        buffer: Buffer.from(finalFile),
    };
};
