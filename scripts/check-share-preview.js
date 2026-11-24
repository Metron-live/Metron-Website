const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const video = path.join(root, 'brand', 'brand preview', 'og-preview.mp4');
const poster = path.join(root, 'brand', 'brand preview', 'og-preview.png');

let probe;
try {
  probe = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,pix_fmt,r_frame_rate,duration',
    '-of', 'json',
    video
  ], { encoding: 'utf8' }));
} catch (error) {
  console.error('Unable to inspect the share preview. Install ffmpeg so ffprobe is available.');
  throw error;
}

assert.equal(probe.streams.length, 1, 'share preview must contain exactly one video stream');
const stream = probe.streams[0];
assert.equal(stream.codec_name, 'h264', 'share preview codec must be H.264');
assert.equal(stream.width, 720, 'share preview width must be 720px');
assert.equal(stream.height, 960, 'share preview height must be 960px');
assert.equal(stream.pix_fmt, 'yuv420p', 'share preview pixel format must be yuv420p');
assert.equal(stream.r_frame_rate, '30/1', 'share preview frame rate must be 30fps');
assert.ok(Math.abs(Number(stream.duration) - 11.2) < 0.01, 'share preview duration must be 11.2s');

const png = fs.readFileSync(poster);
assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG', 'share preview poster must be a PNG');
assert.equal(png.readUInt32BE(16), 720, 'share preview poster width must be 720px');
assert.equal(png.readUInt32BE(20), 960, 'share preview poster height must be 960px');

console.log('Share preview verified: H.264 yuv420p, 720x960, 30fps, 11.2s; poster 720x960 PNG.');
