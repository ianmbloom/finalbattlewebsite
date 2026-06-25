import sharp from "sharp";
const home = "/tmp/fb-home.png";
const full = "/tmp/fb-full.png";
await sharp(home).extract({ left: 0, top: 0, width: 1280, height: 52 }).resize({ width: 1280 * 2 }).png().toFile("/tmp/crop-header.png");
await sharp(full).extract({ left: 0, top: 2400, width: 1280, height: 420 }).png().toFile("/tmp/crop-footer.png");
