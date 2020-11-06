const path = require('path');
const fs = require('fs');
const { execSync, exec } = require('child_process');
const { performance } = require('perf_hooks');
const picomatch = require('picomatch');

const reCurrentTime = /out_time_ms=(.*?)\s/;

class CTFB {
  constructor(bookPath, { title, pattern, output, bitrate }) {
    this.bookPath = bookPath;
    this.metadata = [];
    this.metaPath = path.join(bookPath, './metadata.txt');
    this.fileList = [];
    this.fileListPath = path.join(bookPath, './filelist.txt');
    this.title = title;
    this.pattern = picomatch(pattern);
    this.output = output;
    this.bitrate = bitrate;
    this.bookLength = 0;
  }

  async process(isInteractive) {
    await this.scan();
    /* Exit if no files found. */
    if (!this.fileList.length) {
      console.log('No files found.')
      process.exit(0);
    }

    console.log(`${this.fileList.length} input files found.`);
    console.log(`Total duration: ${this.constructor.toSexagesimal(this.bookLength)}`);

    /* Save metadata to text files. */
    fs.writeFileSync(this.metaPath, this.metadata.join('\n'));
    fs.writeFileSync(this.fileListPath, this.fileList.join('\n'));

    if (!isInteractive) {
      /* Start combining if in non-interactive mode. */
      await this.combine();
    } else {
      console.log(`Press [m] to open the generated metadata file.\nPress any other button to start creating the book.`)
      if (process.stdin.isTTY) process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding( 'utf8' );
      process.stdin.on('data', async (data) => {
        console.log(data);
        if (data === 'm') {
          process.stdout.write('Opening the metadata file...')
          exec(`${this.constructor.getCommandLine()} ${this.metaPath}`);
        } else {
          console.log('Generating the book...')
          await this.combine();
        }
      });
    }
  }

  async scan() {
    const { constructor } = this;
    const dir = await fs.promises.opendir(this.bookPath);
    this.metadata = [';FFMETADATA', `title=${this.title}`];
    let id = 0;
    for await (const file of dir) {
      const filename = file.name;
      if (this.pattern(filename)) {
        const filePath = path.join(dir.path, file.name);
        const chapterId = constructor.toDecimal(id);
        const chapterName = constructor.getChapterName(filename);
        const chapterStartTime = constructor.toSexagesimal(this.bookLength);
        this.metadata.push(`CHAPTER${chapterId}=${chapterStartTime}`, `CHAPTER${chapterId}NAME=${chapterName}`);
        this.bookLength += constructor.getDuration(filePath);
        const escapedFilePath = filePath.replace(/'/g, "'\\''");
        this.fileList.push(`file '${escapedFilePath}'`);
        id += 1;
      }
    }
  }

  async combine() {
    const start = performance.now();
    const totalTime = this.bookLength * 1e6;
    const ffmpeg = exec(`ffmpeg -y -hide_banner -loglevel 16 -progress - -f concat -safe 0 -i "${this.fileListPath}" -i "${this.metaPath}" -map_metadata 1 -b:a ${this.bitrate} "${this.output}"`);
    ffmpeg.stdout.on('data', (data) => {
      const match = reCurrentTime.exec(data);
      if (match) this.constructor.printProgress(match[1], totalTime, start);
    });
    ffmpeg.on('exit', () => {
      const end = performance.now();
      console.log(`\nTime Elapsed: ${this.constructor.toSexagesimal((end - start) / 1000)}`);

      // delete temporary files
      fs.unlinkSync(this.metaPath);
      fs.unlinkSync(this.fileListPath);

      process.exit(0);
    });
  }

  static toDecimal(number) {
    return number.toString().padStart(2, '0');
  }

  static toSexagesimal(time) {
    const milliseconds = (time * 1000) | 0;
    const hours = this.toDecimal((milliseconds / 36e5) | 0);
    let remainder = milliseconds % 36e5;
    const minutes = this.toDecimal((remainder / 6e4) | 0)
    remainder = remainder % 6e4;
    const seconds = this.toDecimal((remainder / 1e3) | 0);
    remainder = remainder % 1e3;
    return `${hours}:${minutes}:${seconds}.${remainder}`;
  }

  static getDuration(filePath) {
    const duration = execSync(`ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
    return parseFloat(duration);
  }

  static getChapterName(filename) {
    const extension = path.extname(filename);
    return filename.slice(0, filename.length - extension.length);
  }

  static printProgress(currentPosition, totalTime, startTime) {
    const fraction = parseInt(currentPosition, 10) / totalTime;
    const currentTime = performance.now();
    const progress = (fraction * 100).toFixed(3) + '%';
    const timeLeft = this.toSexagesimal(((currentTime - startTime) * ((1 / fraction) - 1)) / 1e3);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${progress}    Time left: ${timeLeft}`);
  }

  static getCommandLine() {
    switch (process.platform) {
      case 'darwin': return 'open';
      case 'win32': return 'start';
      default: return 'xdg-open';
    }
  }
}

module.exports = CTFB;
