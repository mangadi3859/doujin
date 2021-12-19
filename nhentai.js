const axios = require("axios").default;
// const JsZip = require("jszip");
const Pdf = require("pdfjs");

module.exports.test = async (id) => {
    let data = (await axios.get("https://nhentai.net/api/gallery/" + id)).data;
    let image;

    switch (data.images.pages[0].t) {
        case "j": {
            image = await axios.get(`https://i.nhentai.net/galleries/${data.media_id}/1.jpg`, { responseType: "arraybuffer" });
            break;
        }

        case "p": {
            image = await axios.get(`https://i2.nhentai.net/galleries/${data.media_id}/1.png`, { responseType: "arraybuffer" });
        }
    }

    data.thumb = `data:image/png;base64,${Buffer.from(image.data).toString("base64")}`;

    return data;
};

/**Turn nhentai into zip buffer
 *
 * @param {string} id - nhentai id
 */
module.exports.download = async (id, destination) => {
    if (!id) throw new TypeError("id is required");
    id = id.toString();
    // const zip = new JsZip();
    const regex = new RegExp(/^((?:https?:\/\/|www\.)?nhentai\.net\/g\/)?(\d+)/, "i");
    const code = id.match(regex);

    if (!code) throw new TypeError("Invalid id");
    id = id.replace(regex, "$2");
    let res = (await axios.get("https://nhentai.net/api/gallery/" + id)).data;

    if (!res || !res.images) throw new Error("Doujin not found");
    const folder = `[ISLA-DOUJIN] ${res.title.pretty} (${res.id})`;
    // zip.folder(folder);

    let promises = res.images.pages.map(async (obj, i) => {
        switch (obj.t) {
            case "j": {
                var buf = await axios.get(`https://i.nhentai.net/galleries/${res.media_id}/${i + 1}.jpg`, { responseType: "arraybuffer", timeout: 5000 }).catch((err) => {
                    console.log(err.message);
                    return null;
                });
                break;
            }

            case "p": {
                var buf = await axios.get(`https://i.nhentai.net/galleries/${res.media_id}/${i + 1}.png`, { responseType: "arraybuffer", timeout: 5000 }).catch((err) => {
                    console.log(err.message);
                    return null;
                });
                break;
            }
        }

        if (!buf) return null;
        try {
            let { h, w } = res.images.pages[i];
            let doc = new Pdf.Document({ height: h, width: w });
            doc.image(new Pdf.Image(Buffer.from(buf.data)), { align: "center" });

            return doc.asBuffer();
        }
        catch (err) {
            return null;
        }
    });

    let meta = { author: "isla", creator: "isla", subject: "Doujin", title: folder };
    let pdf = new Pdf.Document({ properties: meta });
    pdf.pipe(destination, { end: true });
    let resolve = await Promise.all(promises);

    resolve.forEach((buffer, index) => {
        if (!buffer) return;
        let image = new Pdf.ExternalDocument(buffer);
        pdf.addPagesOf(image);
    });

    pdf.end();
    // const finalFile = await zip.generateAsync({ type: "arraybuffer" });

    return;

    // return {
    //     title: res.title.pretty,
    //     id: res.id,
    //     doujin: res,
    //     buffer: Buffer.from(finalFile),
    // };
};
